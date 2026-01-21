'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export function useAuth(requireAdmin = false) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const studentData = localStorage.getItem('student');
    const adminData = localStorage.getItem('admin');

    if (requireAdmin) {
      if (!adminData) {
        if (pathname !== '/admin/login') {
          router.push('/admin/login');
        }
      } else {
        setUser(JSON.parse(adminData));
      }
    } else {
      if (!studentData) {
        if (pathname !== '/login') {
          router.push('/login');
        }
      } else {
        setUser(JSON.parse(studentData));
      }
    }
    setLoading(false);
  }, [router, requireAdmin, pathname]);

  const logout = () => {
    if (requireAdmin) {
      localStorage.removeItem('admin');
      router.push('/admin/login');
    } else {
      localStorage.removeItem('student');
      router.push('/login');
    }
  };

  return { user, loading, logout };
}
