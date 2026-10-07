import { notFound } from 'next/navigation';
import { getNegocioConfig } from '@/lib/config/loader';
import { NegocioProvider } from './NegocioProvider';

interface NegocioLayoutProps {
  children: React.ReactNode;
  params: { locale: string; negocio: string };
}

export default async function NegocioLayout({
  children,
  params,
}: NegocioLayoutProps) {
  const config = getNegocioConfig(params.negocio);

  if (!config) {
    notFound();
  }

  return (
    <NegocioProvider config={config}>
      {children}
    </NegocioProvider>
  );
}