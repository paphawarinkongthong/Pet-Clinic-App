'use client'

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logout } from '@/actions/auth'; // นำเข้า Server Action สำหรับ Logout

// ข้อมูลเมนู
const navItems = [
    { name: 'ภาพรวม (Dashboard)', href: '/dashboard', icon: '🏠' },
    { name: 'รายการนัดหมาย', href: '/dashboard/appointments', icon: '🗓️' }, // 🟢 เพิ่มเมนูใหม่
    { name: 'เจ้าของ (Owners)', href: '/dashboard/owners', icon: '🧑' },
    { name: 'สัตว์เลี้ยง (Pets)', href: '/dashboard/pets', icon: '🐾' },
    { name: 'ประวัติ Visit', href: '/dashboard/visits', icon: '🩺' },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        // Sidebar Container
        <div className="flex flex-col w-64 bg-gray-800 text-white min-h-screen">
            
            {/* Header / Logo */}
            <div className="flex items-center justify-center h-20 shadow-md">
                <h1 className="text-xl font-bold text-indigo-400">Pet Clinic Admin</h1>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 px-2 py-4 space-y-2">
                {navItems.map((item) => {
                    // ตรวจสอบว่า Path ปัจจุบันตรงกับ href ของเมนูหรือไม่
                    // 💡 ใช้ startsWith เพื่อให้เมนูย่อยยังคง Active
                    const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/dashboard');
                    return (
                        <Link key={item.name} href={item.href} legacyBehavior>
                            <a
                                className={`flex items-center space-x-3 p-3 rounded-lg transition-colors duration-200 ${
                                    isActive 
                                        ? 'bg-indigo-600 text-white shadow-lg' 
                                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                }`}
                            >
                                <span className="text-xl">{item.icon}</span>
                                <span className="font-medium">{item.name}</span>
                            </a>
                        </Link>
                    );
                })}
            </nav>

            {/* Footer / Logout */}
            <div className="p-4 border-t border-gray-700">
                <form action={logout}>
                    <button
                        type="submit"
                        className="w-full flex items-center justify-center space-x-2 p-3 rounded-lg text-red-300 hover:bg-gray-700 hover:text-red-400 transition-colors duration-200"
                    >
                        <span className="text-xl">🚪</span>
                        <span className="font-medium">ออกจากระบบ</span>
                    </button>
                </form>
            </div>
        </div>
    );
}