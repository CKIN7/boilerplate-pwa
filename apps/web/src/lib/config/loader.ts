import { NegocioConfigSchema, type NegocioConfig } from './schemas';

const configs: Record<string, NegocioConfig> = {
  'restaurante-el-sabor': {
    negocioId: 'restaurante-el-sabor',
    slug: 'restaurante-el-sabor',
    rubro: 'restaurante',
    branding: {
      nombre: 'Restaurante El Sabor',
      logo: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200&h=200&fit=crop',
      colorPrimario: '#F59E0B',
      colorSecundario: '#FEF3C7',
      fuente: 'Inter',
    },
    modulos: {
      reservas: true,
      catalogo: true,
      carrito: true,
      puntos: true,
      recordatorios: true,
      resenas: true,
    },
    textos: {
      es: {
        heroTitulo: 'Reserva tu mesa en 2 clics',
        heroSubtitulo: 'Sin llamadas, sin esperas. Disfruta de la mejor comida casera.',
        cta: 'Reservar Mesa',
      },
      en: {
        heroTitulo: 'Book your table in 2 clicks',
        heroSubtitulo: 'No calls, no waiting. Enjoy the best homemade food.',
        cta: 'Book Table',
      },
    },
    integraciones: {
      whatsapp: '+584241234567',
      googleMaps: 'https://maps.google.com/?q=restaurante+el+sabor',
      calendario: 'google',
    },
    seo: {
      title: 'Restaurante El Sabor - Reserva Online',
      description: 'Reserva tu mesa online 24/7. Comida casera, ambiente familiar.',
      ogImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&h=630&fit=crop',
    },
  },
  'clinica-dental-sonrisa': {
    negocioId: 'clinica-dental-sonrisa',
    slug: 'clinica-dental-sonrisa',
    rubro: 'clinica',
    branding: {
      nombre: 'Clínica Dental Sonrisa',
      logo: 'https://images.unsplash.com/photo-1606811626821-6b5f2b8b8b8b?w=200&h=200&fit=crop',
      colorPrimario: '#0EA5E9',
      colorSecundario: '#F0F9FF',
      fuente: 'Inter',
    },
    modulos: {
      reservas: true,
      catalogo: true,
      carrito: false,
      puntos: false,
      recordatorios: true,
      resenas: true,
    },
    textos: {
      es: {
        heroTitulo: 'Reserva tu cita en 2 clics',
        heroSubtitulo: 'Sin llamadas, sin esperas. Odontología integral y estética.',
        cta: 'Reservar Cita',
      },
      en: {
        heroTitulo: 'Book your appointment in 2 clicks',
        heroSubtitulo: 'No calls, no waiting. Comprehensive and aesthetic dentistry.',
        cta: 'Book Appointment',
      },
    },
    integraciones: {
      whatsapp: '+584241234568',
      googleMaps: 'https://maps.google.com/?q=clinica+dental+sonrisa',
      calendario: 'google',
    },
    seo: {
      title: 'Clínica Dental Sonrisa - Reserva Online',
      description: 'Reserva tu cita dental online 24/7. Odontología integral.',
      ogImage: 'https://images.unsplash.com/photo-1606811626821-6b5f2b8b8b8b?w=1200&h=630&fit=crop',
    },
  },
  'barberia-clasica': {
    negocioId: 'barberia-clasica',
    slug: 'barberia-clasica',
    rubro: 'barberia',
    branding: {
      nombre: 'Barbería Clásica',
      logo: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=200&h=200&fit=crop',
      colorPrimario: '#44403C',
      colorSecundario: '#F5F5F4',
      fuente: 'Inter',
    },
    modulos: {
      reservas: true,
      catalogo: true,
      carrito: false,
      puntos: true,
      recordatorios: true,
      resenas: true,
    },
    textos: {
      es: {
        heroTitulo: 'Reserva tu corte en 2 clics',
        heroSubtitulo: 'Cortes tradicionales, arreglo de barba, experiencia premium.',
        cta: 'Reservar Corte',
      },
      en: {
        heroTitulo: 'Book your cut in 2 clicks',
        heroSubtitulo: 'Traditional cuts, beard trimming, premium experience.',
        cta: 'Book Cut',
      },
    },
    integraciones: {
      whatsapp: '+584241234569',
      googleMaps: 'https://maps.google.com/?q=barberia+clasica',
      calendario: 'google',
    },
    seo: {
      title: 'Barbería Clásica - Reserva Online',
      description: 'Reserva tu corte online. Cortes tradicionales y arreglo de barba.',
      ogImage: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=1200&h=630&fit=crop',
    },
  },
  'gym-fitlife': {
    negocioId: 'gym-fitlife',
    slug: 'gym-fitlife',
    rubro: 'gimnasio',
    branding: {
      nombre: 'Gym FitLife',
      logo: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=200&h=200&fit=crop',
      colorPrimario: '#E11D48',
      colorSecundario: '#FFF1F2',
      fuente: 'Inter',
    },
    modulos: {
      reservas: true,
      catalogo: true,
      carrito: false,
      puntos: true,
      recordatorios: true,
      resenas: true,
    },
    textos: {
      es: {
        heroTitulo: 'Reserva tu clase en 2 clics',
        heroSubtitulo: 'Entrenamiento personalizado, clases grupales, nutrición.',
        cta: 'Reservar Clase',
      },
      en: {
        heroTitulo: 'Book your class in 2 clicks',
        heroSubtitulo: 'Personal training, group classes, nutrition.',
        cta: 'Book Class',
      },
    },
    integraciones: {
      whatsapp: '+584241234570',
      googleMaps: 'https://maps.google.com/?q=gym+fitlife',
      calendario: 'google',
    },
    seo: {
      title: 'Gym FitLife - Reserva Online',
      description: 'Reserva tu clase de gimnasio online. Entrenamiento personalizado.',
      ogImage: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&h=630&fit=crop',
    },
  },
  'tienda-moda-urbana': {
    negocioId: 'tienda-moda-urbana',
    slug: 'tienda-moda-urbana',
    rubro: 'tienda',
    branding: {
      nombre: 'Tienda Moda Urbana',
      logo: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=200&h=200&fit=crop',
      colorPrimario: '#7C3AED',
      colorSecundario: '#F5F3FF',
      fuente: 'Inter',
    },
    modulos: {
      reservas: false,
      catalogo: true,
      carrito: true,
      puntos: true,
      recordatorios: false,
      resenas: true,
    },
    textos: {
      es: {
        heroTitulo: 'Compra en 2 clics',
        heroSubtitulo: 'Ropa y accesorios tendencia. Envío gratis desde $50.',
        cta: 'Ver Catálogo',
      },
      en: {
        heroTitulo: 'Shop in 2 clicks',
        heroSubtitulo: 'Trendy clothes and accessories. Free shipping over $50.',
        cta: 'View Catalog',
      },
    },
    integraciones: {
      whatsapp: '+584241234571',
      googleMaps: 'https://maps.google.com/?q=tienda+moda+urbana',
      calendario: 'none',
    },
    seo: {
      title: 'Tienda Moda Urbana - Compra Online',
      description: 'Compra ropa y accesorios tendencia online. Envío gratis.',
      ogImage: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1200&h=630&fit=crop',
    },
  },
};

configs['demo'] = configs['restaurante-el-sabor'];

export function getNegocioConfig(slug: string): NegocioConfig | null {
  return configs[slug] || null;
}

export function getAllNegocioSlugs(): string[] {
  return Object.keys(configs);
}

export function validateNegocioConfig(config: unknown): NegocioConfig {
  return NegocioConfigSchema.parse(config);
}