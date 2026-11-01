import React from 'react';
import { getAdminSession } from '@/lib/auth';
import AdminSidebar from '@/components/AdminSidebar';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();

  // If unauthenticated, render children directly (allows /admin/login to render standalone full screen)
  if (!session) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-brand-ivory flex flex-col lg:flex-row">
      <AdminSidebar />
      <div className="flex-1 min-w-0 flex flex-col bg-architectural-grid">
        <main className="flex-1 p-4 sm:p-8 lg:p-10 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
