'use server'

import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createServer } from '@/utils/supabase/server' // 🟢 ใช้ createServer ตามไฟล์ server.ts
import { getUserRole } from '@/utils/roles' // นำเข้า function ที่เพิ่งสร้าง

// Type definition (เหมือนเดิม)
type SupabaseCookieStore = { 
  get: (name: string) => { value: string } | undefined;
};

// ------------------------------------------
// 1. ฟังก์ชัน LOGIN (อัปเดตใหม่: มีการเช็ค Role)
// ------------------------------------------
export async function login(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const cookieStore = cookies() as unknown as SupabaseCookieStore
  const supabase = createServer(cookieStore) // 🟢 ใช้ createServer()

  // 1. Sign In
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error('Login failed:', error.message);
    redirect('/login?message=Email or password incorrect.')
  }

  // 2. เช็ค Role เพื่อ Redirect ไปให้ถูกหน้า
  const role = await getUserRole(supabase as any)

  if (role === 'admin') {
    redirect('/dashboard')
  } else {
    redirect('/portal') // หน้าใหม่สำหรับ User ทั่วไป
  }
}

// ------------------------------------------
// 2. ฟังก์ชัน REGISTER (เหมือนเดิม)
// ------------------------------------------
export async function register(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const cookieStore = cookies() as unknown as SupabaseCookieStore
  const supabase = createServer(cookieStore)

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/callback`,
    },
  })

  if (error) {
    console.error('Registration failed:', error.message);
    redirect('/login?message=Could not register user. Check console for details.')
  }

  redirect('/login?message=Check email to confirm registration.')
}

// ------------------------------------------
// 3. ฟังก์ชัน LOGOUT (เหมือนเดิม)
// ------------------------------------------
export async function logout() {
  const cookieStore = cookies() as unknown as SupabaseCookieStore
  const supabase = createServer(cookieStore)
  
  await supabase.auth.signOut()
  
  redirect('/login') 
}