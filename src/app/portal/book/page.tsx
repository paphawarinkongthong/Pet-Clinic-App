import { cookies } from 'next/headers'
import { createServer } from '@/utils/supabase/server'
import { createAppointment } from '@/actions/appointments'
import { SubmitButton } from '@/components/SubmitButton'
import Link from 'next/link'

export default async function BookAppointmentPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const cookieStore = cookies() as any; 
  const supabase = createServer(cookieStore);
  const errorMessage = searchParams?.error as string | undefined;

  // 1. ดึง User ปัจจุบัน
  const { data: { user } } = await supabase.auth.getUser();

  // 2. ดึงรายการสัตว์เลี้ยงของ User คนนี้ (ถ้ามี)
  // Logic: หา pets ที่ owner ของมันมี user_id ตรงกับ user ปัจจุบัน
  // หมายเหตุ: ต้องมั่นใจว่าตาราง owners มี user_id และเชื่อมโยงแล้ว
  let myPets: any[] = [];
  
  if (user) {
    const { data: petsData } = await supabase
      .from('pets')
      .select(`
        id, 
        name, 
        type,
        owners!inner(user_id) 
      `)
      .eq('owners.user_id', user.id); // Filter ผ่าน Relation owner

    if (petsData) {
      myPets = petsData;
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">📅 จองนัดพบคุณหมอ</h1>
                <p className="text-gray-500 text-sm mt-1">กรอกรายละเอียดเพื่อนัดหมายเวลาตรวจรักษา</p>
            </div>
            <Link href="/portal" className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                ← กลับหน้าหลัก
            </Link>
        </div>

        {/* Error Message */}
        {errorMessage && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded-r-md shadow-sm">
                <div className="flex">
                    <div className="flex-shrink-0">⚠️</div>
                    <div className="ml-3">
                        <p className="text-sm text-red-700">{decodeURIComponent(errorMessage)}</p>
                    </div>
                </div>
            </div>
        )}

        {/* Form Card */}
        <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100">
            <div className="p-6 sm:p-8 space-y-6">
                <form action={createAppointment} className="space-y-6">
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* 1. วันที่นัดหมาย */}
                        <div>
                            <label htmlFor="appointment_date" className="block text-sm font-semibold text-gray-700 mb-2">
                                วันที่ต้องการนัด
                            </label>
                            <input
                                type="date"
                                id="appointment_date"
                                name="appointment_date"
                                required
                                min={new Date().toISOString().split('T')[0]} // ห้ามเลือกอดีต
                                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2.5 px-3 border"
                            />
                        </div>

                        {/* 2. เวลานัดหมาย */}
                        <div>
                            <label htmlFor="appointment_time" className="block text-sm font-semibold text-gray-700 mb-2">
                                เวลาโดยประมาณ
                            </label>
                            <input
                                type="time"
                                id="appointment_time"
                                name="appointment_time"
                                required
                                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2.5 px-3 border"
                            />
                        </div>
                    </div>

                    {/* 3. เลือกสัตว์เลี้ยง */}
                    <div>
                        <label htmlFor="pet_id" className="block text-sm font-semibold text-gray-700 mb-2">
                            สัตว์เลี้ยงที่จะพามา (ถ้ามี)
                        </label>
                        <select
                            id="pet_id"
                            name="pet_id"
                            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2.5 px-3 border"
                            defaultValue=""
                        >
                            <option value="" disabled>-- เลือกสัตว์เลี้ยง --</option>
                            <option value="">ไม่ระบุ / สัตว์เลี้ยงใหม่</option>
                            {myPets.map((pet) => (
                                <option key={pet.id} value={pet.id}>
                                    🐶 {pet.name} ({pet.type})
                                </option>
                            ))}
                        </select>
                        {myPets.length === 0 && (
                            <p className="mt-2 text-xs text-orange-600">
                                * คุณยังไม่มีข้อมูลสัตว์เลี้ยงในระบบ คุณสามารถเลือก "ไม่ระบุ" ได้
                            </p>
                        )}
                    </div>

                    {/* 4. อาการ/สาเหตุ */}
                    <div>
                        <label htmlFor="reason" className="block text-sm font-semibold text-gray-700 mb-2">
                            อาการเบื้องต้น / สาเหตุที่นัด
                        </label>
                        <textarea
                            id="reason"
                            name="reason"
                            rows={4}
                            required
                            placeholder="เช่น น้องมีอาการซึม ไม่ทานอาหาร, ต้องการฉีดวัคซีนประจำปี..."
                            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3 border"
                        />
                    </div>

                    {/* Submit Button */}
                    <div className="pt-2">
                        <SubmitButton pendingText="กำลังส่งข้อมูลนัดหมาย...">
                            ยืนยันการจองนัดหมาย
                        </SubmitButton>
                    </div>
                </form>
            </div>
        </div>
    </div>
  )
}