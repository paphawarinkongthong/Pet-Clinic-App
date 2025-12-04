import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServer } from '@/utils/supabase/server';
import Link from 'next/link';
import { logout } from '@/actions/auth';

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
    const cookieStore = cookies() as any; 
    const supabase = createServer(cookieStore);

    // 1. เช็ค Login (ต้องล็อกอินถึงจะเข้าได้)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        redirect('/login');
    }

    // (Optional) ถ้าเป็น Admin เข้าหน้านี้ ให้ Redirect ไป Dashboard ไหม?
    // ปกติ Admin เข้าดูหน้า User ได้ ไม่ต้อง Redirect

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* User Navbar เรียบง่าย */}
            <nav className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <span className="text-xl font-bold text-indigo-600">🐾 Pet Care Portal</span>
                            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                                <Link href="/portal" className="border-indigo-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                                    หน้าหลัก
                                </Link>
                                <Link href="/portal/book" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                                    จองนัดหมาย
                                </Link>
                                <Link href="/portal/pets" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                                    สัตว์เลี้ยงของฉัน
                                </Link>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <span className="text-sm text-gray-500 mr-4">{user.email}</span>
                            <form action={logout}>
                                <button type="submit" className="text-sm text-red-600 hover:text-red-800 font-medium">
                                    ออกจากระบบ
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                {children}
            </main>
        </div>
    );
}