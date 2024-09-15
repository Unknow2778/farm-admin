'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { StoreProvider } from '../context/store';
import Header from '@/components/Header';
import Login from '../login/page';

export default function ClientSideAuth({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
    setIsLoading(false);

    if (!token && pathname !== '/login') {
      router.push('/login');
    } else if (token && pathname === '/login') {
      router.push('/');
    }
  }, [pathname, router]);

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated && pathname !== '/login') {
    return <Login />;
  }

  return (
    <StoreProvider>
      <div className='min-h-screen flex flex-col container mx-auto'>
        {isAuthenticated && <Header />}
        <main className='flex-grow'>{children}</main>
      </div>
    </StoreProvider>
  );
}
