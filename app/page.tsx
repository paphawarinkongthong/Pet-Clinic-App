import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createServer } from '@/utils/supabase/server' 

// 💡 หน้านี้ (root '/') ทำหน้าที่เป็น Router Gateway
// มันจะตรวจสอบสถานะการเข้าสู่ระบบและพาผู้ใช้ไปยังหน้า Dashboard หรือ Login ที่เหมาะสม
// เนื่องจากเป็น Server Component เราจึงสามารถเข้าถึง cookies และทำการ redirect ได้ทันที
export default async function IndexPage() {
  
  // 1. เตรียม Supabase Client สำหรับ Server Component
  // ต้องใช้ cookies() และ createServerClientComponent เพื่อดึง Session ที่ถูกเก็บไว้
  const cookieStore = cookies() as any; 
  const supabase = createServer(cookieStore);

  // 2. ตรวจสอบสถานะผู้ใช้
  const { 
    data: { user },
  } = await supabase.auth.getUser();

  // 3. กำหนดเส้นทาง
  if (user) {
    // ผู้ใช้ล็อกอินแล้ว: พาไปหน้า Dashboard
    redirect('/dashboard');
  } else {
    // ผู้ใช้ยังไม่ได้ล็อกอิน: พาไปหน้า Login
    redirect('/login');
  }
}