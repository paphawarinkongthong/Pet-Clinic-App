// src/actions/getUser.ts
'use server'

import { createServer } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export async function getUser() {
     const cookieStore = cookies() as any; 
  const supabase = createServer(cookieStore)
  return supabase.auth.getUser()
}
