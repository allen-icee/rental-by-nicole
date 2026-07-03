// src/types/database.ts
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type Table<Row, Insert = Partial<Row>, Update = Partial<Row>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: never[];
};

export type Database = {
  public: {
    Tables: {
      users: Table<{
        id: string;
        email: string;
        username: string;
        role: "owner";
        created_at: string;
        updated_at: string;
      }>;
      settings: Table<{
        id: string;
        email: string | null;
        secondary_email: string | null;
        facebook_url: string | null;
        instagram_url: string | null;
        business_hours: string | null;
        service_areas: string[];
        seo_title: string | null;
        seo_description: string | null;
        announcement_text: string | null;
        announcement_is_active: boolean;
        created_at: string;
        updated_at: string;
      }>;
      categories: Table<{
        id: string;
        name: string;
        slug: string;
        description: string | null;
        sort_order: number;
        is_active: boolean;
        created_at: string;
        updated_at: string;
      }>;
      tags: Table<{
        id: string;
        name: string;
        slug: string;
        sort_order: number;
        is_active: boolean;
        created_at: string;
        updated_at: string;
      }>;
      catalog_items: Table<{
        id: string;
        category_id: string | null;
        name: string;
        slug: string;
        description: string;
        availability_status: "available" | "reserved" | "unavailable";
        featured: boolean;
        is_new_arrival: boolean;
        price: number;
        rental_days: number;
        price_display: string | null;
        reel_url: string | null;
        archived_at: string | null;
        created_at: string;
        updated_at: string;
      }>;
      catalog_item_images: Table<{
        id: string;
        catalog_item_id: string;
        image_url: string;
        alt_text: string | null;
        variant: string;
        sort_order: number;
        created_at: string;
      }>;
      catalog_item_sizes: Table<{
        id: string;
        catalog_item_id: string;
        size_label: string;
        inventory_quantity: number;
        sort_order: number;
        created_at: string;
        updated_at: string;
      }>;
      catalog_item_measurements: Table<{
        id: string;
        catalog_item_size_id: string;
        bust: string | null;
        chest: string | null;
        waist: string | null;
        hips: string | null;
        length: string | null;
        notes: string | null;
        created_at: string;
        updated_at: string;
      }>;
      catalog_item_tags: Table<{
        catalog_item_id: string;
        tag_id: string;
      }>;
      availability_ranges: Table<{
        id: string;
        catalog_item_id: string;
        start_date: string | null;
        end_date: string | null;
        customer_name: string | null;
        label: string | null;
        notes: string | null;
        created_at: string;
        updated_at: string;
      }>;
      inquiries: Table<
        {
          id: string;
          name: string;
          phone: string;
          email: string | null;
          message: string;
          selected_item_id: string | null;
          status: "new" | "contacted" | "completed" | "archived";
          created_at: string;
          updated_at: string;
        },
        {
          name: string;
          phone: string;
          email?: string | null;
          message: string;
          selected_item_id?: string | null;
          status?: "new";
        }
      >;
      customer_reviews: Table<
        {
          id: string;
          name: string;
          rating: number;
          comment: string;
          photo_url: string | null;
          status: "pending" | "approved" | "rejected" | "archived";
          created_at: string;
          updated_at: string;
        },
        {
          name: string;
          rating: number;
          comment: string;
          photo_url?: string | null;
          status?: "pending";
        }
      >;
      faqs: Table<{
        id: string;
        category: string | null;
        question: string;
        answer: string;
        is_published: boolean;
        sort_order: number;
        created_at: string;
        updated_at: string;
      }>;
      rental_guides: Table<{
        id: string;
        title: string;
        body: string;
        is_published: boolean;
        sort_order: number;
        created_at: string;
        updated_at: string;
      }>;
      activity_logs: Table<{
        id: string;
        actor_id: string | null;
        action: string;
        entity_type: string;
        entity_id: string | null;
        metadata: Json;
        created_at: string;
      }>;
      rentals: Table<{
        id: string;
        tracking_number: string;
        date: string;
        customer_name: string;
        rented_items: { item_id: string; item_name: string; quantity: number; unit_price: number; amount: number }[];
        amount: number;
        total_income: number;
        status: "paid and verified" | "pending" | "unpaid";
        payment_method: string | null;
        created_at: string;
        updated_at: string;
      }>;
      page_views: Table<{
        id: string;
        path: string;
        session_id: string | null;
        created_at: string;
      }>;
    };
    Views: Record<string, never>;
    Functions: {
      is_owner: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      get_owner_email_for_login: {
        Args: { login_input: string };
        Returns: string | null;
      };
    };
    Enums: {
      app_role: "owner";
      catalog_item_status: "draft" | "published" | "archived";
      availability_status: "available" | "reserved" | "unavailable";
      inquiry_status: "new" | "contacted" | "completed" | "archived";
      review_status: "pending" | "approved" | "rejected" | "archived";
      rental_status: "paid and verified" | "pending" | "unpaid";
    };
    CompositeTypes: Record<string, never>;
  };
};

