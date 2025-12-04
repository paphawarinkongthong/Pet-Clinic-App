// src/app/page.tsx
// เป็น Server Component ที่ใช้ในการ Redirect ผู้ใช้ไปยัง Dashboard ทันที
// หากพวกเขาเข้าถึง / และมีการล็อกอินอยู่แล้ว

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServer } from '@/utils/supabase/server'; // อ้างอิงจาก utils/supabase/server.ts ของคุณ

// 💡 เนื่องจากใช้ cookies() จึงเป็น Server Component
export default async function IndexPage() {
  const cookieStore = cookies() as any; 
  const supabase = createServer(cookieStore);

  // ตรวจสอบสถานะผู้ใช้
  const { 
    data: { user },
  } = await supabase.auth.getUser();

  // หากล็อกอินแล้ว ให้ Redirect ไปหน้า Dashboard
  if (user) {
    redirect('/dashboard');
  }

  // หากยังไม่ได้ล็อกอิน ให้ Redirect ไปหน้า Login
  redirect('/login');

  // จะไม่มีการแสดงผล UI ใดๆ ในหน้านี้
  // return null; 
}