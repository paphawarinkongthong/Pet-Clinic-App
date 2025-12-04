import { SupabaseClient } from '@supabase/supabase-js'

export async function getUserRole(supabase: SupabaseClient) {
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // ดึง role จากตาราง profiles
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  return profile?.role || 'user' // ถ้าไม่มีข้อมูล ให้ default เป็น user
}