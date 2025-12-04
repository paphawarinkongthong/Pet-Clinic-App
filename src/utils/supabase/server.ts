// src/utils/supabase/server.ts

import { createServerClient, type CookieOptions } from '@supabase/ssr'
// 🔴 ลบ: ไม่ต้อง import cookies เพราะฟังก์ชันจะรับ cookieStore จากภายนอก
// import { cookies } from 'next/headers' 

// 🟢 ฟังก์ชันนี้สำหรับสร้าง Supabase Client ใน Server Component, Server Action, หรือ Route Handler
// โดยรับ 'cookieStore' ที่ถูกสร้างจาก cookies() ใน Next.js มาเป็น Argument
export const createServer = (cookieStore: any) => { // 💡 ใช้ any เพื่อความเข้ากันได้กับไฟล์ที่เรียก
  // const cookieStore = cookies() // 🔴 ลบ: เพราะรับเข้ามาแล้ว

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          // 💡 อ่านค่าจาก cookieStore ที่ถูกส่งมาจากไฟล์ที่เรียกใช้งาน
          return cookieStore.get(name)?.value
        },
        // ⚠️ เมธอด set/remove จะปล่อยให้ว่างใน Server Component ที่ทำหน้าที่อ่านอย่างเดียว
        // การ Set/Remove Cookie ที่แท้จริงจะเกิดขึ้นใน Server Action/Route Handler ที่มีการเรียกใช้ Client นี้
        set(name: string, value: string, options: CookieOptions) {
          // ต้องกำหนด cookies ใน Server Action/Route Handler เท่านั้น
        },
        remove(name: string, options: CookieOptions) {
          // ต้องกำหนด cookies ใน Server Action/Route Handler เท่านั้น
        },
      },
    }
  )
}