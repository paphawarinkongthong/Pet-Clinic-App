// src/app/layout.tsx
import './globals.css'; // อิมพอร์ต Tailwind CSS
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

// กำหนด Font (Next.js 13+)
const inter = Inter({ subsets: ['latin'] });

// ข้อมูล Metadata
export const metadata: Metadata = {
  title: 'Pet Clinic Dashboard',
  description: 'ระบบจัดการคลินิกสัตว์เลี้ยงสำหรับผู้ดูแลระบบ',
};

// Global Root Layout Component
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body className={inter.className}>
        {/*
          เนื้อหาหลักของแอปพลิเคชันจะถูกแสดงผลที่นี่
          ซึ่งจะถูกห่อหุ้มด้วย DashboardLayout (หากเป็นหน้า Dashboard)
          หรือแสดงผลหน้า Login โดยตรง
        */}
        {children}
      </body>
    </html>
  );
}