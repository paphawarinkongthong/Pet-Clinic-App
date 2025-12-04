'use server'

import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createServer } from '@/utils/supabase/server' // อ้างอิงจากโค้ดที่คุณมี

// 💡 Type definition เหมือนใน auth.ts
type SupabaseCookieStore = { 
  get: (name: string) => { value: string } | undefined;
};

// ------------------------------------------
// 1. CREATE (เพิ่มสัตว์เลี้ยงใหม่)
// ------------------------------------------
export async function createPet(formData: FormData) {
  // 1. ดึงข้อมูลจากฟอร์ม
  const owner_id = formData.get('owner_id') as string // Foreign Key (PK ของ owners)
  const pet_name = formData.get('pet_name') as string
  const pet_type = formData.get('pet_type') as string // เช่น Dog, Cat, Bird

  // 2. ตรวจสอบความถูกต้องของข้อมูลเบื้องต้น
  if (!owner_id || !pet_name || !pet_type) {
    redirect(`/dashboard/pets/add?error=${encodeURIComponent('กรุณากรอกข้อมูลให้ครบถ้วน')}`)
    return
  }

  // 3. เตรียม Supabase Client
  const cookieStore = cookies() as unknown as SupabaseCookieStore
  const supabase = createServer(cookieStore)

  // 4. ทำการ Insert ข้อมูล
  const { error } = await supabase
    .from('pets')
    .insert([
      { 
        owner_id, 
        name: pet_name, 
        type: pet_type,
        // ถ้าคุณมีคอลัมน์อื่น เช่น breed, birth_date ให้เพิ่มตรงนี้
      },
    ])

  if (error) {
    console.error('Error creating pet:', error.message)
    redirect(`/dashboard/pets/add?error=${encodeURIComponent('ไม่สามารถเพิ่มสัตว์เลี้ยงได้: ' + error.message)}`)
  }

  // 5. Redirect ไปหน้า Pets List เมื่อสำเร็จ
  redirect('/dashboard/pets') 
}

// ------------------------------------------
// 2. DELETE (ลบสัตว์เลี้ยง - สำหรับ 1.4)
// ------------------------------------------
export async function deletePet(formData: FormData) {
    const petId = formData.get('pet_id') as string

    if (!petId) {
        // จัดการกรณีที่ไม่มี ID
        return
    }

    const cookieStore = cookies() as unknown as SupabaseCookieStore
    const supabase = createServer(cookieStore)

    // 💡 การลบข้อมูลสัตว์เลี้ยงที่อาจมี Visits อ้างอิงอยู่
    // คุณอาจต้องตั้งค่า `ON DELETE CASCADE` ใน Supabase 
    // หรือทำการลบ Visits ที่เกี่ยวข้องก่อนใน Server Action นี้
    const { error } = await supabase
        .from('pets')
        .delete()
        .eq('id', petId)
    
    if (error) {
        console.error('Error deleting pet:', error.message)
        redirect(`/dashboard/pets?error=${encodeURIComponent('ไม่สามารถลบสัตว์เลี้ยงได้: ' + error.message)}`)
    }

    // เพื่อให้ Next.js รีเฟรชข้อมูลในหน้า List หลังการลบ
    redirect('/dashboard/pets') 
}