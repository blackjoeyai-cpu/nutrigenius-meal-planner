
import AppShell from '@/components/app-shell';

export const metadata = {
    title: 'NutriGenius | My Plans',
    description: 'View and manage your saved meal plans.',
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
