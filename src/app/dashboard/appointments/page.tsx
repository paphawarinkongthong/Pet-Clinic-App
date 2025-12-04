/*
 * Phase 4: Admin Dashboard - Appointments Page
 * หน้านี้แสดงรายการนัดหมายทั้งหมด และให้ Admin สามารถกด "อนุมัติ" หรือ "ยกเลิก" ได้
 */
import { cookies } from 'next/headers'
import { createServer } from '@/utils/supabase/server'
import { updateAppointmentStatus } from '@/actions/appointments' // 🟢 นำเข้า Server Action ใหม่
import Link from 'next/link'
import { SubmitButton } from '@/components/SubmitButton' 

// 💡 เนื่องจากใช้ cookies() และไม่มี 'use client' จึงเป็น Server Component
export default async function AppointmentsPage({
    searchParams,
}: {
    searchParams?: { [key: string]: string | string[] | undefined };
}) {
    const cookieStore = cookies() as any; 
    const supabase = createServer(cookieStore);
    const errorMessage = searchParams?.error as string | undefined;
    const successMessage = searchParams?.message as string | undefined;

    // 1. ดึงข้อมูล Appointments พร้อม Join ตาราง Pets และ Owners
    // Appointments -> Pets -> Owners
    const { data: appointments, error } = await supabase
        .from('appointments')
        .select(`
            id, 
            appointment_date,
            status,
            reason,
            created_at, 
            pets (
                name, 
                type, 
                owners (
                    first_name, 
                    last_name,
                    phone_number
                )
            )
        `)
        .order('appointment_date', { ascending: true }); // เรียงตามวันที่นัดหมาย

    if (error) {
        console.error('Error fetching appointments:', error);
        return (
            <div className="p-8">
                <h1 className="text-3xl font-bold mb-4 text-gray-800">🗓️ รายการนัดหมาย</h1>
                <p className="text-red-500">❌ เกิดข้อผิดพลาดในการดึงข้อมูล: {error.message}</p>
            </div>
        );
    }

    // 2. Helper function สำหรับแสดง Badge ตาม Status
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Confirmed':
                return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">อนุมัติแล้ว</span>;
            case 'Cancelled':
                return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">ยกเลิกแล้ว</span>;
            case 'Pending':
            default:
                return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">รออนุมัติ</span>;
        }
    }

    // 3. แสดงผล
    return (
        <div className="container mx-auto p-4 md:p-8">
            <header className="flex justify-between items-center mb-6 border-b pb-4">
                <h1 className="text-3xl font-bold text-gray-800">🗓️ รายการนัดหมายทั้งหมด</h1>
            </header>

            {/* Feedback Messages */}
            {errorMessage && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                    <span className="block sm:inline">{decodeURIComponent(errorMessage)}</span>
                </div>
            )}
            {successMessage && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
                    <span className="block sm:inline">{decodeURIComponent(successMessage)}</span>
                </div>
            )}


            <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">วันที่นัดหมาย</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สถานะ</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สัตว์เลี้ยง/เจ้าของ</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">เหตุผล</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">การดำเนินการ</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {appointments.map((appointment) => {
                            // การเข้าถึงข้อมูลที่ Join มา
                            const pet = appointment.pets as any;
                            const owner = pet?.owners as any;
                            
                            // จัดรูปแบบวันที่
                            const apptDate = new Date(appointment.appointment_date).toLocaleDateString('th-TH', {
                                year: 'numeric', month: 'short', day: 'numeric',
                                hour: '2-digit', minute: '2-digit'
                            });

                            return (
                                <tr key={appointment.id} className="hover:bg-indigo-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {apptDate}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {getStatusBadge(appointment.status)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <div className="font-bold">{pet?.name} ({pet?.type})</div>
                                        <div className="text-xs text-gray-600">
                                            {owner?.first_name} {owner?.last_name} ({owner?.phone_number})
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs overflow-hidden text-ellipsis">
                                        {appointment.reason.substring(0, 50)}{appointment.reason.length > 50 ? '...' : ''}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        {appointment.status === 'Pending' ? (
                                            <div className="flex justify-end space-x-2">
                                                {/* ปุ่มอนุมัติ */}
                                                <form action={updateAppointmentStatus} className="inline-block">
                                                    <input type="hidden" name="appointment_id" value={appointment.id} />
                                                    <input type="hidden" name="new_status" value="Confirmed" />
                                                    <SubmitButton pendingText="กำลังอนุมัติ..." >
                                                        <span className="text-green-600 hover:text-white bg-green-100 hover:bg-green-600 transition duration-150 rounded-lg px-3 py-2">✅ อนุมัติ</span>
                                                    </SubmitButton>
                                                </form>

                                                {/* ปุ่มยกเลิก */}
                                                <form action={updateAppointmentStatus} className="inline-block">
                                                    <input type="hidden" name="appointment_id" value={appointment.id} />
                                                    <input type="hidden" name="new_status" value="Cancelled" />
                                                    <SubmitButton pendingText="กำลังยกเลิก...">
                                                        <span className="text-red-600 hover:text-white bg-red-100 hover:bg-red-600 transition duration-150 rounded-lg px-3 py-2">❌ ยกเลิก</span>
                                                    </SubmitButton>
                                                </form>
                                            </div>
                                        ) : (
                                            <span className="text-gray-400">ดำเนินการแล้ว</span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {appointments.length === 0 && (
                <div className="text-center py-10 text-gray-500">
                    <p>ยังไม่มีรายการนัดหมาย</p>
                </div>
            )}
        </div>
    );
}