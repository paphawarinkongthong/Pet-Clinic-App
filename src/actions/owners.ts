'use server'

import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createServer } from '@/utils/supabase/server'

// 💡 Type definition จาก src/actions/auth.ts
type SupabaseCookieStore = { 
  get: (name: string) => { value: string } | undefined;
};

// ------------------------------------------
// CREATE (เพิ่มเจ้าของใหม่)
// ------------------------------------------
export async function createOwner(formData: FormData) {
  // 1. ดึงข้อมูลจากฟอร์ม 
  const first_name = formData.get('first_name') as string
  const last_name = formData.get('last_name') as string
  const phone_number = formData.get('phone_number') as string
  const nick_name = formData.get('nick_name') as string
  
  // 2. เตรียม Supabase Client (ใช้ Type Casting เพื่อให้เข้ากันได้กับ createServerClientComponent)
  const cookieStore = cookies() as unknown as SupabaseCookieStore
  const supabase = createServer(cookieStore)

  // 3. ทำการ Insert ข้อมูล
  const { data, error } = await supabase
    .from('owners')
    .insert([
      { 
        first_name, 
        last_name, 
        phone_number, 
        nick_name 
      },
    ])
    // 💡 การเลือก select('id') ทำให้เราได้ข้อมูล ID กลับมาเมื่อ Insert สำเร็จ
    .select('id') 
    .single()

  if (error) {
    console.error('Error creating owner:', error.message)
    // ส่งกลับไปหน้าฟอร์มพร้อมข้อความ Error (ถ้าต้องการแสดง)
    // สำหรับตอนนี้เราจะ redirect ไปหน้าหลักของเจ้าของ
    redirect(`/dashboard/owners?error=${encodeURIComponent('ไม่สามารถเพิ่มเจ้าของได้: ' + error.message)}`)
  }

  // 4. Redirect ไปหน้า Owners List เมื่อสำเร็จ
  // เราจะสร้างหน้านี้ในขั้นตอนถัดไป
  redirect('/dashboard/owners') 
}

// ------------------------------------------
// DELETE (ลบเจ้าของ - ตัวอย่างเพิ่มเติม)
// ------------------------------------------
/*
export async function deleteOwner(ownerId: string) {
    // ... โค้ดสร้าง client เหมือนข้างบน ...
    const { error } = await supabase.from('owners').delete().eq('id', ownerId)
    // ... จัดการ Error และ Revalidate/Redirect ...
}
*/