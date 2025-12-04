/* 3.1 UI: Add Appointment Page หน้าฟอร์มนี้เป็น Server Component ที่ต้องดึงข้อมูลสัตว์เลี้ยงทั้งหมด (พร้อมชื่อเจ้าของ) มาแสดงในช่อง Dropdown (<select>) */
import { cookies } from 'next/headers'
import { createServer } from '@/utils/supabase/server'
import { createAppointment } from '@/actions/appointments' // 🟢 นำเข้า Server Action ที่เพิ่งสร้าง
import { SubmitButton } from '@/components/SubmitButton' 
import Link from 'next/link'
import { redirect } from 'next/navigation'

// 💡 Helper Type สำหรับข้อมูล Pet ที่ Join แล้ว
type PetWithOwner = {
  id: string;
  name: string;
  type: string;
  owners: { first_name: string; last_name: string } | null;
}

// 💡 เนื่องจากใช้ cookies() จึงเป็น Server Component
export default async function AddAppointmentPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const cookieStore = cookies() as any; 
  const supabase = createServer(cookieStore);
  const errorMessage = searchParams?.error as string | undefined;

  // 1. ดึงข้อมูล Pets ทั้งหมด พร้อม Join ตาราง Owners (สำหรับ Dropdown)
  const { data: pets, error: petsError } = await supabase
    .from('pets')
    .select(`
        id, 
        name, 
        type, 
        owners ( first_name, last_name )
    `)
    .order('name', { ascending: true }) as { data: PetWithOwner[] | null, error: any };
    
  if (petsError) {
    console.error('Error fetching pets for form:', petsError);
    // กรณีดึงสัตว์เลี้ยงไม่ได้
    redirect(`/dashboard/appointments?error=${encodeURIComponent('ไม่สามารถดึงข้อมูลสัตว์เลี้ยงได้: ' + petsError.message)}`);
  }

  // เตรียมค่าเริ่มต้นสำหรับเวลา (ปัจจุบัน)
  const today = new Date().toISOString().split('T')[0];
  const currentTime = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', hour12: false });
  
  // 💡 ตรวจสอบว่ามีสัตว์เลี้ยงให้เลือกหรือไม่
  const hasPets = pets && pets.length > 0;

  return (
    <div className="container mx-auto p-8 max-w-2xl bg-white shadow-xl rounded-xl">
      <header className="flex justify-between items-center mb-6 border-b pb-4">
        <h1 className="text-3xl font-bold text-indigo-700 flex items-center">
            📅 เพิ่มนัดหมายใหม่
        </h1>
        <Link 
            href="/dashboard/appointments"
            className="text-sm text-gray-500 hover:text-gray-700 transition duration-150"
        >
            ← กลับไปที่รายการนัดหมาย
        </Link>
      </header>
      
      {/* แสดง Error Message (ถ้ามี) */}
      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
          <span className="block sm:inline">{decodeURIComponent(errorMessage)}</span>
        </div>
      )}

      {!hasPets ? (
        <div className="text-center py-10 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-lg text-yellow-700 font-semibold mb-4">⚠️ ยังไม่พบข้อมูลสัตว์เลี้ยง</p>
            <p className="text-gray-600">กรุณาเพิ่มข้อมูลสัตว์เลี้ยงก่อนทำการนัดหมาย</p>
            <Link href="/dashboard/pets/add" className="mt-4 inline-block bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-2 px-4 rounded-lg transition duration-150">
                + เพิ่มสัตว์เลี้ยง
            </Link>
        </div>
      ) : (
        <form action={createAppointment} className="space-y-6">
            
            {/* 1. สัตว์เลี้ยง (Pet Dropdown) */}
            <div>
              <label htmlFor="pet_id" className="block text-sm font-medium text-gray-700">สัตว์เลี้ยงที่นัดหมาย</label>
              <select
                id="pet_id"
                name="pet_id"
                required
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white"
              >
                <option value="">-- เลือกสัตว์เลี้ยง --</option>
                {pets.map((pet) => (
                  <option key={pet.id} value={pet.id}>
                    {pet.name} ({pet.type}) - เจ้าของ: {pet.owners?.first_name} {pet.owners?.last_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* 2. วันที่นัดหมาย (Appointment Date) */}
                <div>
                  <label htmlFor="appointment_date" className="block text-sm font-medium text-gray-700">วันที่นัดหมาย</label>
                  <input
                    id="appointment_date"
                    name="appointment_date"
                    type="date"
                    required
                    defaultValue={today} // กำหนดค่าเริ่มต้นเป็นวันนี้
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                
                {/* 3. เวลาที่นัดหมาย (Appointment Time) */}
                <div>
                  <label htmlFor="appointment_time" className="block text-sm font-medium text-gray-700">เวลาที่นัดหมาย</label>
                  <input
                    id="appointment_time"
                    name="appointment_time"
                    type="time"
                    step="60" // ให้เลือกเป็นนาที
                    required
                    defaultValue={currentTime}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
            </div>

            {/* 4. รายละเอียด (Notes) */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700">รายละเอียด/เหตุผลในการนัดหมาย</label>
              <textarea
                id="notes"
                name="notes"
                rows={4}
                required
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <SubmitButton pendingText="กำลังบันทึกนัดหมาย...">
                บันทึกนัดหมาย
              </SubmitButton>
            </div>
        </form>
      )}
    </div>
  )
}