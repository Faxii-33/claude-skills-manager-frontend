import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Claude Skills Manager',
  description: 'Manage your team\'s Claude MCP skills',
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-surface-950">
        {children}
      </body>
    </html>
  );
}
