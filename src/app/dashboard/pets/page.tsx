import { cookies } from 'next/headers'
import { createServer } from '@/utils/supabase/server'
import Link from 'next/link'
import { deletePet } from '@/actions/pets' // สำหรับ 1.4

// 💡 เนื่องจากใช้ cookies() และไม่มี 'use client' จึงเป็น Server Component
export default async function PetsPage({
    searchParams,
}: {
    searchParams?: { [key: string]: string | string[] | undefined };
}) {
    const cookieStore = cookies() as any; 
    const supabase = createServer(cookieStore);
    const errorMessage = searchParams?.error as string | undefined;

    // 1. ดึงข้อมูล Pets พร้อม Join ตาราง Owners
    // 💡 การใช้ select('*, owners(*)') คือการ Join ข้อมูล
    const { data: pets, error } = await supabase
        .from('pets')
        .select(`
            id, 
            name, 
            type, 
            created_at, 
            owners (
                id, 
                first_name, 
                last_name
            )
        `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching pets:', error);
        return (
            <div className="p-8">
                <h1 className="text-3xl font-bold mb-4">รายชื่อสัตว์เลี้ยง</h1>
                <p className="text-red-500">❌ เกิดข้อผิดพลาดในการดึงข้อมูล: {error.message}</p>
            </div>
        );
    }

    // 2. แสดงผล
    return (
        <div className="container mx-auto p-8">
            <header className="flex justify-between items-center mb-6 border-b pb-4">
                <h1 className="text-3xl font-bold text-gray-800">🐾 รายชื่อสัตว์เลี้ยงในคลินิก ({pets.length})</h1>
                <Link 
                    href="/dashboard/pets/add"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-150"
                >
                    + เพิ่มสัตว์เลี้ยง
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
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ชื่อสัตว์เลี้ยง</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ประเภท</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">เจ้าของ</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ลงทะเบียนเมื่อ</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">จัดการ</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {pets.map((pet) => (
                            <tr key={pet.id} className="hover:bg-indigo-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{pet.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{pet.type}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {/* 💡 การเข้าถึงข้อมูลที่ Join มา */}
                                    {(pet.owners as any)?.first_name} {(pet.owners as any)?.last_name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(pet.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    {/* 💡 ฟอร์มสำหรับ Delete Action (1.4) */}
                                    <form action={deletePet} className="inline-block">
                                        <input type="hidden" name="pet_id" value={pet.id} />
                                        <button 
                                            type="submit" 
                                            className="text-red-600 hover:text-red-900 ml-3"
                                        >
                                            ลบ
                                        </button>
                                    </form>
                                    {/* (คุณสามารถเพิ่มปุ่ม Edit ที่นี่ได้) */}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {pets.length === 0 && (
                <div className="text-center py-10 text-gray-500">
                    <p>ยังไม่มีข้อมูลสัตว์เลี้ยง</p>
                </div>
            )}
        </div>
    );
}