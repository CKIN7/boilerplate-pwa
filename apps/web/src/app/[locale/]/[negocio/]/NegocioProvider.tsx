'use client';

import { createContext, useContext, useEffect, useMemo, ReactNode } from 'react';
import type { NegocioConfig } from '@/lib/config/schemas';

interface NegocioContextType {
  config: NegocioConfig;
  primaryColor: string;
  secondaryColor: string;
}

const NegocioContext = createContext<NegocioContextType | null>(null);

export function NegocioProvider({ config, children }: { config: NegocioConfig; children: ReactNode }) {
  const contextValue = useMemo(() => ({
    config,
    primaryColor: config.branding.colorPrimario,
    secondaryColor: config.branding.colorSecundario,
  }), [config]);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--primary', config.branding.colorPrimario);
    root.style.setProperty('--primary-foreground', '#ffffff');
    root.style.setProperty('--secondary', config.branding.colorSecundario);
    
    if (config.branding.fuente) {
      root.style.setProperty('--font-family', config.branding.fuente);
    }
  }, [config]);

  return (
    <NegocioContext.Provider value={contextValue}>
      {children}
    </NegocioContext.Provider>
  );
}

export function useNegocio() {
  const context = useContext(NegocioContext);
  if (!context) {
    throw new Error('useNegocio must be used within a NegocioProvider');
  }
  return context;
}