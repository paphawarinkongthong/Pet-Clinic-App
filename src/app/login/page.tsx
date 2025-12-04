'use client'

import React, { useState } from 'react';
// 🔴 ลบ: นำเข้า useSearchParams และ useEffect ที่เกี่ยวข้องออก เพื่อแก้ปัญหา 'next/navigation'
import { login, register } from '@/actions/auth'; // 🟢 ใช้ Path Alias (@/actions/auth)

// ส่วนประกอบเล็กๆ สำหรับแสดงข้อความสถานะ
const StatusMessage = ({ message, type }: { message: string; type: 'error' | 'success' }) => {
  if (!message) return null;
  const bgColor = type === 'error' ? 'bg-red-100 border-red-400 text-red-700' : 'bg-green-100 border-green-400 text-green-700';
  return (
    <div className={`border px-4 py-3 rounded relative mb-4 ${bgColor}`} role="alert">
      <span className="block sm:inline">{message}</span>
    </div>
  );
};

export default function LoginPage() {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [statusMessage, setStatusMessage] = useState('');
  const [messageType, setMessageType] = useState<'error' | 'success'>('success');
  // 🔴 ลบ: searchParams และ useEffect ที่เกี่ยวข้องกับการดึงข้อความจาก URL

  // Handle Form Submission (ใช้ form action ที่ส่งตรงไปยัง Server Action)
  const handleSubmit = (formData: FormData) => {
    // 💡 ตั้งค่าข้อความสถานะ 'กำลังดำเนินการ...' ทันทีที่กด Submit
    setStatusMessage('กำลังดำเนินการ...');
    setMessageType('success'); // ใช้ success เป็น default ในระหว่างรอดำเนินการ
    
    if (isLoginMode) {
      // 💡 หากเกิด error ใน Server Action, Server Action จะจัดการ redirect กลับไปหน้า /login พร้อม message
      login(formData);
    } else {
      register(formData);
    }
    // Note: หาก Server Action redirect สำเร็จ หน้าจอจะโหลดใหม่และข้อความสถานะนี้จะหายไป
    // หากเกิด Error, ผู้ใช้จะเห็นข้อความ "กำลังดำเนินการ..." จนกว่า Server Action จะ redirect กลับมา
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-2xl transition duration-500 hover:shadow-3xl">
        <h2 className="text-3xl font-extrabold text-center text-gray-900">
          {isLoginMode ? 'เข้าสู่ระบบ' : 'ลงทะเบียน'}
        </h2>

        <StatusMessage message={statusMessage} type={messageType} />

        <form className="space-y-6" action={handleSubmit}>
          {/* Email Input */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">อีเมล</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
              placeholder="you@example.com"
            />
          </div>

          {/* Password Input */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">รหัสผ่าน</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
              placeholder="********"
            />
          </div>

          {/* Submit Button Component */}
          <SubmitButton isLoginMode={isLoginMode} />
        </form>

        {/* Toggle Mode */}
        <div className="text-center text-sm">
          {isLoginMode ? (
            <p className="text-gray-600">
              ยังไม่มีบัญชี? 
              <button 
                type="button" 
                onClick={() => { setIsLoginMode(false); setStatusMessage(''); }}
                className="font-medium text-indigo-600 hover:text-indigo-500 ml-1 focus:outline-none"
              >
                ลงทะเบียน
              </button>
            </p>
          ) : (
            <p className="text-gray-600">
              มีบัญชีอยู่แล้ว? 
              <button 
                type="button" 
                onClick={() => { setIsLoginMode(true); setStatusMessage(''); }}
                className="font-medium text-indigo-600 hover:text-indigo-500 ml-1 focus:outline-none"
              >
                เข้าสู่ระบบ
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// 🟢 Component สำหรับปุ่ม Submit
const SubmitButton = ({ isLoginMode }: { isLoginMode: boolean }) => {
    return (
        <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out transform hover:scale-[1.01]"
        >
            {isLoginMode ? 'เข้าสู่ระบบ' : 'ลงทะเบียนบัญชีใหม่'}
        </button>
    );
}