import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import "react-native-url-polyfill/auto";

const SUPABASE_URL = "https://plfpdyusyzvmagwrjljb.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_T-GXvyQAMaxIn99CbnJIIg_DMnntLF2";

const storageSegura = {
  getItem: (key: string) => {
    if (typeof window === "undefined") return Promise.resolve(null);
    return AsyncStorage.getItem(key);
  },
  setItem: (key: string, value: string) => {
    if (typeof window === "undefined") return Promise.resolve();
    return AsyncStorage.setItem(key, value);
  },
  removeItem: (key: string) => {
    if (typeof window === "undefined") return Promise.resolve();
    return AsyncStorage.removeItem(key);
  },
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: storageSegura,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});