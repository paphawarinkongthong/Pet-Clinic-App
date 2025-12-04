'use client'

import { useFormStatus } from 'react-dom'

// 💡 Component สำหรับปุ่ม Submit ที่แสดงสถานะ 'กำลังดำเนินการ'
export const SubmitButton = ({ children, pendingText }: { children: React.ReactNode, pendingText?: string }) => {
    const { pending } = useFormStatus()

    return (
        <button
            type="submit"
            aria-disabled={pending} // ปิดการใช้งานเมื่อกำลังดำเนินการ
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-medium text-white 
                       bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 
                       transition duration-150 ease-in-out transform hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={pending}
        >
            {pending ? pendingText || 'กำลังโหลด...' : children}
        </button>
    )
}