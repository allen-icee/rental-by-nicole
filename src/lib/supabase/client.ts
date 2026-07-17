// src/lib/supabase/client.ts
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables.");
}

// Custom storage adapter that falls back to memory if localStorage is blocked
// This is critical for Facebook/Instagram in-app browsers
const customStorageAdapter = {
  memoryStorage: new Map<string, string>(),
  getItem: (key: string) => {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        return window.localStorage.getItem(key);
      }
    } catch (error) {
      console.warn("localStorage is disabled or restricted. Falling back to memory storage.");
    }
    return customStorageAdapter.memoryStorage.get(key) || null;
  },
  setItem: (key: string, value: string) => {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem(key, value);
        return;
      }
    } catch (error) {
      // Ignore
    }
    customStorageAdapter.memoryStorage.set(key, value);
  },
  removeItem: (key: string) => {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.removeItem(key);
        return;
      }
    } catch (error) {
      // Ignore
    }
    customStorageAdapter.memoryStorage.delete(key);
  },
};

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: customStorageAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});
