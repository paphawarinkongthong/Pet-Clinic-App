// src/app/dashboard/owners/page.tsx
import { cookies } from 'next/headers'
import { createServer } from '@/utils/supabase/server'
import Link from 'next/link'

// 💡 เนื่องจากใช้ cookies() และไม่มี 'use client' จึงเป็น Server Component
export default async function OwnersPage({
  searchParams, // เพื่อดึง error message จาก URL
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const cookieStore = cookies() as any; 
  const supabase = createServer(cookieStore);
  const errorMessage = searchParams?.error as string | undefined;

  // 1. ดึงข้อมูลเจ้าของทั้งหมด
  const { data: owners, error } = await supabase
    .from('owners')
    .select('*')
    .order('created_at', { ascending: false }); // เรียงลำดับล่าสุดขึ้นก่อน

  if (error) {
    console.error('Error fetching owners:', error);
    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-4">รายชื่อเจ้าของ</h1>
            <p className="text-red-500">❌ เกิดข้อผิดพลาดในการดึงข้อมูล: {error.message}</p>
        </div>
    );
  }

  // 2. แสดงผล
  return (
    <div className="container mx-auto p-8">
      <header className="flex justify-between items-center mb-6 border-b pb-4">
        <h1 className="text-3xl font-bold text-gray-800">📋 รายชื่อเจ้าของสัตว์เลี้ยง ({owners.length})</h1>
        <Link 
          href="/dashboard/owners/add"
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-150"
        >
          + เพิ่มเจ้าของใหม่
        </Link>
      </header>

      {/* แสดง Error Message หากมี */}
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ชื่อ-นามสกุล</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ชื่อเล่น</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">เบอร์โทร</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ลงทะเบียนเมื่อ</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {owners.map((owner) => (
              <tr key={owner.id} className="hover:bg-indigo-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {owner.first_name} {owner.last_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{owner.nick_name || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{owner.phone_number}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(owner.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {owners.length === 0 && (
          <div className="text-center py-10 text-gray-500">
              <p>ยังไม่มีข้อมูลเจ้าของ</p>
          </div>
      )}
    </div>
  );
}