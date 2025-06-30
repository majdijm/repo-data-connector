import express from 'express';
import { db } from '../database/init.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Get dashboard data based on user role
router.get('/', async (req, res) => {
  try {
    const dashboardData = {};

    switch (req.user.role) {
      case 'admin':
        dashboardData.stats = await getAdminStats();
        dashboardData.recentJobs = await getRecentJobs();
        dashboardData.teamWorkload = await getTeamWorkload();
        break;

      case 'receptionist':
        dashboardData.stats = await getReceptionistStats();
        dashboardData.upcomingSessions = await getUpcomingSessions();
        dashboardData.pendingPayments = await getPendingPayments();
        dashboardData.recentPayments = await getRecentPayments();
        break;

      case 'photographer':
      case 'designer':
      case 'editor':
        dashboardData.stats = await getTeamMemberStats(req.user.id, req.user.role);
        dashboardData.assignedJobs = await getAssignedJobs(req.user.id);
        dashboardData.todaysSessions = await getTodaysSessions(req.user.id);
        break;

      case 'client':
        const client = await db.getAsync('SELECT id FROM clients WHERE user_id = ?', [req.user.id]);
        if (client) {
          dashboardData.stats = await getClientStats(client.id);
          dashboardData.activeProjects = await getClientActiveProjects(client.id);
          dashboardData.completedProjects = await getClientCompletedProjects(client.id);
          dashboardData.payments = await getClientPayments(client.id);
          dashboardData.upcomingSessions = await getClientUpcomingSessions(client.id);
        }
        break;
    }

    res.json(dashboardData);
  } catch (error) {
    logger.error('Error fetching dashboard data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin dashboard functions
const getAdminStats = async () => {
  const totalJobs = await db.getAsync('SELECT COUNT(*) as count FROM jobs');
  const activeJobs = await db.getAsync('SELECT COUNT(*) as count FROM jobs WHERE status NOT IN ("completed", "delivered")');
  const totalClients = await db.getAsync('SELECT COUNT(*) as count FROM clients');
  const totalRevenue = await db.getAsync('SELECT SUM(amount) as total FROM payments');

  return {
    totalJobs: totalJobs.count,
    activeJobs: activeJobs.count,
    totalClients: totalClients.count,
    totalRevenue: totalRevenue.total || 0
  };
};

const getRecentJobs = async () => {
  return await db.allAsync(`
    SELECT j.*, c.name as client_name, u.name as assigned_to_name
    FROM jobs j
    LEFT JOIN clients c ON j.client_id = c.id
    LEFT JOIN users u ON j.assigned_to = u.id
    ORDER BY j.created_at DESC
    LIMIT 10
  `);
};

const getTeamWorkload = async () => {
  return await db.allAsync(`
    SELECT u.name, u.role, COUNT(j.id) as active_jobs
    FROM users u
    LEFT JOIN jobs j ON u.id = j.assigned_to AND j.status NOT IN ('completed', 'delivered')
    WHERE u.role IN ('photographer', 'designer', 'editor')
    GROUP BY u.id, u.name, u.role
    ORDER BY active_jobs DESC
  `);
};

// Receptionist dashboard functions
const getReceptionistStats = async () => {
  const todaysSessions = await db.getAsync(`
    SELECT COUNT(*) as count FROM jobs 
    WHERE type = 'photo_session' 
    AND DATE(session_date) = DATE('now')
  `);
  
  const activeClients = await db.getAsync('SELECT COUNT(*) as count FROM clients');
  const pendingPayments = await db.getAsync('SELECT COUNT(*) as count FROM clients WHERE total_due > 0');
  const thisMonthRevenue = await db.getAsync(`
    SELECT SUM(amount) as total FROM payments 
    WHERE strftime('%Y-%m', recorded_at) = strftime('%Y-%m', 'now')
  `);

  return {
    todaysSessions: todaysSessions.count,
    activeClients: activeClients.count,
    pendingPayments: pendingPayments.count,
    thisMonthRevenue: thisMonthRevenue.total || 0
  };
};

const getUpcomingSessions = async () => {
  return await db.allAsync(`
    SELECT j.*, c.name as client_name
    FROM jobs j
    LEFT JOIN clients c ON j.client_id = c.id
    WHERE j.type = 'photo_session' 
    AND j.session_date > datetime('now')
    ORDER BY j.session_date ASC
    LIMIT 10
  `);
};

const getPendingPayments = async () => {
  return await db.allAsync(`
    SELECT * FROM clients 
    WHERE total_due > 0
    ORDER BY total_due DESC
  `);
};

const getRecentPayments = async () => {
  return await db.allAsync(`
    SELECT p.*, c.name as client_name
    FROM payments p
    LEFT JOIN clients c ON p.client_id = c.id
    ORDER BY p.recorded_at DESC
    LIMIT 5
  `);
};

// Team member dashboard functions
const getTeamMemberStats = async (userId, role) => {
  const activeTasks = await db.getAsync(`
    SELECT COUNT(*) as count FROM jobs 
    WHERE assigned_to = ? AND status IN ('pending', 'in_progress')
  `, [userId]);

  const reviewTasks = await db.getAsync(`
    SELECT COUNT(*) as count FROM jobs 
    WHERE assigned_to = ? AND status = 'review'
  `, [userId]);

  const completedTasks = await db.getAsync(`
    SELECT COUNT(*) as count FROM jobs 
    WHERE assigned_to = ? AND status IN ('completed', 'delivered')
  `, [userId]);

  const filesDelivered = await db.getAsync(`
    SELECT COUNT(*) as count FROM job_files 
    WHERE uploaded_by = ?
  `, [userId]);

  return {
    activeTasks: activeTasks.count,
    reviewTasks: reviewTasks.count,
    completedTasks: completedTasks.count,
    filesDelivered: filesDelivered.count
  };
};

const getAssignedJobs = async (userId) => {
  return await db.allAsync(`
    SELECT j.*, c.name as client_name
    FROM jobs j
    LEFT JOIN clients c ON j.client_id = c.id
    WHERE j.assigned_to = ?
    ORDER BY j.due_date ASC
  `, [userId]);
};

const getTodaysSessions = async (userId) => {
  return await db.allAsync(`
    SELECT j.*, c.name as client_name
    FROM jobs j
    LEFT JOIN clients c ON j.client_id = c.id
    WHERE j.assigned_to = ? 
    AND j.type = 'photo_session'
    AND DATE(j.session_date) = DATE('now')
    ORDER BY j.session_date ASC
  `, [userId]);
};

// Client dashboard functions
const getClientStats = async (clientId) => {
  const activeProjects = await db.getAsync(`
    SELECT COUNT(*) as count FROM jobs 
    WHERE client_id = ? AND status NOT IN ('completed', 'delivered')
  `, [clientId]);

  const completedProjects = await db.getAsync(`
    SELECT COUNT(*) as count FROM jobs 
    WHERE client_id = ? AND status IN ('completed', 'delivered')
  `, [clientId]);

  const totalPaid = await db.getAsync(`
    SELECT SUM(amount) as total FROM payments 
    WHERE client_id = ?
  `, [clientId]);

  const balanceDue = await db.getAsync(`
    SELECT total_due FROM clients WHERE id = ?
  `, [clientId]);

  return {
    activeProjects: activeProjects.count,
    completedProjects: completedProjects.count,
    totalPaid: totalPaid.total || 0,
    balanceDue: balanceDue ? balanceDue.total_due : 0
  };
};

const getClientActiveProjects = async (clientId) => {
  return await db.allAsync(`
    SELECT j.*, u.name as assigned_to_name
    FROM jobs j
    LEFT JOIN users u ON j.assigned_to = u.id
    WHERE j.client_id = ? AND j.status NOT IN ('completed', 'delivered')
    ORDER BY j.due_date ASC
  `, [clientId]);
};

const getClientCompletedProjects = async (clientId) => {
  return await db.allAsync(`
    SELECT j.*, u.name as assigned_to_name
    FROM jobs j
    LEFT JOIN users u ON j.assigned_to = u.id
    WHERE j.client_id = ? AND j.status IN ('completed', 'delivered')
    ORDER BY j.updated_at DESC
  `, [clientId]);
};

const getClientPayments = async (clientId) => {
  return await db.allAsync(`
    SELECT p.*, j.title as job_title
    FROM payments p
    LEFT JOIN jobs j ON p.job_id = j.id
    WHERE p.client_id = ?
    ORDER BY p.recorded_at DESC
    LIMIT 10
  `, [clientId]);
};

const getClientUpcomingSessions = async (clientId) => {
  return await db.allAsync(`
    SELECT j.*, u.name as assigned_to_name
    FROM jobs j
    LEFT JOIN users u ON j.assigned_to = u.id
    WHERE j.client_id = ? 
    AND j.session_date > datetime('now')
    ORDER BY j.session_date ASC
  `, [clientId]);
};

export default router;