
import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';
import AppShell from "@/components/app-shell";

export default async function LocaleLayout({
  children,
  params: {locale}
}: {
  children: React.ReactNode;
  params: {locale: string};
}) {
  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();
 
  return (
    <NextIntlClientProvider messages={messages}>
      <AppShell>{children}</AppShell>
    </NextIntlClientProvider>
  );
}