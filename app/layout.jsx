import Header from '@/components/Header';
import './globals.css';
import { ThemeProvider } from 'next-themes';
import { StoreProvider } from './context/store';
import { Toaster } from '@/components/ui/toaster';
import ClientSideAuth from './components/ClientSideAuth';

export const metadata = {
  title: 'Farm Admin',
  description: 'Admin panel for farm management',
};

export default function RootLayout({ children }) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body>
        <ThemeProvider attribute='class' defaultTheme='system' enableSystem>
          <ClientSideAuth>{children}</ClientSideAuth>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
