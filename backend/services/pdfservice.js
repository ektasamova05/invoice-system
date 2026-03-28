const PDFDocument = require("pdfkit");

const generateInvoicePDF = (invoice) => {
  const doc = new PDFDocument({ margin: 40 });

  // ===============================
  // COMPANY HEADER
  // ===============================
  doc
    .fontSize(18)
    .text("YOUR COMPANY NAME", { align: "center" })
    .fontSize(10)
    .text("Address Line 1, City, State, Pincode", { align: "center" })
    .text("Phone: 9876543210 | Email: company@email.com", { align: "center" })
    .moveDown(2);

  // ===============================
  // INVOICE TITLE
  // ===============================
  doc
    .fontSize(20)
    .text("TAX INVOICE", { align: "center" })
    .moveDown();

  // ===============================
  // INVOICE + CUSTOMER DETAILS
  // ===============================
  doc
    .fontSize(12)
    .text(`Invoice No: ${invoice.invoiceNo}`, 40, 180)
    .text(
      `Date: ${new Date(invoice.createdAt).toLocaleDateString()}`,
      400,
      180
    );

  doc.moveDown(2);

  doc
    .fontSize(12)
    .text("Bill To:", 40, 220)
    .text(`Name: ${invoice.customer?.name || ""}`)
    .text(`Mobile: ${invoice.customer?.mobile || ""}`)
    .text(`Address: ${invoice.customer?.address || ""}`)
    .text(`GST No: ${invoice.customer?.gst_number || ""}`);

  doc.moveDown(2);

  // ===============================
  // TABLE HEADER
  // ===============================
  const tableTop = 320;

  doc
    .fontSize(11)
    .text("No", 40, tableTop)
    .text("Product", 80, tableTop)
    .text("Rate", 250, tableTop)
    .text("Qty", 320, tableTop)
    .text("GST%", 380, tableTop)
    .text("Total", 450, tableTop);

  doc.moveTo(40, tableTop + 15)
     .lineTo(550, tableTop + 15)
     .stroke();

  // ===============================
  // TABLE ROWS
  // ===============================
  let position = tableTop + 25;
  let subtotal = 0;
  let totalGST = 0;

  (invoice.products || []).forEach((item, index) => {
    const base = item.rate * item.quantity;
    const gstAmount = (base * item.gstSlab) / 100;
    const total = base + gstAmount;

    subtotal += base;
    totalGST += gstAmount;

    doc
      .fontSize(10)
      .text(index + 1, 40, position)
      .text(item.product, 80, position)
      .text(`rs${item.rate}`, 250, position)
      .text(item.quantity, 320, position)
      .text(`${item.gstSlab}%`, 380, position)
      .text(`rs${total.toFixed(2)}`, 450, position);

    position += 20;
  });

  // ===============================
  // TOTAL SECTION
  // ===============================
  doc.moveDown();

  doc
    .moveTo(300, position)
    .lineTo(550, position)
    .stroke();

  position += 15;

  doc
    .fontSize(12)
    .text(`Subtotal: rs${subtotal.toFixed(2)}`, 350, position);

  position += 20;

  doc
    .text(`Total GST: rs${totalGST.toFixed(2)}`, 350, position);

  position += 20;

  doc
    .fontSize(14)
    .text(`Grand Total: rs${(subtotal + totalGST).toFixed(2)}`, 350, position);

  position += 40;

  // ===============================
  // FOOTER
  // ===============================
  doc
    .fontSize(10)
    .text("Thank you for your business!", 40, position, {
      align: "center",
    });

  return doc;
};

module.exports = { generateInvoicePDF };



// const PDFDocument = require("pdfkit");

// const generateInvoicePDF = (invoice) => {
//   const doc = new PDFDocument({ margin: 40 });

//   // Title
//   doc.fontSize(20).text("INVOICE", { align: "center" });
//   doc.moveDown();

//   // Invoice Info
//   doc.fontSize(12).text(`Invoice No: ${invoice.invoiceNo}`);
//   doc.text(`Date: ${new Date(invoice.createdAt).toLocaleDateString()}`);
//   doc.moveDown();

//   // Customer Info
//   if (invoice.customer) {
//     doc.text(`Customer Name: ${invoice.customer.name}`);
//     doc.text(`Mobile: ${invoice.customer.mobile}`);
//     doc.text(`Address: ${invoice.customer.address}`);
//     doc.text(`GST No: ${invoice.customer.gst_number}`);
//   }

//   doc.moveDown();
//   doc.text("Products:");
//   doc.moveDown();

//   let grandTotal = 0;

//   // 🔥 FIX HERE — use invoice.products
//   (invoice.products || []).forEach((item, index) => {
//     const base = item.rate * item.quantity;
//     const gst = (base * item.gstSlab) / 100;
//     const total = base + gst;

//     grandTotal += total;

//     doc.text(
//       `${index + 1}. ${item.name} | ₹${item.rate} x ${
//         item.quantity
//       } | GST ${item.gstSlab}% | Total: ₹${total.toFixed(2)}`
//     );
//   });

//   doc.moveDown();
//   doc.fontSize(14).text(`Grand Total: ₹${grandTotal.toFixed(2)}`, {
//     align: "right",
//   });

//   return doc;
// };

// module.exports = { generateInvoicePDF };
