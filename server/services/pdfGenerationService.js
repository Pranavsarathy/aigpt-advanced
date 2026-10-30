// server/services/pdfGenerationService.js
const PDFDocument = require('pdfkit');

/**
 * Generates a styled, publication-ready PDF document from structured JSON data.
 * Supports Invoices, Academic Reports, Resumes, Certificates, Contracts, and Manuals.
 */
function createStyledPdf(data) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 45, size: 'A4', bufferPages: true });
      const buffers = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer.toString('base64'));
      });

      const primaryColor = data.themeColor || '#0f172a'; // Deep slate or custom
      const accentColor = '#3b82f6'; // Bright blue
      const textColor = '#1e293b';
      const isCertificate = String(data.type || '').toLowerCase().includes('certificate');
      const isContract = String(data.type || '').toLowerCase().includes('contract');

      // ── Certificate Template ───────────────────────────────────────────────
      if (isCertificate) {
        // Double ornamental border
        doc.lineWidth(4).strokeColor(primaryColor).rect(20, 20, doc.page.width - 40, doc.page.height - 40).stroke();
        doc.lineWidth(1).strokeColor(accentColor).rect(26, 26, doc.page.width - 52, doc.page.height - 52).stroke();

        doc.fillColor(primaryColor).fontSize(28).font('Helvetica-Bold')
           .text(data.title || 'CERTIFICATE OF ACHIEVEMENT', 45, 120, { align: 'center', width: doc.page.width - 90 });

        doc.moveDown(0.5);
        doc.fontSize(12).font('Helvetica').fillColor('#64748b')
           .text(data.subtitle || 'This is proudly presented to', { align: 'center' });

        doc.moveDown(1);
        doc.fontSize(22).font('Helvetica-Bold').fillColor(accentColor)
           .text(data.recipient || data.summary || 'Distinguished Recipient', { align: 'center' });

        doc.moveDown(1);
        if (data.sections && data.sections[0]) {
          doc.fontSize(11).font('Helvetica').fillColor(textColor)
             .text(data.sections[0].content || '', 80, doc.y, { align: 'center', width: doc.page.width - 160, lineGap: 4 });
        }

        // Signature lines at bottom
        const sigY = doc.page.height - 140;
        doc.lineWidth(1).strokeColor('#94a3b8')
           .moveTo(80, sigY).lineTo(220, sigY).stroke()
           .moveTo(doc.page.width - 220, sigY).lineTo(doc.page.width - 80, sigY).stroke();

        doc.fontSize(9).font('Helvetica').fillColor('#64748b')
           .text('Authorized Signature', 80, sigY + 8, { width: 140, align: 'center' })
           .text(data.date || new Date().toLocaleDateString(), doc.page.width - 220, sigY + 8, { width: 140, align: 'center' });

        doc.end();
        return;
      }

      // ── Standard Publication Header Banner ────────────────────────────────
      doc.rect(0, 0, doc.page.width, 90).fill(primaryColor);
      
      doc.fillColor('#ffffff').fontSize(22).font('Helvetica-Bold')
         .text(data.title || 'OMNIAI Universal Document', 45, 24, { width: doc.page.width - 90 });
      
      doc.fontSize(10).font('Helvetica').fillColor('#cbd5e1')
         .text(data.subtitle || `Document Type: ${data.type || 'Official Report'} | Date: ${new Date().toLocaleDateString()}`, 45, 56);

      let currentY = 120;

      // ── Executive Summary / Overview ──────────────────────────────────────
      if (data.summary) {
        doc.fillColor(primaryColor).fontSize(13).font('Helvetica-Bold')
           .text('Executive Summary', 45, currentY);
        currentY += 18;

        doc.fillColor(textColor).fontSize(10).font('Helvetica')
           .text(data.summary, 45, currentY, { width: doc.page.width - 90, lineGap: 3, align: 'justify' });
        currentY = doc.y + 20;
      }

      // ── Structured Sections ───────────────────────────────────────────────
      if (Array.isArray(data.sections)) {
        for (const sec of data.sections) {
          if (currentY > doc.page.height - 120) {
            doc.addPage();
            currentY = 45;
          }

          doc.fillColor(accentColor).fontSize(12).font('Helvetica-Bold')
             .text(sec.heading || 'Section', 45, currentY);
          currentY += 16;

          doc.fillColor(textColor).fontSize(9.5).font('Helvetica')
             .text(sec.content || '', 45, currentY, { width: doc.page.width - 90, lineGap: 3 });
          currentY = doc.y + 16;
        }
      }

      // ── Data / Itemized Tables (for Invoices, Budgets, Reports) ────────────
      if (Array.isArray(data.items) && data.items.length > 0) {
        if (currentY > doc.page.height - 160) {
          doc.addPage();
          currentY = 45;
        }

        doc.fillColor(primaryColor).fontSize(12).font('Helvetica-Bold')
           .text(data.tableTitle || 'Itemized Breakdown', 45, currentY);
        currentY += 18;

        // Table Header
        const tableWidth = doc.page.width - 90;
        doc.rect(45, currentY, tableWidth, 22).fill('#f1f5f9');
        doc.fillColor('#334155').fontSize(9).font('Helvetica-Bold')
           .text('Description', 55, currentY + 6)
           .text('Qty', 340, currentY + 6)
           .text('Amount', 440, currentY + 6);
        currentY += 26;

        let totalAmount = 0;
        for (const item of data.items) {
          if (currentY > doc.page.height - 60) {
            doc.addPage();
            currentY = 45;
          }

          doc.fillColor('#475569').fontSize(9).font('Helvetica')
             .text(item.name || item.description || '-', 55, currentY, { width: 270 })
             .text(String(item.quantity || 1), 340, currentY)
             .text(`$${Number(item.amount || item.price || 0).toFixed(2)}`, 440, currentY);

          totalAmount += Number(item.amount || item.price || 0) * Number(item.quantity || 1);
          currentY += 18;
        }

        // Total Row
        doc.rect(45, currentY, tableWidth, 24).fill('#e2e8f0');
        doc.fillColor(primaryColor).fontSize(10).font('Helvetica-Bold')
           .text('Total Balance Due', 55, currentY + 7)
           .text(`$${totalAmount.toFixed(2)}`, 440, currentY + 7);
        currentY += 35;
      }

      // ── Contract Signatures ───────────────────────────────────────────────
      if (isContract) {
        if (currentY > doc.page.height - 130) {
          doc.addPage();
          currentY = 50;
        }

        currentY += 20;
        doc.lineWidth(1).strokeColor('#94a3b8')
           .moveTo(45, currentY).lineTo(220, currentY).stroke()
           .moveTo(doc.page.width - 220, currentY).lineTo(doc.page.width - 45, currentY).stroke();

        doc.fontSize(8.5).font('Helvetica').fillColor('#64748b')
           .text('Party A Signature / Date', 45, currentY + 6, { width: 175, align: 'center' })
           .text('Party B Signature / Date', doc.page.width - 220, currentY + 6, { width: 175, align: 'center' });
      }

      // ── Footers with page numbering ───────────────────────────────────────
      const range = doc.bufferedPageRange();
      for (let i = range.start; i < range.start + range.count; i++) {
        doc.switchToPage(i);
        doc.fontSize(8).font('Helvetica').fillColor('#94a3b8')
           .text(`OMNIAI Universal Document Studio — Page ${i + 1} of ${range.count}`, 45, doc.page.height - 24, {
             align: 'center',
             width: doc.page.width - 90
           });
      }

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = { createStyledPdf };
