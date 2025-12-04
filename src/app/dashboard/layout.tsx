import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServer } from '@/utils/supabase/server'; // 🟢 แก้ไข: เปลี่ยนเป็น createServer
import { Sidebar } from '@/components/Sidebar';
import { getUserRole } from '@/utils/roles';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
    // 1. สร้าง Supabase Client
    const cookieStore = cookies() as any; 
    const supabase = createServer(cookieStore); // 🟢 ใช้ createServer()

    // 2. เช็ค User
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        redirect('/login');
    }

    // 3. 🛡️ เช็ค Role (เพิ่มใหม่)
    // ถ้าไม่ใช่ admin ให้ดีดไปหน้า portal ของ user แทน
    const role = await getUserRole(supabase as any);
    if (role !== 'admin') {
        redirect('/portal');
    }

    // 4. แสดงผล Sidebar และ Main Content (เฉพาะ Admin)
    return (
        <div className="flex min-h-screen bg-gray-100">
            <Sidebar /> 
            <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-8">
                {children}
            </main>
        </div>
    );
}