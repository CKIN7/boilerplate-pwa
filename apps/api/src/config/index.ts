export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  db: {
    url: process.env.DATABASE_URL || '',
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  
  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:3000',
  },
  
  whatsapp: {
    verifyToken: process.env.WHATSAPP_VERIFY_TOKEN || '',
    accessToken: process.env.WHATSAPP_ACCESS_TOKEN || '',
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
    appId: process.env.WHATSAPP_APP_ID || '',
    appSecret: process.env.WHATSAPP_APP_SECRET || '',
  },
  
  email: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.EMAIL_FROM || 'noreply@boilerplate.com',
  },
  
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  },
  
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  },
  
  mercadoPago: {
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || '',
    webhookSecret: process.env.MERCADOPAGO_WEBHOOK_SECRET || '',
  },
} as const;

export function validateConfig() {
  const required = [
    'db.url',
    'jwt.secret',
  ];
  
  const missing = required.filter(key => {
    const value = key.split('.').reduce((obj, k) => obj?.[k], config as any);
    return !value || value === '';
  });
  
  if (missing.length > 0) {
    console.warn(`⚠️  Configuración faltante: ${missing.join(', ')}`);
  }
}