import axios from 'axios';
import { createHmac, timingSafeEqual } from 'crypto';
import { config } from '../config';

const META_API_VERSION = 'v18.0';
const BASE_URL = `https://graph.facebook.com/${META_API_VERSION}`;

interface SendTemplateParams {
  to: string;
  templateName: string;
  languageCode: string;
  parameters?: Array<{ type: 'text'; text: string }>;
}

export async function sendWhatsAppTemplate(params: SendTemplateParams) {
  const { accessToken, phoneNumberId } = config.whatsapp;
  
  if (!accessToken || !phoneNumberId) {
    throw new Error('WhatsApp config incompleta');
  }

  const payload = {
    messaging_product: 'whatsapp',
    to: params.to,
    type: 'template',
    template: {
      name: params.templateName,
      language: { code: params.languageCode },
      components: params.parameters?.length ? [
        {
          type: 'body',
          parameters: params.parameters.map(p => ({ type: 'text', text: p })),
        },
      ] : undefined,
    },
  };

  const response = await axios.post(
    `${BASE_URL}/${phoneNumberId}/messages`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    }
  );

  return response.data;
}

export async function getWhatsAppTemplates() {
  const { accessToken, phoneNumberId } = config.whatsapp;
  
  if (!accessToken || !phoneNumberId) {
    throw new Error('WhatsApp config incompleta');
  }

  const response = await axios.get(
    `${BASE_URL}/${phoneNumberId}/message_templates`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  return response.data;
}

export async function createWhatsAppTemplate(template: {
  name: string;
  language: string;
  category: 'UTILITY' | 'MARKETING' | 'AUTHENTICATION';
  components: Array<{
    type: 'HEADER' | 'BODY' | 'FOOTER' | 'BUTTONS';
    format?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT';
    text?: string;
    example?: { header_handle?: string[]; body_text?: string[][] };
    buttons?: Array<{ type: 'QUICK_REPLY' | 'URL' | 'PHONE_NUMBER'; text: string }>;
  }>;
}) {
  const { accessToken, phoneNumberId } = config.whatsapp;
  
  if (!accessToken || !phoneNumberId) {
    throw new Error('WhatsApp config incompleta');
  }

  const response = await axios.post(
    `${BASE_URL}/${phoneNumberId}/message_templates`,
    template,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    }
  );

  return response.data;
}

export async function deleteWhatsAppTemplate(name: string) {
  const { accessToken, phoneNumberId } = config.whatsapp;
  
  if (!accessToken || !phoneNumberId) {
    throw new Error('WhatsApp config incompleta');
  }

  const response = await axios.delete(
    `${BASE_URL}/${phoneNumberId}/message_templates`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: { name },
    }
  );

  return response.data;
}

export function verifyWebhookSignature(payload: string, signature: string): boolean {
  const { appSecret } = config.whatsapp;
  if (!appSecret) return false;

  const expectedSignature = `sha256=${createHmac('sha256', appSecret)
    .update(payload)
    .digest('hex')}`;

  const received = Buffer.from(signature);
  const expected = Buffer.from(expectedSignature);
  return received.length === expected.length && timingSafeEqual(received, expected);
}