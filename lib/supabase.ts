import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string
          email: string
          startup_name: string | null
          stage: string | null
          tagline: string | null
          areas_of_help: string[] | null
          token_balance: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          startup_name?: string | null
          stage?: string | null
          tagline?: string | null
          areas_of_help?: string[] | null
          token_balance?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          startup_name?: string | null
          stage?: string | null
          tagline?: string | null
          areas_of_help?: string[] | null
          token_balance?: number
          created_at?: string
        }
      }
      startups: {
        Row: {
          id: string
          user_id: string
          name: string
          tagline: string | null
          stage: string | null
          support_count: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          tagline?: string | null
          stage?: string | null
          support_count?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          tagline?: string | null
          stage?: string | null
          support_count?: number
          created_at?: string
        }
      }
      posts: {
        Row: {
          id: string
          user_id: string
          title: string
          body: string
          tags: string[] | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          body: string
          tags?: string[] | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          body?: string
          tags?: string[] | null
          created_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          post_id: string
          user_id: string
          parent_comment_id: string | null
          body: string
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          parent_comment_id?: string | null
          body: string
          created_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          parent_comment_id?: string | null
          body?: string
          created_at?: string
        }
      }
      grants: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string
          amount_requested: number
          stake_count: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description: string
          amount_requested: number
          stake_count?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string
          amount_requested?: number
          stake_count?: number
          created_at?: string
        }
      }
      stakes: {
        Row: {
          id: string
          grant_id: string
          user_id: string
          amount: number
          created_at: string
        }
        Insert: {
          id?: string
          grant_id: string
          user_id: string
          amount: number
          created_at?: string
        }
        Update: {
          id?: string
          grant_id?: string
          user_id?: string
          amount?: number
          created_at?: string
        }
      }
      pitches: {
        Row: {
          id: string
          user_id: string
          content: string
          clarity_score: number | null
          suggestions: string[] | null
          local_tips: string[] | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          content: string
          clarity_score?: number | null
          suggestions?: string[] | null
          local_tips?: string[] | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          content?: string
          clarity_score?: number | null
          suggestions?: string[] | null
          local_tips?: string[] | null
          created_at?: string
        }
      }
    }
  }
}
