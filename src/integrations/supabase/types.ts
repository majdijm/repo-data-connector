export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          id: string
          resource_id: string | null
          resource_type: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          id?: string
          resource_id?: string | null
          resource_type: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          resource_id?: string | null
          resource_type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance: {
        Row: {
          check_in_time: string
          check_out_time: string | null
          created_at: string
          id: string
          notes: string | null
          updated_at: string
          user_id: string
          work_date: string
        }
        Insert: {
          check_in_time?: string
          check_out_time?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          updated_at?: string
          user_id: string
          work_date?: string
        }
        Update: {
          check_in_time?: string
          check_out_time?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          updated_at?: string
          user_id?: string
          work_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_events: {
        Row: {
          created_at: string
          description: string | null
          end_date: string
          event_type: string
          id: string
          job_id: string | null
          start_date: string
          status: string
          title: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_date: string
          event_type?: string
          id?: string
          job_id?: string | null
          start_date: string
          status?: string
          title: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          end_date?: string
          event_type?: string
          id?: string
          job_id?: string | null
          start_date?: string
          status?: string
          title?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "calendar_events_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      client_contracts: {
        Row: {
          client_id: string
          contract_name: string
          created_at: string
          file_path: string
          file_size: number
          id: string
          updated_at: string
          uploaded_by: string
        }
        Insert: {
          client_id: string
          contract_name: string
          created_at?: string
          file_path: string
          file_size: number
          id?: string
          updated_at?: string
          uploaded_by: string
        }
        Update: {
          client_id?: string
          contract_name?: string
          created_at?: string
          file_path?: string
          file_size?: number
          id?: string
          updated_at?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_packages: {
        Row: {
          client_id: string
          created_at: string
          end_date: string
          id: string
          is_active: boolean
          package_id: string
          start_date: string
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          end_date: string
          id?: string
          is_active?: boolean
          package_id: string
          start_date?: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          end_date?: string
          id?: string
          is_active?: boolean
          package_id?: string
          start_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_packages_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_packages_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          address: string | null
          created_at: string | null
          email: string
          id: string
          name: string
          phone: string | null
          total_due: number | null
          total_paid: number | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          email: string
          id?: string
          name: string
          phone?: string | null
          total_due?: number | null
          total_paid?: number | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          phone?: string | null
          total_due?: number | null
          total_paid?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      contracts: {
        Row: {
          client_id: string
          contract_type: string
          created_at: string
          expiry_date: string | null
          file_name: string
          file_path: string
          file_size: number
          id: string
          signed_date: string | null
          status: string
          updated_at: string
          uploaded_by: string
        }
        Insert: {
          client_id: string
          contract_type: string
          created_at?: string
          expiry_date?: string | null
          file_name: string
          file_path: string
          file_size: number
          id?: string
          signed_date?: string | null
          status?: string
          updated_at?: string
          uploaded_by: string
        }
        Update: {
          client_id?: string
          contract_type?: string
          created_at?: string
          expiry_date?: string | null
          file_name?: string
          file_path?: string
          file_size?: number
          id?: string
          signed_date?: string | null
          status?: string
          updated_at?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      expense_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          category: string
          category_id: string | null
          created_at: string
          date: string
          description: string
          id: string
          receipt_file_path: string | null
          recorded_by: string
          updated_at: string
        }
        Insert: {
          amount: number
          category: string
          category_id?: string | null
          created_at?: string
          date: string
          description: string
          id?: string
          receipt_file_path?: string | null
          recorded_by: string
          updated_at?: string
        }
        Update: {
          amount?: number
          category?: string
          category_id?: string | null
          created_at?: string
          date?: string
          description?: string
          id?: string
          receipt_file_path?: string | null
          recorded_by?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "expense_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback: {
        Row: {
          client_id: string | null
          content: string
          created_at: string | null
          id: string
          job_id: string | null
          rating: number | null
        }
        Insert: {
          client_id?: string | null
          content: string
          created_at?: string | null
          id?: string
          job_id?: string | null
          rating?: number | null
        }
        Update: {
          client_id?: string | null
          content?: string
          created_at?: string | null
          id?: string
          job_id?: string | null
          rating?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "feedback_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedback_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_summary: {
        Row: {
          client_id: string | null
          created_at: string
          id: string
          individual_job_revenue: number | null
          month_year: string
          package_revenue: number | null
          total_billed: number | null
          total_paid: number | null
          total_pending: number | null
          updated_at: string
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          id?: string
          individual_job_revenue?: number | null
          month_year: string
          package_revenue?: number | null
          total_billed?: number | null
          total_paid?: number | null
          total_pending?: number | null
          updated_at?: string
        }
        Update: {
          client_id?: string | null
          created_at?: string
          id?: string
          individual_job_revenue?: number | null
          month_year?: string
          package_revenue?: number | null
          total_billed?: number | null
          total_paid?: number | null
          total_pending?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_summary_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      job_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          job_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          job_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          job_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_comments_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      job_files: {
        Row: {
          cloud_link: string | null
          created_at: string | null
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id: string
          is_cloud_link: boolean | null
          is_final: boolean | null
          job_id: string | null
          uploaded_by: string | null
        }
        Insert: {
          cloud_link?: string | null
          created_at?: string | null
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id?: string
          is_cloud_link?: boolean | null
          is_final?: boolean | null
          job_id?: string | null
          uploaded_by?: string | null
        }
        Update: {
          cloud_link?: string | null
          created_at?: string | null
          file_name?: string
          file_path?: string
          file_size?: number
          file_type?: string
          id?: string
          is_cloud_link?: boolean | null
          is_final?: boolean | null
          job_id?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_files_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_files_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          assigned_to: string | null
          client_id: string | null
          created_at: string | null
          created_by: string | null
          current_workflow_stage: string | null
          depends_on_job_id: string | null
          description: string | null
          due_date: string | null
          extra_cost: number | null
          extra_cost_reason: string | null
          id: string
          original_assigned_to: string | null
          package_included: boolean | null
          price: number | null
          session_date: string | null
          status: string
          title: string
          type: string
          updated_at: string | null
          workflow_history: Json | null
          workflow_order: number | null
          workflow_stage: string | null
          workflow_stages: Json | null
        }
        Insert: {
          assigned_to?: string | null
          client_id?: string | null
          created_at?: string | null
          created_by?: string | null
          current_workflow_stage?: string | null
          depends_on_job_id?: string | null
          description?: string | null
          due_date?: string | null
          extra_cost?: number | null
          extra_cost_reason?: string | null
          id?: string
          original_assigned_to?: string | null
          package_included?: boolean | null
          price?: number | null
          session_date?: string | null
          status: string
          title: string
          type: string
          updated_at?: string | null
          workflow_history?: Json | null
          workflow_order?: number | null
          workflow_stage?: string | null
          workflow_stages?: Json | null
        }
        Update: {
          assigned_to?: string | null
          client_id?: string | null
          created_at?: string | null
          created_by?: string | null
          current_workflow_stage?: string | null
          depends_on_job_id?: string | null
          description?: string | null
          due_date?: string | null
          extra_cost?: number | null
          extra_cost_reason?: string | null
          id?: string
          original_assigned_to?: string | null
          package_included?: boolean | null
          price?: number | null
          session_date?: string | null
          status?: string
          title?: string
          type?: string
          updated_at?: string | null
          workflow_history?: Json | null
          workflow_order?: number | null
          workflow_stage?: string | null
          workflow_stages?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "jobs_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_depends_on_job_id_fkey"
            columns: ["depends_on_job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_original_assigned_to_fkey"
            columns: ["original_assigned_to"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          related_job_id: string | null
          title: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          related_job_id?: string | null
          title: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          related_job_id?: string | null
          title?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_related_job_id_fkey"
            columns: ["related_job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      package_services: {
        Row: {
          created_at: string
          description: string | null
          id: string
          package_id: string
          quantity_included: number
          service_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          package_id: string
          quantity_included?: number
          service_type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          package_id?: string
          quantity_included?: number
          service_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "package_services_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
        ]
      }
      package_usage: {
        Row: {
          client_package_id: string
          created_at: string
          id: string
          job_id: string
          quantity_used: number
          service_type: string
          usage_date: string
        }
        Insert: {
          client_package_id: string
          created_at?: string
          id?: string
          job_id: string
          quantity_used?: number
          service_type: string
          usage_date?: string
        }
        Update: {
          client_package_id?: string
          created_at?: string
          id?: string
          job_id?: string
          quantity_used?: number
          service_type?: string
          usage_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "package_usage_client_package_id_fkey"
            columns: ["client_package_id"]
            isOneToOne: false
            referencedRelation: "client_packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "package_usage_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      packages: {
        Row: {
          created_at: string
          description: string | null
          duration_months: number
          id: string
          is_active: boolean
          name: string
          price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_months: number
          id?: string
          is_active?: boolean
          name: string
          price: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_months?: number
          id?: string
          is_active?: boolean
          name?: string
          price?: number
          updated_at?: string
        }
        Relationships: []
      }
      payment_requests: {
        Row: {
          amount: number
          client_id: string
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          paid_amount: number | null
          requested_by: string
          status: string
          updated_at: string
        }
        Insert: {
          amount: number
          client_id: string
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          paid_amount?: number | null
          requested_by: string
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          client_id?: string
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          paid_amount?: number | null
          requested_by?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_requests_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          client_id: string | null
          created_at: string | null
          id: string
          job_id: string | null
          notes: string | null
          payment_date: string | null
          payment_method: string
          received_by: string | null
        }
        Insert: {
          amount: number
          client_id?: string | null
          created_at?: string | null
          id?: string
          job_id?: string | null
          notes?: string | null
          payment_date?: string | null
          payment_method: string
          received_by?: string | null
        }
        Update: {
          amount?: number
          client_id?: string | null
          created_at?: string | null
          id?: string
          job_id?: string | null
          notes?: string | null
          payment_date?: string | null
          payment_method?: string
          received_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_received_by_fkey"
            columns: ["received_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      salaries: {
        Row: {
          base_salary: number
          bonus: number | null
          created_at: string
          created_by: string
          effective_date: string
          id: string
          notes: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          base_salary: number
          bonus?: number | null
          created_at?: string
          created_by: string
          effective_date?: string
          id?: string
          notes?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          base_salary?: number
          bonus?: number | null
          created_at?: string
          created_by?: string
          effective_date?: string
          id?: string
          notes?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          avatar: string | null
          created_at: string | null
          email: string
          id: string
          is_active: boolean | null
          language: string | null
          name: string
          password: string
          role: string
          updated_at: string | null
        }
        Insert: {
          avatar?: string | null
          created_at?: string | null
          email: string
          id?: string
          is_active?: boolean | null
          language?: string | null
          name: string
          password: string
          role: string
          updated_at?: string | null
        }
        Update: {
          avatar?: string | null
          created_at?: string | null
          email?: string
          id?: string
          is_active?: boolean | null
          language?: string | null
          name?: string
          password?: string
          role?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      initialize_job_workflow: {
        Args: { job_id: string; stages: Json }
        Returns: undefined
      }
      sync_existing_user: {
        Args: { auth_user_id: string; user_email: string }
        Returns: boolean
      }
      update_job_workflow: {
        Args: { job_id: string; new_assigned_to: string; new_status: string }
        Returns: undefined
      }
      update_job_workflow_stage: {
        Args: {
          job_id: string
          new_assigned_to: string
          new_stage: string
          stage_notes?: string
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
