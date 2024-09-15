import Header from '@/components/Header';
import './globals.css';
import { ThemeProvider } from 'next-themes';
import { StoreProvider } from './context/store';
import { Toaster } from '@/components/ui/toaster';

export const metadata = {
  title: 'Farm Admin',
  description: 'Admin panel for farm management',
};

export default function RootLayout({ children }) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body>
        <ThemeProvider attribute='class' defaultTheme='system' enableSystem>
          <StoreProvider>
            <div className='min-h-screen flex flex-col container mx-auto'>
              <Header />
              <main className='flex-grow'>{children}</main>
            </div>
            <Toaster />
          </StoreProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
