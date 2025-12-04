'use server'

import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createServer } from '@/utils/supabase/server'

// 💡 Type definition
type SupabaseCookieStore = { 
  get: (name: string) => { value: string } | undefined;
};

// ------------------------------------------
// 1. CREATE (จองนัดหมายใหม่)
// ------------------------------------------
export async function createAppointment(formData: FormData) {
  // 1. ดึงข้อมูลจากฟอร์ม
  const appointment_date = formData.get('appointment_date') as string
  const appointment_time = formData.get('appointment_time') as string
  const reason = formData.get('reason') as string
  const pet_id = formData.get('pet_id') as string // อาจเป็นค่าว่างได้ถ้าไม่ได้เลือก

  // 2. ตรวจสอบข้อมูลจำเป็น
  if (!appointment_date || !appointment_time || !reason) {
    redirect(`/portal/book?error=${encodeURIComponent('กรุณากรอกวันที่, เวลา และอาการเบื้องต้น')}`)
  }

  // 3. เตรียม Supabase Client และ User
  const cookieStore = cookies() as unknown as SupabaseCookieStore
  const supabase = createServer(cookieStore)
  
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // 4. บันทึกข้อมูลลงตาราง appointments
  const { error } = await supabase
    .from('appointments')
    .insert([
      {
        user_id: user.id, // ใครเป็นคนจอง
        pet_id: pet_id || null, // ถ้าไม่ได้เลือกให้เป็น null
        appointment_date,
        appointment_time,
        reason,
        status: 'pending', // สถานะเริ่มต้นคือ รออนุมัติ
      }
    ])

  if (error) {
    console.error('Error booking appointment:', error.message)
    redirect(`/portal/book?error=${encodeURIComponent('เกิดข้อผิดพลาดในการจอง: ' + error.message)}`)
  }

  // 5. สำเร็จ! กลับไปหน้า Dashboard ของ User
  redirect('/portal?success=true')
}

// ------------------------------------------
// 2. UPDATE (อัปเดตสถานะนัดหมาย - ใช้โดย Admin/Staff)
// ------------------------------------------
/**
 * อัปเดตสถานะการนัดหมาย (เช่น 'approved', 'rejected', 'completed')
 * @param formData FormData ที่ต้องมี appointment_id และ new_status
 */
export async function updateAppointmentStatus(formData: FormData) {
  const appointmentId = formData.get('appointment_id') as string
  // 'approved', 'rejected', 'completed', หรือสถานะอื่น ๆ
  const newStatus = formData.get('new_status') as string 

  if (!appointmentId || !newStatus) {
    // Redirect กลับไปหน้าจัดการนัดหมายพร้อม Error
    redirect(`/dashboard/appointments?error=${encodeURIComponent('ข้อมูลไม่ครบถ้วนสำหรับการอัปเดตสถานะ')}`)
  }
  
  // 1. เตรียม Supabase Client และ User
  const cookieStore = cookies() as unknown as SupabaseCookieStore
  const supabase = createServer(cookieStore)
  
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    // ผู้ดูแลระบบ/พนักงานต้องล็อกอิน
    redirect('/login')
  }

  // 💡 Note: ในแอปพลิเคชันจริง ควรมีการตรวจสอบ Role ของ User ว่าเป็น 'admin' หรือ 'staff' ก่อนดำเนินการ

  // 2. ทำการ Update สถานะ
  const { error } = await supabase
    .from('appointments')
    .update({ status: newStatus })
    .eq('id', appointmentId)

  if (error) {
    console.error(`Error updating status for appointment ${appointmentId}:`, error.message)
    redirect(`/dashboard/appointments?error=${encodeURIComponent(`เกิดข้อผิดพลาดในการอัปเดตสถานะ: ${error.message}`)}`)
  }

  // 3. สำเร็จ!
  redirect('/dashboard/appointments?update_success=true')
}