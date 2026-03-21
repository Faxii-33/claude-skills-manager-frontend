import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Skills Manager',
  description: 'Manage your team\'s Claude MCP skills',
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
