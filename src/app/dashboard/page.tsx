import { cookies } from 'next/headers'
import { createServer } from '@/utils/supabase/server'
import Link from 'next/link';

// 💡 Helper function สำหรับดึงข้อมูลสรุป
async function getSummaryData() {
  const cookieStore = cookies() as any; 
  const supabase = createServer(cookieStore);

  // ดึงจำนวน Owners
  const { count: ownerCount, error: ownersError } = await supabase
    .from('owners')
    .select('*', { count: 'exact', head: true });
    
  // ดึงจำนวน Pets
  const { count: petCount, error: petsError } = await supabase
    .from('pets')
    .select('*', { count: 'exact', head: true });

  // ดึงจำนวน Visits ล่าสุด 7 วัน
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const { count: recentVisitCount, error: visitsError } = await supabase
    .from('visits')
    .select('*', { count: 'exact', head: true })
    .gte('visit_date', sevenDaysAgo.toISOString().split('T')[0]);
    
  // ดึงข้อมูล Visits ล่าสุด 5 รายการ (พร้อม Join Pet และ Owner)
  const { data: latestVisits, error: latestVisitsError } = await supabase
    .from('visits')
    .select(`
        visit_date,
        symptoms,
        pets ( name, owners ( first_name, last_name ) )
    `)
    .order('visit_date', { ascending: false })
    .limit(5);

  return { 
    ownerCount, 
    petCount, 
    recentVisitCount, 
    latestVisits,
    error: ownersError || petsError || visitsError || latestVisitsError
  };
}


// 💡 Page นี้จะเน้นแสดงภาพรวมเท่านั้น
export default async function DashboardPage() {
    
  // 1. ดึงข้อมูลสรุป
  const { ownerCount, petCount, recentVisitCount, latestVisits, error } = await getSummaryData();

  if (error) {
    console.error('Error fetching summary data:', error.message);
  }

  // 2. แสดงผล Dashboard
  return (
    <div className="space-y-8">
        <h1 className="text-4xl font-extrabold text-gray-900">ภาพรวมคลินิก (Dashboard)</h1>
        
        {/* 3. Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <SummaryCard 
                title="จำนวนเจ้าของ" 
                value={ownerCount || 0} 
                unit="คน" 
                link="/dashboard/owners"
                icon="🧑"
                color="bg-green-500"
            />
            <SummaryCard 
                title="จำนวนสัตว์เลี้ยง" 
                value={petCount || 0} 
                unit="ตัว" 
                link="/dashboard/pets"
                icon="🐾"
                color="bg-blue-500"
            />
            <SummaryCard 
                title="Visits ใน 7 วัน" 
                value={recentVisitCount || 0} 
                unit="ครั้ง" 
                link="/dashboard/visits"
                icon="📅"
                color="bg-yellow-500"
            />
        </div>

        {/* 4. Latest Visits Table */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">🩺 ประวัติการรักษาล่าสุด 5 รายการ</h2>
            
            {latestVisits && latestVisits.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">วันที่</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สัตว์เลี้ยง</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">เจ้าของ</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">อาการ</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {latestVisits.map((visit: any, index: number) => (
                                <tr key={index}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {new Date(visit.visit_date).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{visit.pets.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {visit.pets.owners.first_name}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 max-w-sm overflow-hidden text-ellipsis">
                                        {visit.symptoms.substring(0, 70)}{visit.symptoms.length > 70 ? '...' : ''}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className="text-gray-500 text-center py-6">ไม่มีประวัติการรักษาล่าสุด</p>
            )}
        </div>
        
    </div>
  );
}

// ------------------------------------------
// 5. Component: SummaryCard (สำหรับแสดงผลตัวเลข)
// ------------------------------------------
const SummaryCard = ({ title, value, unit, link, icon, color }: 
    { title: string; value: number; unit: string; link: string; icon: string; color: string; }
) => {
    return (
        <Link href={link} legacyBehavior>
            <a className={`block ${color} text-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition duration-300 transform hover:scale-[1.02]`}>
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">{title}</h3>
                    <span className="text-3xl">{icon}</span>
                </div>
                <div className="mt-4">
                    <p className="text-5xl font-extrabold leading-none">{value}</p>
                    <p className="text-sm opacity-80 mt-1">{unit} ในระบบทั้งหมด</p>
                </div>
            </a>
        </Link>
    );
};