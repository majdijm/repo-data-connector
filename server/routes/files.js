import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { db } from '../database/init.js';
import logger from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const jobId = req.params.jobId;
    const jobDir = path.join(uploadsDir, `job_${jobId}`);
    
    if (!fs.existsSync(jobDir)) {
      fs.mkdirSync(jobDir, { recursive: true });
    }
    
    cb(null, jobDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  // Allow images, videos, and common design files
  const allowedTypes = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/tiff',
    'video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/flv',
    'application/pdf', 'application/zip', 'application/x-rar-compressed',
    'application/vnd.adobe.photoshop', 'application/postscript'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('File type not allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  }
});

// Upload files to job
router.post('/job/:jobId/upload', upload.array('files', 10), async (req, res) => {
  try {
    const { jobId } = req.params;
    const { file_type } = req.body;

    // Verify job exists and user has permission
    const job = await db.getAsync('SELECT * FROM jobs WHERE id = ?', [jobId]);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Check permissions
    if (req.user.role === 'client') {
      const client = await db.getAsync('SELECT id FROM clients WHERE user_id = ?', [req.user.id]);
      if (!client || client.id !== job.client_id) {
        return res.status(403).json({ error: 'Access denied' });
      }
    } else if (['photographer', 'designer', 'editor'].includes(req.user.role) && job.assigned_to !== req.user.id) {
      return res.status(403).json({ error: 'You can only upload files to jobs assigned to you' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const uploadedFiles = [];

    for (const file of req.files) {
      const result = await db.runAsync(`
        INSERT INTO job_files (job_id, filename, original_name, file_path, file_type, file_size, mime_type, uploaded_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        jobId,
        file.filename,
        file.originalname,
        file.path,
        file_type || 'raw',
        file.size,
        file.mimetype,
        req.user.id
      ]);

      uploadedFiles.push({
        id: result.lastID,
        filename: file.filename,
        original_name: file.originalname,
        file_size: file.size,
        mime_type: file.mimetype
      });
    }

    // Create notification for client if files uploaded by team member
    if (['photographer', 'designer', 'editor'].includes(req.user.role)) {
      const client = await db.getAsync('SELECT user_id FROM clients WHERE id = ?', [job.client_id]);
      if (client && client.user_id) {
        await db.runAsync(`
          INSERT INTO notifications (user_id, title, message, type, related_job_id)
          VALUES (?, ?, ?, ?, ?)
        `, [client.user_id, 'Files Uploaded', `New files have been uploaded for your job: ${job.title}`, 'info', jobId]);
      }
    }

    // Log activity
    await db.runAsync(
      'INSERT INTO activity_logs (user_id, action, resource_type, resource_id, details) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, 'upload', 'file', jobId, `Uploaded ${req.files.length} files to job: ${job.title}`]
    );

    logger.info(`${req.files.length} files uploaded to job ${jobId} by ${req.user.email}`);

    res.status(201).json({
      message: 'Files uploaded successfully',
      files: uploadedFiles
    });
  } catch (error) {
    logger.error('Error uploading files:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get files for job
router.get('/job/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;

    // Verify job exists and user has permission
    const job = await db.getAsync('SELECT * FROM jobs WHERE id = ?', [jobId]);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Check permissions
    if (req.user.role === 'client') {
      const client = await db.getAsync('SELECT id FROM clients WHERE user_id = ?', [req.user.id]);
      if (!client || client.id !== job.client_id) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    const files = await db.allAsync(`
      SELECT jf.*, u.name as uploaded_by_name
      FROM job_files jf
      LEFT JOIN users u ON jf.uploaded_by = u.id
      WHERE jf.job_id = ?
      ORDER BY jf.uploaded_at DESC
    `, [jobId]);

    res.json(files);
  } catch (error) {
    logger.error('Error fetching job files:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Download file
router.get('/download/:fileId', async (req, res) => {
  try {
    const file = await db.getAsync(`
      SELECT jf.*, j.client_id, j.assigned_to
      FROM job_files jf
      LEFT JOIN jobs j ON jf.job_id = j.id
      WHERE jf.id = ?
    `, [req.params.fileId]);

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Check permissions
    if (req.user.role === 'client') {
      const client = await db.getAsync('SELECT id FROM clients WHERE user_id = ?', [req.user.id]);
      if (!client || client.id !== file.client_id) {
        return res.status(403).json({ error: 'Access denied' });
      }
    } else if (['photographer', 'designer', 'editor'].includes(req.user.role) && file.assigned_to !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (!fs.existsSync(file.file_path)) {
      return res.status(404).json({ error: 'File not found on disk' });
    }

    // Log download activity
    await db.runAsync(
      'INSERT INTO activity_logs (user_id, action, resource_type, resource_id, details) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, 'download', 'file', req.params.fileId, `Downloaded file: ${file.original_name}`]
    );

    res.download(file.file_path, file.original_name);
  } catch (error) {
    logger.error('Error downloading file:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete file
router.delete('/:fileId', async (req, res) => {
  try {
    const file = await db.getAsync(`
      SELECT jf.*, j.client_id, j.assigned_to
      FROM job_files jf
      LEFT JOIN jobs j ON jf.job_id = j.id
      WHERE jf.id = ?
    `, [req.params.fileId]);

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Check permissions - only uploader, admin, or receptionist can delete
    if (!['admin', 'receptionist'].includes(req.user.role) && file.uploaded_by !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Delete from database
    await db.runAsync('DELETE FROM job_files WHERE id = ?', [req.params.fileId]);

    // Delete from filesystem
    if (fs.existsSync(file.file_path)) {
      fs.unlinkSync(file.file_path);
    }

    logger.info(`File ${req.params.fileId} deleted by ${req.user.email}`);

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    logger.error('Error deleting file:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;