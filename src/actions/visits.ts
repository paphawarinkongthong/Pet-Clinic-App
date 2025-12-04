
/*2.1  Action: Create Visitสร้าง Server Action เพื่อจัดการการเพิ่มข้อมูลการเข้าคลินิกใหม่ ซึ่งจำเป็นต้องรับค่า pet_id, symptoms, และ treatment */
'use server'

import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createServer } from '@/utils/supabase/server' 

// 💡 Type definition เหมือนในไฟล์ actions อื่นๆ
type SupabaseCookieStore = { 
  get: (name: string) => { value: string } | undefined;
};

// ------------------------------------------
// 1. CREATE (เพิ่มประวัติการรักษาใหม่)
// ------------------------------------------
export async function createVisit(formData: FormData) {
  // 1. ดึงข้อมูลจากฟอร์ม
  const pet_id = formData.get('pet_id') as string // Foreign Key (PK ของ pets)
  const symptoms = formData.get('symptoms') as string
  const treatment = formData.get('treatment') as string
  const visit_date_str = formData.get('visit_date') as string // วันที่เข้ารับบริการ

  // 2. ตรวจสอบความถูกต้องของข้อมูลเบื้องต้น
  if (!pet_id || !symptoms || !visit_date_str) {
    redirect(`/dashboard/visits/add?error=${encodeURIComponent('กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน')}`)
    return
  }

  // 3. เตรียม Supabase Client
  const cookieStore = cookies() as unknown as SupabaseCookieStore
  const supabase = createServer(cookieStore)
  
  // 4. ทำการ Insert ข้อมูล
  const { error } = await supabase
    .from('visits')
    .insert([
      { 
        pet_id, 
        symptoms, 
        treatment,
        // แปลงวันที่จาก string เป็น Date object (หรือใช้ string format ที่ Supabase รองรับ)
        visit_date: visit_date_str, 
      },
    ])

  if (error) {
    console.error('Error creating visit:', error.message)
    redirect(`/dashboard/visits/add?error=${encodeURIComponent('ไม่สามารถบันทึกประวัติการรักษาได้: ' + error.message)}`)
  }

  // 5. Redirect ไปหน้า Visits List เมื่อสำเร็จ
  redirect('/dashboard/visits') 
}

// ------------------------------------------
// 2. DELETE (ลบประวัติการรักษา - สำหรับเพิ่มในภายหลัง)
// ------------------------------------------
/* export async function deleteVisit(formData: FormData) {
    // ... Implement deletion logic here
} 
*/