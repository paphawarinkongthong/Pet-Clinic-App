// src/utils/supabase/client.ts

// 🟢 เปลี่ยนการอิมพอร์ตจาก @supabase/supabase-js
import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// ใช้ createBrowserClient จาก @supabase/ssr สำหรับการทำงานฝั่ง Client-Side
export const createClient = () => createBrowserClient(supabaseUrl, supabaseAnonKey)