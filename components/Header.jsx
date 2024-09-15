'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Moon, Sun } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import logo from '@/public/assets/logo.png';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

const NavItems = ({ onClick }) => (
  <>
    <Link
      href='/'
      className='block py-2 px-3 rounded-md hover:bg-secondary transition-colors'
      onClick={onClick}
    >
      Markets
    </Link>
    <Link
      href='/products'
      className='block py-2 px-3 rounded-md hover:bg-secondary transition-colors'
      onClick={onClick}
    >
      Products
    </Link>
    <Link
      href='/overview'
      className='block py-2 px-3 rounded-md hover:bg-secondary transition-colors'
      onClick={onClick}
    >
      Overview
    </Link>
    <Link
      href='/settings'
      className='block py-2 px-3 rounded-md hover:bg-secondary transition-colors'
      onClick={onClick}
    >
      Settings
    </Link>
  </>
);

export default function Header() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const closeSheet = () => setIsOpen(false);

  return (
    <header className='p-2 w-full'>
      <div className='flex items-center justify-between py-4 px-8 bg-background text-foreground w-full rounded-lg shadow-md border'>
        <div className='flex items-center gap-8'>
          <Link href='/' className='text-2xl font-bold'>
            <Image src={logo} alt='logo' width={40} height={40} />
          </Link>
          <nav className='hidden md:flex items-center gap-4'>
            <NavItems />
          </nav>
        </div>
        <div className='flex items-center gap-4'>
          <Button
            variant='ghost'
            size='icon'
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label='Toggle theme'
          >
            {mounted ? (
              theme === 'dark' ? (
                <Sun className='h-[1.2rem] w-[1.2rem]' />
              ) : (
                <Moon className='h-[1.2rem] w-[1.2rem]' />
              )
            ) : (
              <div className='h-[1.2rem] w-[1.2rem]' />
            )}
          </Button>
          <Avatar>
            <AvatarImage src='https://github.com/shadcn.png' />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant='outline' size='icon' className='md:hidden'>
                <Menu className='h-[1.2rem] w-[1.2rem]' />
                <span className='sr-only'>Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent>
              <nav className='flex flex-col gap-4 mt-8'>
                <NavItems onClick={closeSheet} />
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
