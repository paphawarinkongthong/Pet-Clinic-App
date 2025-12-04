import { cookies } from 'next/headers';
import { createServer } from '@/utils/supabase/server';
import Link from 'next/link';

export default async function UserPortalPage() {
    const cookieStore = cookies() as any; 
    const supabase = createServer(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();

    // ดึงข้อมูลการนัดหมายของ User คนนี้ (ถ้ามีตาราง appointments แล้ว)
    // const { data: appointments } = await supabase.from('appointments').select('*').eq('user_id', user?.id)...

    return (
        <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">👋 ยินดีต้อนรับ, คุณเจ้าของสัตว์เลี้ยง!</h1>
                <p className="text-gray-600">จัดการข้อมูลสัตว์เลี้ยงและจองคิวนัดหมายได้ที่นี่</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Card 1: จองนัดหมาย */}
                <Link href="/portal/book" className="block group">
                    <div className="bg-indigo-50 border-2 border-indigo-100 rounded-xl p-6 hover:border-indigo-500 transition-all cursor-pointer h-full">
                        <div className="flex items-center space-x-4">
                            <div className="bg-indigo-500 text-white p-3 rounded-full">
                                📅
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-indigo-900 group-hover:text-indigo-700">จองนัดพบคุณหมอ</h3>
                                <p className="text-sm text-indigo-700 mt-1">นัดเวลาตรวจรักษา หรือฉีดวัคซีน</p>
                            </div>
                        </div>
                    </div>
                </Link>

                {/* Card 2: สัตว์เลี้ยงของฉัน */}
                <Link href="/portal/pets" className="block group">
                    <div className="bg-green-50 border-2 border-green-100 rounded-xl p-6 hover:border-green-500 transition-all cursor-pointer h-full">
                        <div className="flex items-center space-x-4">
                            <div className="bg-green-500 text-white p-3 rounded-full">
                                🐶
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-green-900 group-hover:text-green-700">สัตว์เลี้ยงของฉัน</h3>
                                <p className="text-sm text-green-700 mt-1">ดูประวัติและข้อมูลสัตว์เลี้ยง</p>
                            </div>
                        </div>
                    </div>
                </Link>
            </div>
            
            {/* พื้นที่สำหรับแสดงรายการนัดหมายล่าสุด (Coming Soon) */}
            <div className="mt-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">นัดหมายเร็วๆ นี้</h2>
                <div className="bg-white border border-gray-200 rounded-lg p-8 text-center text-gray-500">
                    ยังไม่มีรายการนัดหมาย
                </div>
            </div>
        </div>
    );
}