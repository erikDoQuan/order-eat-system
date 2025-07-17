import { Controller, Get, Res, Query } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { Response } from 'express';

@Controller('bill')
export class BillController {
  @Get('generate')
  async generateBill(
    @Res() res: Response,
    @Query('id') id: string,
    @Query('customer') customer: string,
    @Query('items') items: string,
    @Query('total') total: string,
    @Query('customerAddress') customerAddress: string,
    @Query('customerPhone') customerPhone: string,
    @Query('date') date: string,
  ) {
    let parsedItems: any[] = [];
    try {
      parsedItems = JSON.parse(decodeURIComponent(items));
    } catch (e) {
      parsedItems = [];
    }

    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="bill-${id}.pdf"`);
    res.removeHeader && res.removeHeader('X-Frame-Options');
    doc.pipe(res);

    doc.fontSize(20).text('HÓA ĐƠN THANH TOÁN', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Mã hóa đơn: ${id}`);
    doc.text(`Khách hàng: ${decodeURIComponent(customer || '')}`);
    doc.text(`Địa chỉ: ${decodeURIComponent(customerAddress || '')}`);
    if (customerPhone) doc.text(`Số điện thoại: ${customerPhone}`);
    doc.text(`Ngày thanh toán: ${decodeURIComponent(date || '')}`);
    doc.moveDown();

    doc.text('Danh sách món ăn:');
    parsedItems.forEach((item, index) => {
      doc.text(`${index + 1}. ${item.name} - SL: ${item.quantity} - Giá: ${item.price}đ`);
    });

    doc.moveDown();
    doc.fontSize(14).text(`TỔNG TIỀN: ${parseFloat(total).toLocaleString()}đ`, { align: 'right' });

    doc.end();
  }
} 