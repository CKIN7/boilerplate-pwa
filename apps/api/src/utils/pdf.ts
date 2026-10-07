import PDFDocument from 'pdfkit';
import { config } from '../config';
import { formatCurrency } from '@boilerplate/utils';

export interface PDFData {
  businessName: string;
  businessLogo?: string;
  businessAddress?: string;
  businessPhone?: string;
  businessEmail?: string;
  documentTitle: string;
  documentNumber: string;
  date: Date;
  items: Array<{
    name: string;
    description?: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  subtotal: number;
  tax: number;
  total: number;
  notes?: string;
  footerText?: string;
}

export async function generatePDF(data: PDFData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const primaryColor = '#0ea5e9';
    const grayColor = '#6b7280';

    if (data.businessLogo) {
      try {
        doc.image(data.businessLogo, 50, 50, { width: 80 });
      } catch {
        // Logo failed to load, continue without it
      }
    }

    doc.fontSize(24).font('Helvetica-Bold').fillColor(primaryColor).text(data.businessName, 50, 50);
    doc.moveDown(0.5);

    doc.fontSize(10).font('Helvetica').fillColor(grayColor);
    if (data.businessAddress) doc.text(data.businessAddress);
    if (data.businessPhone) doc.text(`Tel: ${data.businessPhone}`);
    if (data.businessEmail) doc.text(`Email: ${data.businessEmail}`);
    doc.moveDown(1);

    doc.fontSize(18).font('Helvetica-Bold').fillColor('#1f2937').text(data.documentTitle);
    doc.fontSize(10).font('Helvetica').fillColor(grayColor);
    doc.text(`Número: ${data.documentNumber}`);
    doc.text(`Fecha: ${data.date.toLocaleDateString('es-ES')}`);
    doc.moveDown(1);

    doc.strokeColor('#e5e7eb').lineWidth(1).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(0.5);

    const tableTop = doc.y;
    const col1 = 50;
    const col2 = 180;
    const col3 = 380;
    const col4 = 440;
    const col5 = 500;

    doc.fontSize(9).font('Helvetica-Bold').fillColor('#374151');
    doc.text('Descripción', col1, tableTop);
    doc.text('Cant.', col2, tableTop);
    doc.text('P. Unit.', col3, tableTop);
    doc.text('Total', col5, tableTop);

    doc.strokeColor('#e5e7eb').lineWidth(0.5).moveTo(50, tableTop + 18).lineTo(545, tableTop + 18).stroke();

    let y = tableTop + 25;
    doc.font('Helvetica').fillColor('#1f2937').fontSize(9);

    data.items.forEach((item) => {
      const itemTotal = item.quantity * item.unitPrice;
      doc.text(item.name, col1, y, { width: 180 });
      if (item.description) {
        doc.fontSize(8).fillColor(grayColor).text(item.description, col1, y + 12, { width: 180 });
        doc.fontSize(9).fillColor('#1f2937');
      }
      doc.text(item.quantity.toString(), col2, y);
      doc.text(formatCurrency(item.unitPrice), col3, y);
      doc.text(formatCurrency(itemTotal), col5, y, { align: 'right' });
      y += item.description ? 28 : 18;

      if (y > 720) {
        doc.addPage();
        y = 50;
      }
    });

    doc.strokeColor('#e5e7eb').lineWidth(1).moveTo(50, y).lineTo(545, y).stroke();
    doc.moveDown(0.5);

    const totalsX = 380;
    doc.fontSize(9).font('Helvetica').fillColor('#374151');
    doc.text('Subtotal:', totalsX, y + 10);
    doc.font('Helvetica-Bold').text(formatCurrency(data.subtotal), 500, y + 10, { align: 'right' });

    if (data.tax > 0) {
      doc.font('Helvetica').text(`IVA (${(data.tax / data.subtotal * 100).toFixed(0)}%):`, totalsX, y + 25);
      doc.font('Helvetica-Bold').text(formatCurrency(data.tax), 500, y + 25, { align: 'right' });
    }

    doc.fontSize(12).font('Helvetica-Bold').fillColor(primaryColor);
    doc.text('TOTAL:', totalsX, y + (data.tax > 0 ? 45 : 25));
    doc.text(formatCurrency(data.total), 500, y + (data.tax > 0 ? 45 : 25), { align: 'right' });

    if (data.notes) {
      doc.moveDown(2);
      doc.fontSize(9).font('Helvetica-Bold').fillColor('#374151').text('Notas:');
      doc.font('Helvetica').fillColor('#1f2937').text(data.notes, { width: 495 });
    }

    if (data.footerText) {
      doc.moveDown(2);
      doc.fontSize(8).font('Helvetica').fillColor(grayColor).text(data.footerText, 50, 750, { align: 'center', width: 495 });
    }

    doc.end();
  });
}

export async function generateReservationPDF(data: {
  businessName: string;
  businessLogo?: string;
  reservation: {
    id: string;
    date: Date;
    time: string;
    service: string;
    clientName: string;
    clientPhone: string;
    clientEmail?: string;
    notes?: string;
    status: string;
  };
}): Promise<Buffer> {
  return generatePDF({
    businessName: data.businessName,
    businessLogo: data.businessLogo,
    documentTitle: 'Comprobante de Reserva',
    documentNumber: `RES-${data.reservation.id.slice(0, 8).toUpperCase()}`,
    date: new Date(),
    items: [
      {
        name: data.reservation.service,
        description: `Fecha: ${data.reservation.date.toLocaleDateString('es-ES')} a las ${data.reservation.time}`,
        quantity: 1,
        unitPrice: 0,
        total: 0,
      },
    ],
    subtotal: 0,
    tax: 0,
    total: 0,
    notes: data.reservation.notes,
    footerText: `Cliente: ${data.reservation.clientName} | Tel: ${data.reservation.clientPhone}${data.reservation.clientEmail ? ` | Email: ${data.reservation.clientEmail}` : ''} | Estado: ${data.reservation.status}`,
  });
}