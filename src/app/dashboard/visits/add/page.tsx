
/*2.2 UI: Add Visit Page หน้าฟอร์มนี้เป็น Server Component ที่ต้อง ดึงข้อมูลสัตว์เลี้ยงทั้งหมด (พร้อมชื่อเจ้าของ) มาแสดงในช่อง Dropdown (<select>) เพื่อระบุว่าสัตว์เลี้ยงตัวใดที่เข้ารับบริการ*/
import { cookies } from 'next/headers'
import { createServer } from '@/utils/supabase/server'
import { createVisit } from '@/actions/visits'
import { SubmitButton } from '@/components/SubmitButton' 
import { redirect } from 'next/navigation'

// 💡 เนื่องจากใช้ cookies() จึงเป็น Server Component
export default async function AddVisitPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const cookieStore = cookies() as any; 
  const supabase = createServer(cookieStore);
  const errorMessage = searchParams?.error as string | undefined;

  // 1. ดึงข้อมูล Pets ทั้งหมด พร้อม Join ตาราง Owners (สำหรับ Dropdown)
  // เพื่อให้ผู้ใช้เห็นทั้งชื่อสัตว์เลี้ยงและชื่อเจ้าของ
  const { data: pets, error: petsError } = await supabase
    .from('pets')
    .select(`
        id, 
        name, 
        type, 
        owners ( first_name, last_name )
    `)
    .order('name', { ascending: true });
    
  if (petsError) {
    console.error('Error fetching pets for form:', petsError);
    redirect(`/dashboard/visits?error=${encodeURIComponent('ไม่สามารถดึงข้อมูลสัตว์เลี้ยงได้: ' + petsError.message)}`);
  }

  return (
    <div className="container mx-auto p-8 max-w-3xl">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-2">🩺 บันทึกประวัติการเข้าคลินิก</h1>
      
      {/* แสดง Error Message */}
      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{decodeURIComponent(errorMessage)}</span>
        </div>
      )}

      {/* Form ที่ใช้ Server Action */}
      <form action={createVisit} className="space-y-6 bg-white p-8 rounded-lg shadow-xl">
        
        {/* 1. เลือกสัตว์เลี้ยง (Pet Selection) */}
        <div>
          <label htmlFor="pet_id" className="block text-sm font-medium text-gray-700">เลือกสัตว์เลี้ยง</label>
          <select
            id="pet_id"
            name="pet_id"
            required
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            defaultValue=""
          >
            <option value="" disabled>--- กรุณาเลือกสัตว์เลี้ยงที่เข้ารับบริการ ---</option>
            {pets.map((pet) => (
              <option key={pet.id} value={pet.id}>
                {pet.name} ({pet.type}) - เจ้าของ: {(pet.owners as any)?.first_name}
              </option>
            ))}
          </select>
        </div>
        
        {/* 2. วันที่เข้าคลินิก */}
        <div>
          <label htmlFor="visit_date" className="block text-sm font-medium text-gray-700">วันที่เข้าคลินิก</label>
          <input
            id="visit_date"
            name="visit_date"
            type="date"
            required
            // กำหนดค่าเริ่มต้นเป็นวันนี้
            defaultValue={new Date().toISOString().split('T')[0]} 
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* 3. อาการ (Symptoms) */}
        <div>
          <label htmlFor="symptoms" className="block text-sm font-medium text-gray-700">อาการ</label>
          <textarea
            id="symptoms"
            name="symptoms"
            rows={3}
            required
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* 4. การรักษา (Treatment) */}
        <div>
          <label htmlFor="treatment" className="block text-sm font-medium text-gray-700">การรักษา/การวินิจฉัย</label>
          <textarea
            id="treatment"
            name="treatment"
            rows={4}
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        
        {/* 5. ปุ่ม Submit */}
        <SubmitButton pendingText="กำลังบันทึกประวัติ...">
          บันทึกการเข้าคลินิก
        </SubmitButton>
      </form>
    </div>
  )
}