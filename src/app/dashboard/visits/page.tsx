/*2.3 UI: Visit List Page หน้านี้จะแสดงรายการประวัติการรักษาทั้งหมด พร้อม Double Join เพื่อดึงชื่อสัตว์เลี้ยงและชื่อเจ้าของมาแสดง*/
import { cookies } from 'next/headers'
import { createServer } from '@/utils/supabase/server'
import Link from 'next/link'
// import { deleteVisit } from '@/actions/visits' // สำหรับ 2.4

// 💡 เนื่องจากใช้ cookies() และเป็น Server Component
export default async function VisitsPage({
    searchParams,
}: {
    searchParams?: { [key: string]: string | string[] | undefined };
}) {
    const cookieStore = cookies() as any; 
    const supabase = createServer(cookieStore);
    const errorMessage = searchParams?.error as string | undefined;

    // 1. ดึงข้อมูล Visits พร้อม Double Join
    // Visits -> Pets -> Owners
    const { data: visits, error } = await supabase
        .from('visits')
        .select(`
            id, 
            visit_date,
            symptoms,
            treatment,
            created_at, 
            pets (
                name, 
                type, 
                owners (
                    first_name, 
                    last_name
                )
            )
        `)
        .order('visit_date', { ascending: false }); // เรียงตามวันที่รักษาล่าสุด

    if (error) {
        console.error('Error fetching visits:', error);
        return (
            <div className="p-8">
                <h1 className="text-3xl font-bold mb-4">ประวัติการเข้าคลินิก</h1>
                <p className="text-red-500">❌ เกิดข้อผิดพลาดในการดึงข้อมูล: {error.message}</p>
            </div>
        );
    }

    // 2. แสดงผล
    return (
        <div className="container mx-auto p-8">
            <header className="flex justify-between items-center mb-6 border-b pb-4">
                <h1 className="text-3xl font-bold text-gray-800">📋 ประวัติการรักษาทั้งหมด ({visits.length})</h1>
                <Link 
                    href="/dashboard/visits/add"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-150"
                >
                    + บันทึก Visit ใหม่
                </Link>
            </header>

            {errorMessage && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                    <span className="block sm:inline">{decodeURIComponent(errorMessage)}</span>
                </div>
            )}

            {/* ตารางแสดงข้อมูล */}
            <div className="overflow-x-auto shadow-xl rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">วันที่</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สัตว์เลี้ยง</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">เจ้าของ</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">อาการโดยย่อ</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">จัดการ</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {visits.map((visit) => {
                            const pet = visit.pets as any;
                            const owner = pet?.owners as any;
                            return (
                                <tr key={visit.id} className="hover:bg-indigo-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {new Date(visit.visit_date).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        **{pet?.name}** ({pet?.type})
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {owner?.first_name} {owner?.last_name}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs overflow-hidden text-ellipsis">
                                        {visit.symptoms.substring(0, 50)}...
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        {/* (สามารถเพิ่มปุ่ม Delete/View Detail ที่นี่) */}
                                        <Link href={`/dashboard/visits/${visit.id}`} className="text-indigo-600 hover:text-indigo-900">
                                            ดูรายละเอียด
                                        </Link>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {visits.length === 0 && (
                <div className="text-center py-10 text-gray-500">
                    <p>ยังไม่มีประวัติการเข้าคลินิก</p>
                </div>
            )}
        </div>
    );
}