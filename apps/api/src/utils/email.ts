import nodemailer from 'nodemailer';
import { config } from '../config';

interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.port === 465,
      auth: {
        user: config.email.user,
        pass: config.email.pass,
      },
    });
  }
  return transporter;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  const transporter = getTransporter();

  try {
    await transporter.sendMail({
      from: config.email.from,
      to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      attachments: options.attachments,
    });
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

export function getBookingConfirmationTemplate(data: {
  businessName: string;
  businessLogo?: string;
  clientName: string;
  service: string;
  date: Date;
  time: string;
  notes?: string;
  whatsappNumber?: string;
}): { html: string; text: string } {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #0ea5e9, #3b82f6); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
    .content { background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
    .footer { background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb; border-top: none; font-size: 12px; color: #6b7280; }
    .detail { background: #f9fafb; padding: 15px; border-radius: 8px; margin: 15px 0; }
    .label { font-weight: 600; color: #374151; display: inline-block; width: 120px; }
    .value { color: #1f2937; }
    .btn { display: inline-block; background: #0ea5e9; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      ${data.businessLogo ? `<img src="${data.businessLogo}" alt="${data.businessName}" style="max-height: 60px; margin-bottom: 10px;">` : ''}
      <h1>${data.businessName}</h1>
      <p>Tu reserva ha sido confirmada</p>
    </div>
    <div class="content">
      <p>Hola <strong>${data.clientName}</strong>,</p>
      <p>Tu reserva ha sido confirmada exitosamente. Aquí están los detalles:</p>
      
      <div class="detail">
        <span class="label">Servicio:</span>
        <span class="value">${data.service}</span>
      </div>
      <div class="detail">
        <span class="label">Fecha:</span>
        <span class="value">${data.date.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
      </div>
      <div class="detail">
        <span class="label">Hora:</span>
        <span class="value">${data.time}</span>
      </div>
      ${data.notes ? `<div class="detail"><span class="label">Notas:</span><span class="value">${data.notes}</span></div>` : ''}
      
      ${data.whatsappNumber ? `
      <p style="text-align: center; margin-top: 25px;">
        <a href="https://wa.me/${data.whatsappNumber.replace(/\D/g, '')}" class="btn">Contactar por WhatsApp</a>
      </p>
      ` : ''}
      
      <p style="margin-top: 25px; color: #6b7280; font-size: 14px;">
        Si necesitas modificar o cancelar tu reserva, contáctanos con anticipación.
      </p>
    </div>
    <div class="footer">
      <p>${data.businessName} - Todos los derechos reservados</p>
      <p>Este es un correo automático, por favor no respondas directamente.</p>
    </div>
  </div>
</body>
</html>`;

  const text = `
${data.businessName}
Tu reserva ha sido confirmada

Hola ${data.clientName},

Tu reserva ha sido confirmada exitosamente:

Servicio: ${data.service}
Fecha: ${data.date.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
Hora: ${data.time}
${data.notes ? `Notas: ${data.notes}` : ''}

${data.whatsappNumber ? `Contactar por WhatsApp: https://wa.me/${data.whatsappNumber.replace(/\D/g, '')}` : ''}

Si necesitas modificar o cancelar tu reserva, contáctanos con anticipación.

---
${data.businessName} - Este es un correo automático
`;

  return { html, text };
}

export function getBookingReminderTemplate(data: {
  businessName: string;
  businessLogo?: string;
  clientName: string;
  service: string;
  date: Date;
  time: string;
  whatsappNumber?: string;
}): { html: string; text: string } {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #f59e0b, #f97316); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
    .content { background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
    .footer { background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb; border-top: none; font-size: 12px; color: #6b7280; }
    .detail { background: #fef3c7; border: 1px solid #fcd34d; padding: 15px; border-radius: 8px; margin: 15px 0; }
    .label { font-weight: 600; color: #92400e; display: inline-block; width: 120px; }
    .value { color: #92400e; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      ${data.businessLogo ? `<img src="${data.businessLogo}" alt="${data.businessName}" style="max-height: 60px; margin-bottom: 10px;">` : ''}
      <h1>${data.businessName}</h1>
      <p>Recordatorio de tu reserva mañana</p>
    </div>
    <div class="content">
      <p>Hola <strong>${data.clientName}</strong>,</p>
      <p>Te recordamos que tienes una reserva programada para mañana:</p>
      
      <div class="detail">
        <span class="label">Servicio:</span>
        <span class="value">${data.service}</span>
      </div>
      <div class="detail">
        <span class="label">Fecha:</span>
        <span class="value">${data.date.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
      </div>
      <div class="detail">
        <span class="label">Hora:</span>
        <span class="value">${data.time}</span>
      </div>
      
      ${data.whatsappNumber ? `
      <p style="text-align: center; margin-top: 25px;">
        <a href="https://wa.me/${data.whatsappNumber.replace(/\D/g, '')}" style="display: inline-block; background: #f59e0b; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">Contactar por WhatsApp</a>
      </p>
      ` : ''}
    </div>
    <div class="footer">
      <p>${data.businessName} - Todos los derechos reservados</p>
    </div>
  </div>
</body>
</html>`;

  const text = `
${data.businessName}
Recordatorio de tu reserva mañana

Hola ${data.clientName},

Te recordamos que tienes una reserva programada para mañana:

Servicio: ${data.service}
Fecha: ${data.date.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
Hora: ${data.time}

${data.whatsappNumber ? `Contactar por WhatsApp: https://wa.me/${data.whatsappNumber.replace(/\D/g, '')}` : ''}

---
${data.businessName}
`;

  return { html, text };
}

export function getCancellationTemplate(data: {
  businessName: string;
  businessLogo?: string;
  clientName: string;
  service: string;
  date: Date;
  time: string;
  reason?: string;
}): { html: string; text: string } {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #ef4444, #dc2626); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
    .content { background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
    .footer { background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb; border-top: none; font-size: 12px; color: #6b7280; }
    .detail { background: #fef2f2; border: 1px solid #fecaca; padding: 15px; border-radius: 8px; margin: 15px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      ${data.businessLogo ? `<img src="${data.businessLogo}" alt="${data.businessName}" style="max-height: 60px; margin-bottom: 10px;">` : ''}
      <h1>${data.businessName}</h1>
      <p>Reserva cancelada</p>
    </div>
    <div class="content">
      <p>Hola <strong>${data.clientName}</strong>,</p>
      <p>Tu reserva ha sido cancelada:</p>
      
      <div class="detail">
        <strong>Servicio:</strong> ${data.service}<br>
        <strong>Fecha:</strong> ${data.date.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}<br>
        <strong>Hora:</strong> ${data.time}
      </div>
      
      ${data.reason ? `<p><strong>Motivo:</strong> ${data.reason}</p>` : ''}
      <p>Si fue un error o deseas reagendar, contáctanos.</p>
    </div>
    <div class="footer">
      <p>${data.businessName} - Todos los derechos reservados</p>
    </div>
  </div>
</body>
</html>`;

  const text = `
${data.businessName}
Reserva cancelada

Hola ${data.clientName},

Tu reserva ha sido cancelada:

Servicio: ${data.service}
Fecha: ${data.date.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
Hora: ${data.time}
${data.reason ? `Motivo: ${data.reason}` : ''}

Si fue un error o deseas reagendar, contáctanos.

---
${data.businessName}
`;

  return { html, text };
}