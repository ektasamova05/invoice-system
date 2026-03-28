const express = require("express");
const router = express.Router();

const invoiceController = require("../controllers/invoice_controller");

// CREATE invoice
router.post("/", invoiceController.createInvoice);

// GET All invoice by customer
router.get("/customer/:customerId", invoiceController.getInvoiceByCustomer);

//GET all invoices with pagination
router.get("/", invoiceController.getAllInvoices);

// FIND BY MOBILE NUMBER
router.get("/mobile/:mobile",invoiceController.getCustomerByMobile);


// soft delete
router.delete("/soft-delete/:id", invoiceController.softDeleteInvoice);

// hard delete
router.delete("/hard-delete/:id", invoiceController.hardDeleteInvoice);

// restore
router.post("/restore/:id", invoiceController.softDeleteRestoreInvoice);

// GET invoice by id (keep dynamic route LAST)
router.get("/:id", invoiceController.getInvoice);

// update invoice
router.put("/:id", invoiceController.updateInvoice);

//PDF
router.get("/pdf/:id", invoiceController.generateInvoicePDF);




module.exports = router;
