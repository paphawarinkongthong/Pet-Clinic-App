import { createOwner } from '@/actions/owners' // Server Action สำหรับเพิ่มเจ้าของ
import { SubmitButton } from '@/components/SubmitButton' // Component ปุ่ม Submit
import Link from 'next/link';

// 💡 เนื่องจากหน้านี้ไม่มีการดึงข้อมูลจาก Supabase ที่ต้องใช้ cookies
// และไม่มี 'use client' จึงเป็น Server Component ที่ง่ายที่สุด
export default function AddOwnerPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const errorMessage = searchParams?.error as string | undefined;

  return (
    <div className="container mx-auto p-8 max-w-xl">
      <header className="flex justify-between items-center mb-6 border-b pb-2">
        <h1 className="text-3xl font-bold text-gray-800">🧑 เพิ่มข้อมูลเจ้าของใหม่</h1>
        <Link 
            href="/dashboard/owners"
            className="text-sm text-indigo-600 hover:text-indigo-800 transition duration-150"
        >
            ← กลับไปที่รายการ
        </Link>
      </header>
      
      {/* แสดง Error Message (ถ้ามี) */}
      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{decodeURIComponent(errorMessage)}</span>
        </div>
      )}

      {/* Form ที่ใช้ Server Action */}
      <form action={createOwner} className="space-y-4 bg-white p-6 rounded-lg shadow-xl">
        
        {/* 1. ชื่อจริง (First Name) */}
        <div>
          <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">ชื่อจริง</label>
          <input
            id="first_name"
            name="first_name"
            type="text"
            required
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* 2. นามสกุล (Last Name) */}
        <div>
          <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">นามสกุล</label>
          <input
            id="last_name"
            name="last_name"
            type="text"
            required
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* 3. ชื่อเล่น (Nick Name) - ไม่บังคับ */}
        <div>
          <label htmlFor="nick_name" className="block text-sm font-medium text-gray-700">ชื่อเล่น (ไม่บังคับ)</label>
          <input
            id="nick_name"
            name="nick_name"
            type="text"
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* 4. เบอร์โทรศัพท์ (Phone Number) */}
        <div>
          <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700">เบอร์โทรศัพท์</label>
          <input
            id="phone_number"
            name="phone_number"
            type="tel"
            required
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="08X-XXX-XXXX"
          />
        </div>
        
        {/* 5. ปุ่ม Submit โดยใช้ SubmitButton Component */}
        <SubmitButton pendingText="กำลังบันทึกข้อมูล...">
          บันทึกเจ้าของ
        </SubmitButton>
      </form>
    </div>
  )
}