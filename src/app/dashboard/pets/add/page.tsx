import { cookies } from 'next/headers'
import { createServer } from '@/utils/supabase/server'
import { createPet } from '@/actions/pets'
import { SubmitButton } from '@/components/SubmitButton' // นำเข้า SubmitButton ที่คุณสร้างก่อนหน้า
import { redirect } from 'next/navigation'

// 💡 เนื่องจากใช้ cookies() จึงเป็น Server Component
export default async function AddPetPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const cookieStore = cookies() as any; 
  const supabase = createServer(cookieStore);
  const errorMessage = searchParams?.error as string | undefined;

  // 1. ดึงข้อมูล Owners ทั้งหมด (สำหรับ Dropdown)
  const { data: owners, error: ownersError } = await supabase
    .from('owners')
    .select('id, first_name, last_name, nick_name') // ดึงเฉพาะ ID และชื่อที่จำเป็น
    .order('last_name', { ascending: true });
    
  if (ownersError) {
    console.error('Error fetching owners for form:', ownersError);
    // กรณีดึงเจ้าของไม่ได้ ไม่ควรให้ดำเนินการต่อ
    redirect(`/dashboard/pets?error=${encodeURIComponent('ไม่สามารถดึงข้อมูลเจ้าของได้: ' + ownersError.message)}`);
  }

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-2">🐾 เพิ่มสัตว์เลี้ยงใหม่</h1>
      
      {/* แสดง Error Message */}
      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{decodeURIComponent(errorMessage)}</span>
        </div>
      )}

      {/* Form ที่ใช้ Server Action */}
      <form action={createPet} className="space-y-4 bg-white p-6 rounded-lg shadow-lg">
        
        {/* 1. เลือกเจ้าของ (Owner Selection) */}
        <div>
          <label htmlFor="owner_id" className="block text-sm font-medium text-gray-700">เลือกเจ้าของ</label>
          <select
            id="owner_id"
            name="owner_id"
            required
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            defaultValue="" // กำหนดให้เลือกรายการแรกเป็นค่าว่าง
          >
            <option value="" disabled>--- กรุณาเลือกเจ้าของ ---</option>
            {owners.map((owner) => (
              <option key={owner.id} value={owner.id}>
                {owner.first_name} {owner.last_name} ({owner.nick_name || 'ไม่มีชื่อเล่น'})
              </option>
            ))}
          </select>
        </div>

        {/* 2. ชื่อสัตว์เลี้ยง (Pet Name) */}
        <div>
          <label htmlFor="pet_name" className="block text-sm font-medium text-gray-700">ชื่อสัตว์เลี้ยง</label>
          <input
            id="pet_name"
            name="pet_name"
            type="text"
            required
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* 3. ชนิด/ประเภท (Pet Type) */}
        <div>
          <label htmlFor="pet_type" className="block text-sm font-medium text-gray-700">ชนิด (เช่น Dog, Cat)</label>
          <input
            id="pet_type"
            name="pet_type"
            type="text"
            required
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            list="pet_types" // ใช้ datalist เพื่อแนะนำค่า
          />
          {/* Datalist สำหรับคำแนะนำ (ทางเลือก) */}
          <datalist id="pet_types">
            <option value="Dog" />
            <option value="Cat" />
            <option value="Bird" />
            <option value="Rabbit" />
          </datalist>
        </div>
        
        {/* 4. ปุ่ม Submit */}
        <SubmitButton pendingText="กำลังบันทึก...">
          บันทึกสัตว์เลี้ยง
        </SubmitButton>
      </form>
    </div>
  )
}