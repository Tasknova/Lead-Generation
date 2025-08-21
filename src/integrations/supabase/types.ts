export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      business_profiles: {
        Row: {
          business_goal: string | null
          business_name: string
          created_at: string
          employee_count: number | null
          id: string
          industry: Database["public"]["Enums"]["industry_type"]
          phone_no: string | null
          referral_sources: Database["public"]["Enums"]["referral_source"][]
          role: Database["public"]["Enums"]["role_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          business_goal?: string | null
          business_name: string
          created_at?: string
          employee_count?: number | null
          id?: string
          industry: Database["public"]["Enums"]["industry_type"]
          phone_no?: string | null
          referral_sources?: Database["public"]["Enums"]["referral_source"][]
          role: Database["public"]["Enums"]["role_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          business_goal?: string | null
          business_name?: string
          created_at?: string
          employee_count?: number | null
          id?: string
          industry?: Database["public"]["Enums"]["industry_type"]
          phone_no?: string | null
          referral_sources?: Database["public"]["Enums"]["referral_source"][]
          role?: Database["public"]["Enums"]["role_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      lead_requests: {
        Row: {
          created_at: string | null
          downloadable_url: string | null
          id: string
          is_free_request: boolean | null
          json_data: Json | null
          json_url: string | null
          lead_description: string
          status: string
          user_email: string
          user_id: string | null
          user_name: string | null
        }
        Insert: {
          created_at?: string | null
          downloadable_url?: string | null
          id?: string
          is_free_request?: boolean | null
          json_data?: Json | null
          json_url?: string | null
          lead_description: string
          status?: string
          user_email: string
          user_id?: string | null
          user_name?: string | null
        }
        Update: {
          created_at?: string | null
          downloadable_url?: string | null
          id?: string
          is_free_request?: boolean | null
          json_data?: Json | null
          json_url?: string | null
          lead_description?: string
          status?: string
          user_email?: string
          user_id?: string | null
          user_name?: string | null
        }
        Relationships: []
      }
      notion_templates: {
        Row: {
          Categories: string | null
          cover_photo: string | null
          created_at: string | null
          face_photo: string | null
          price_usd: number
          short_description: string | null
          template_description: string | null
          template_id: string
          template_name: string
        }
        Insert: {
          Categories?: string | null
          cover_photo?: string | null
          created_at?: string | null
          face_photo?: string | null
          price_usd: number
          short_description?: string | null
          template_description?: string | null
          template_id?: string
          template_name: string
        }
        Update: {
          Categories?: string | null
          cover_photo?: string | null
          created_at?: string | null
          face_photo?: string | null
          price_usd?: number
          short_description?: string | null
          template_description?: string | null
          template_id?: string
          template_name?: string
        }
        Relationships: []
      }
      payment_orders: {
        Row: {
          id: string
          user_id: string
          user_email: string
          package_id: string
          amount: number
          currency: string
          status: string
          payment_id: string | null
          signature: string | null
          leads_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          user_email: string
          package_id: string
          amount: number
          currency?: string
          status?: string
          payment_id?: string | null
          signature?: string | null
          leads_count: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          user_email?: string
          package_id?: string
          amount?: number
          currency?: string
          status?: string
          payment_id?: string | null
          signature?: string | null
          leads_count?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          free_leads_used: boolean | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          free_leads_used?: boolean | null
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          free_leads_used?: boolean | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      gmail_credentials: {
        Row: {
          id: string
          user_id: string
          access_token: string | null
          refresh_token: string | null
          token_expires_at: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          access_token?: string | null
          refresh_token?: string | null
          token_expires_at?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          access_token?: string | null
          refresh_token?: string | null
          token_expires_at?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "gmail_credentials_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      templates: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          html_content: string
          is_default: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          html_content: string
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          html_content?: string
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "templates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      contact_lists: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          total_contacts: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          total_contacts?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          total_contacts?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_lists_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      contacts: {
        Row: {
          id: string
          user_id: string
          list_id: string
          email: string
          first_name: string | null
          last_name: string | null
          custom_fields: Json
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          list_id: string
          email: string
          first_name?: string | null
          last_name?: string | null
          custom_fields?: Json
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          list_id?: string
          email?: string
          first_name?: string | null
          last_name?: string | null
          custom_fields?: Json
          status?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contacts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contacts_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "contact_lists"
            referencedColumns: ["id"]
          }
        ]
      }
      campaigns: {
        Row: {
          id: string
          user_id: string
          name: string
          subject: string
          html_content: string
          text_content: string | null
          from_name: string
          from_email: string
          reply_to_email: string | null
          status: string
          list_id: string | null
          template_id: string | null
          scheduled_at: string | null
          sent_at: string | null
          total_recipients: number
          total_sent: number
          total_delivered: number
          total_bounced: number
          total_opened: number
          total_clicked: number
          total_unsubscribed: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          subject: string
          html_content: string
          text_content?: string | null
          from_name: string
          from_email: string
          reply_to_email?: string | null
          status?: string
          list_id?: string | null
          template_id?: string | null
          scheduled_at?: string | null
          sent_at?: string | null
          total_recipients?: number
          total_sent?: number
          total_delivered?: number
          total_bounced?: number
          total_opened?: number
          total_clicked?: number
          total_unsubscribed?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          subject?: string
          html_content?: string
          text_content?: string | null
          from_name?: string
          from_email?: string
          reply_to_email?: string | null
          status?: string
          list_id?: string | null
          template_id?: string | null
          scheduled_at?: string | null
          sent_at?: string | null
          total_recipients?: number
          total_sent?: number
          total_delivered?: number
          total_bounced?: number
          total_opened?: number
          total_clicked?: number
          total_unsubscribed?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaigns_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "contact_lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaigns_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "templates"
            referencedColumns: ["id"]
          }
        ]
      }
      campaign_sends: {
        Row: {
          id: string
          campaign_id: string
          contact_id: string
          email: string
          status: string
          opened_at: string | null
          clicked_at: string | null
          unsubscribed_at: string | null
          error_message: string | null
          sent_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          campaign_id: string
          contact_id: string
          email: string
          status?: string
          opened_at?: string | null
          clicked_at?: string | null
          unsubscribed_at?: string | null
          error_message?: string | null
          sent_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          campaign_id?: string
          contact_id?: string
          email?: string
          status?: string
          opened_at?: string | null
          clicked_at?: string | null
          unsubscribed_at?: string | null
          error_message?: string | null
          sent_at?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_sends_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_sends_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      industry_type:
        | "tech"
        | "finance"
        | "health"
        | "education"
        | "retail"
        | "manufacturing"
        | "consulting"
        | "marketing"
        | "other"
      referral_source:
        | "google"
        | "youtube"
        | "friend"
        | "newsletter"
        | "social_media"
        | "advertisement"
        | "other"
      role_type:
        | "founder"
        | "developer"
        | "marketer"
        | "student"
        | "manager"
        | "consultant"
        | "other"
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
    Enums: {
      industry_type: [
        "tech",
        "finance",
        "health",
        "education",
        "retail",
        "manufacturing",
        "consulting",
        "marketing",
        "other",
      ],
      referral_source: [
        "google",
        "youtube",
        "friend",
        "newsletter",
        "social_media",
        "advertisement",
        "other",
      ],
      role_type: [
        "founder",
        "developer",
        "marketer",
        "student",
        "manager",
        "consultant",
        "other",
      ],
    },
  },
} as const
