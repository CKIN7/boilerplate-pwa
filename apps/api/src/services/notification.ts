import { db } from '@boilerplate/db';
import { notificaciones, reservas, clientes, items, negocios } from '@boilerplate/db/schema';
import { eq, and, desc, gte, lt } from 'drizzle-orm';
import { sql } from 'drizzle-orm';
import { sendEmail, getBookingConfirmationTemplate, getBookingReminderTemplate, getCancellationTemplate } from '../utils/email';
import { sendWhatsAppTemplate } from '../utils/whatsapp';

export interface NotificationPayload {
  tipo: 'confirmacion' | 'recordatorio' | 'cancelacion' | 'nueva_reserva' | 'personalizada';
  reservaId: string;
  negocioId: string;
  clienteId?: string;
  canal: 'email' | 'whatsapp' | 'push';
  prioridad?: 'alta' | 'normal' | 'baja';
  datos?: Record<string, any>;
  programadaPara?: Date;
}

export class NotificationService {
  static async enqueue(payload: NotificationPayload) {
    const [notification] = await db.insert(notificaciones).values({
      negocioId: payload.negocioId,
      reservaId: payload.reservaId,
      tipo: payload.tipo,
      canal: payload.canal,
      estado: 'pendiente',
      payload: payload.datos || {},
      enviadoAt: null,
    }).returning();

    if (payload.programadaPara && payload.programadaPara > new Date()) {
      return notification;
    }

    await this.process(notification.id);
    return notification;
  }

  static async process(notificationId: string) {
    const [notification] = await db.select()
      .from(notificaciones)
      .where(eq(notificaciones.id, notificationId));

    if (!notification || notification.estado !== 'pendiente') {
      return;
    }

    try {
      let success = false;

      switch (notification.canal) {
        case 'email':
          success = await this.sendEmailNotification(notification);
          break;
        case 'whatsapp':
          success = await this.sendWhatsAppNotification(notification);
          break;
        case 'push':
          success = await this.sendPushNotification(notification);
          break;
      }

      await db.update(notificaciones)
        .set({
          estado: success ? 'enviado' : 'fallido',
          enviadoAt: new Date(),
        })
        .where(eq(notificaciones.id, notificationId));

    } catch (error) {
      console.error('Error processing notification:', error);
      await db.update(notificaciones)
        .set({ estado: 'fallido', enviadoAt: new Date() })
        .where(eq(notificaciones.id, notificationId));
    }
  }

  private static async sendEmailNotification(notification: any): Promise<boolean> {
    const { tipo, payload } = notification;

    let template: { html: string; text: string };
    let subject = '';

    switch (tipo) {
      case 'confirmacion':
        template = getBookingConfirmationTemplate(payload);
        subject = `Confirmación de reserva - ${payload.businessName}`;
        break;
      case 'recordatorio':
        template = getBookingReminderTemplate(payload);
        subject = `Recordatorio: Tu reserva mañana - ${payload.businessName}`;
        break;
      case 'cancelacion':
        template = getCancellationTemplate(payload);
        subject = `Reserva cancelada - ${payload.businessName}`;
        break;
      case 'personalizada':
        template = {
          html: payload.html || '<p>Sin contenido</p>',
          text: payload.text || 'Sin contenido',
        };
        subject = payload.subject || 'Notificación';
        break;
      default:
        return false;
    }

    return sendEmail({
      to: payload.email || payload.clienteEmail,
      subject,
      html: template.html,
      text: template.text,
    });
  }

  private static async sendWhatsAppNotification(notification: any): Promise<boolean> {
    const { tipo, payload } = notification;

    let templateName = '';
    let parameters: string[] = [];

    switch (tipo) {
      case 'confirmacion':
        templateName = 'booking_confirmation';
        parameters = [
          payload.clientName,
          payload.service,
          new Date(payload.date).toLocaleDateString('es-ES'),
          payload.time,
        ];
        break;
      case 'recordatorio':
        templateName = 'booking_reminder';
        parameters = [
          payload.clientName,
          payload.service,
          new Date(payload.date).toLocaleDateString('es-ES'),
          payload.time,
        ];
        break;
      case 'cancelacion':
        templateName = 'booking_cancellation';
        parameters = [
          payload.clientName,
          payload.service,
          new Date(payload.date).toLocaleDateString('es-ES'),
          payload.time,
        ];
        break;
      default:
        return false;
    }

    try {
      await sendWhatsAppTemplate({
        to: payload.phone || payload.clientePhone,
        templateName,
        languageCode: 'es',
        parameters: parameters.map(p => ({ type: 'text', text: p })),
      });
      return true;
    } catch {
      return false;
    }
  }

  private static async sendPushNotification(_notification: any): Promise<boolean> {
    return true;
  }

  static async processPending() {
    const pending = await db.select()
      .from(notificaciones)
      .where(and(
        eq(notificaciones.estado, 'pendiente'),
        or(
          sql`${notificaciones.programadaPara} IS NULL`,
          lt(notificaciones.programadaPara, new Date())
        )
      ))
      .limit(50);

    for (const notification of pending) {
      await this.process(notification.id);
    }
  }

  static async processReminders() {
    const manana = new Date();
    manana.setDate(manana.getDate() + 1);
    manana.setHours(0, 0, 0, 0);
    const pasadoManana = new Date(manana);
    pasadoManana.setDate(pasadoManana.getDate() + 1);

    const reservasManana = await db.select({
      id: reservas.id,
      clienteId: reservas.clienteId,
      negocioId: reservas.negocioId,
      fechaInicio: reservas.fechaInicio,
      item: {
        nombre: items.nombre,
      },
      cliente: {
        nombre: clientes.nombre,
        email: clientes.email,
        telefono: clientes.telefono,
      },
      negocio: {
        configJson: negocios.configJson,
      },
    })
      .from(reservas)
      .leftJoin(clientes, eq(reservas.clienteId, clientes.id))
      .leftJoin(items, eq(reservas.itemId, items.id))
      .leftJoin(negocios, eq(reservas.negocioId, negocios.id))
      .where(and(
        gte(reservas.fechaInicio, manana),
        lt(reservas.fechaInicio, pasadoManana),
        or(eq(reservas.estado, 'pendiente'), eq(reservas.estado, 'confirmada')),
      ));

    for (const reserva of reservasManana) {
      const config = reserva.negocio?.configJson as any;

      await this.enqueue({
        tipo: 'recordatorio',
        reservaId: reserva.id,
        negocioId: reserva.negocioId,
        clienteId: reserva.clienteId,
        canal: 'email',
        datos: {
          businessName: config?.branding?.nombre || reserva.negocio?.nombre || 'Negocio',
          businessLogo: config?.branding?.logo,
          clientName: reserva.cliente?.nombre || 'Cliente',
          service: reserva.item?.nombre || 'Servicio',
          date: reserva.fechaInicio,
          time: reserva.fechaInicio.toTimeString().slice(0, 5),
          whatsappNumber: config?.integraciones?.whatsapp,
        },
      });

      if (config?.integraciones?.whatsapp) {
        await this.enqueue({
          tipo: 'recordatorio',
          reservaId: reserva.id,
          negocioId: reserva.negocioId,
          clienteId: reserva.clienteId,
          canal: 'whatsapp',
          datos: {
            clientName: reserva.cliente?.nombre || 'Cliente',
            service: reserva.item?.nombre || 'Servicio',
            date: reserva.fechaInicio.toISOString().split('T')[0],
            time: reserva.fechaInicio.toTimeString().slice(0, 5),
            phone: reserva.cliente?.telefono,
          },
        });
      }
    }
  }

  static async enqueue(payload: {
    tipo: 'confirmacion' | 'recordatorio' | 'cancelacion' | 'nueva_reserva' | 'personalizada';
    reservaId: string;
    negocioId: string;
    clienteId?: string;
    canal: 'email' | 'whatsapp' | 'push';
    prioridad?: 'alta' | 'normal' | 'baja';
    datos?: Record<string, any>;
    programadaPara?: Date;
  }) {
    const [notification] = await db.insert(notificaciones).values({
      negocioId: payload.negocioId,
      reservaId: payload.reservaId,
      tipo: payload.tipo,
      canal: payload.canal,
      estado: 'pendiente',
      payload: payload.datos || {},
      enviadoAt: null,
    }).returning();

    if (payload.programadaPara && payload.programadaPara > new Date()) {
      return notification;
    }

    await this.process(notification.id);
    return notification;
  }
}