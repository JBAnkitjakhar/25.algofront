// src/app/compiler/page.tsx

'use client';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import UserLayout from '@/components/layout/UserLayout';
import { CompilerLayout } from '@/components/compiler/CompilerLayout';

function CompilerContent() {
  return (
    <UserLayout>
      <CompilerLayout />
    </UserLayout>
  );
}

export default function CompilerPage() {
  return (
    <ProtectedRoute>
      <CompilerContent />
    </ProtectedRoute>
  );
}