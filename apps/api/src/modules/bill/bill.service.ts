import * as PDFDocument from 'pdfkit';
import { Response } from 'express';
import { Injectable } from '@nestjs/common';

@Injectable()
export class BillService {
  async generateBillPDF(res: Response, billData: any) {
    const doc = new PDFDocument({ margin: 36, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename=bill.pdf');
    doc.pipe(res);

    // Header
    doc
      .fontSize(18)
      .font('Helvetica-Bold')
      .text('Công ty Vũ An', 36, 36)
      .fontSize(10)
      .font('Helvetica')
      .text('trangwebhay.vn', 36, 60)
      .fontSize(22)
      .font('Helvetica-Bold')
      .text('HÓA ĐƠN', 0, 36, { align: 'right' });

    doc.moveDown(2);

    // Thông tin khách hàng & đơn hàng
    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .text(billData.customerName, 36)
      .font('Helvetica')
      .fontSize(10)
      .text(billData.customerAddress || '', 36)
      .text(billData.customerPhone ? `SĐT: ${billData.customerPhone}` : '', 36)
      .moveDown(0.5)
      .font('Helvetica-Bold')
      .text(`Hóa đơn #${billData.id}`, 400, 100)
      .font('Helvetica')
      .text(`Ngày: ${billData.date || new Date().toLocaleDateString('vi-VN')}`, 400, 115);

    doc.moveDown(2);

    // Bảng món ăn
    const tableTop = 160;
    const itemHeight = 24;
    doc
      .font('Helvetica-Bold')
      .fontSize(11)
      .text('Mục', 36, tableTop)
      .text('Số lượng', 220, tableTop)
      .text('Đơn giá', 320, tableTop)
      .text('Thành tiền', 420, tableTop);

    doc.moveTo(36, tableTop + 18).lineTo(560, tableTop + 18).stroke();

    let y = tableTop + 24;
    doc.font('Helvetica').fontSize(11);
    billData.items.forEach((item, idx) => {
      doc
        .text(item.name, 36, y)
        .text(item.quantity, 220, y)
        .text(Number(item.price).toLocaleString('vi-VN') + 'đ', 320, y)
        .text((item.quantity * item.price).toLocaleString('vi-VN') + 'đ', 420, y);
      y += itemHeight;
    });

    doc.moveTo(36, y).lineTo(560, y).stroke();

    // Tổng cộng
    doc
      .font('Helvetica-Bold')
      .fontSize(12)
      .text('Tổng cộng:', 320, y + 10)
      .text(Number(billData.total).toLocaleString('vi-VN') + 'đ', 420, y + 10);

    // Thông tin thanh toán (nếu có)
    if (billData.paymentInfo) {
      doc.moveDown(2);
      doc.font('Helvetica').fontSize(10).text('Thông tin Thanh toán:', 36, y + 40);
      doc.text(billData.paymentInfo, 36, y + 55);
    }

    // Footer
    doc
      .fontSize(10)
      .font('Helvetica-Oblique')
      .text('Cảm ơn quý khách đã sử dụng dịch vụ!', 36, 760, { align: 'center' });

    doc.end();
  }
} 