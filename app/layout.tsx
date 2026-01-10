import './globals.css';
import { Inter } from 'next/font/google';
import Background3D from './components/Background3D';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Cressets | Personal Cloud',
  description: 'Secure, 3D Web Storage',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Background3D />
        <main className="relative z-10 min-h-screen flex flex-col">
          {children}
        </main>
      </body>
    </html>
  );
}
