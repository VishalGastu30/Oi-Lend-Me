'use client';

// ... existing imports ...
import { Toaster } from 'sonner';
import { AdminNavbar } from '@/components/admin/AdminNavbar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0B0F1A] font-sans flex flex-col selection:bg-blue-500/30 selection:text-blue-200">
      <AdminNavbar />
      <main className="flex-1 p-6 md:p-8 animate-in fade-in duration-500">
        <div className="max-w-7xl mx-auto space-y-6">
          {children}
        </div>
      </main>
      <Toaster theme="dark" position="bottom-right" />
    </div>
  );
}
