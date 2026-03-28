const { Customer, Invoice, Product, sequelize } = require("../models");

const { generateInvoicePDF: createPDF } = require("../services/pdfservice");



//POST create invoice with products
const createInvoice = async (req, res) => {
    const { customer: customerdata, productdata, invoiceNumber } = req.body;

    //start transaction
    const transaction = await sequelize.transaction();

    //find or create customer

    try {
      let customer = await Customer.findOne({
             where: { mobile: customerdata.mobile }
      });

      if (!customer) {
        customer = await Customer.create({ //create customer
          mobile: customerdata.mobile,
          name: customerdata.name,
          address: customerdata.address,
          gst_number: customerdata.gst_number,

        }, {transaction});
      } 

      if(!customerdata.name) {
        return res.status(404).json({message:"customer name is required"});
      }

      if (!customerdata.mobile) {
        return res.status(400).json({message: "Mobile Number is required"});
      }

        if (!invoiceNumber) {
        return res.status(400).json({ message: "Invoice number is required" });
    }



    const existingInvoice = await Invoice.findOne({
      where: { invoiceNumber }
    });

    if (existingInvoice) {
      return res.status(400).json({
        message: "Invoice number already exists"
      });
    }

      const invoiceNo = invoiceNumber;


      // create invoice table

      const newInvoice = await Invoice.create({
        customerId: customer.id,
        invoiceNumber: invoiceNo,
        totalPrice: 0,
      }, { transaction });


      // create product table


      const createdProducts = [];
      for (const item of productdata) {
        const product = await Product.create({
          invoiceId: newInvoice.id,
          product: item.product,
          rate: (item.rate),
          quantity: (item.quantity),
          // total: (item.total),
          gstSlab: (item.gstSlab),
          // totalWithGst: (item.totalwithgst),
          //total and totalwithgst will auto calculated by hooks
        }, { transaction });

        createdProducts.push(product);
      
      }
      // calculate and update totalPrice
      const totalPrice = createdProducts.reduce(
        (sum, item) => sum + (item.totalWithGst),
        0 
      );

      await newInvoice.update({
        totalPrice: (totalPrice.toFixed(2)),
      }, { transaction });

      await transaction.commit();


      //fetch complete invoice with associations

      const complateInvoice = await Invoice.findByPk(newInvoice.id,{
        include: [
          {
            model: Customer,
            as: 'customer'
          },
          {
            model: Product,
            as: 'products'

          },
        ],
      });

      res.status(201).json({
        message: 'Invoice created successfully',
        data: complateInvoice
      });

    } catch (error) {
      if (!transaction.finished){ 
      await transaction.rollback();
      }
      console.error(" Invoice creation error:", error.message);
     
      return res.status(500).json({
        message: "Invoice creation failed",
        error: error.message
          });
  
  }
  };


  // GET BY MOBILE NUMBER

  const getCustomerByMobile = async (req, res) => {
    try {
      const { mobile } = req.params;

      const customer = await Customer.findOne ({
        where: { mobile: mobile.trim() }
      });
      

      if (!customer) {
        return res.status(404).json({
          message: "customer not found"
        });
      }
      res.json(customer);
    } catch (error) {
      res.status(500). json ({ message: error.message });
    }
  };



  //GET invoice by id

const getInvoice = async (req, res) => {
  const { id } = req.params;

  try {
    const invoiceData = await Invoice.findByPk(id, {
      include: [
        {
          model: Customer,
          as: "customer",
        },
        {
          model: Product,
          as: "products",
        },
      ],
    });

    if (!invoiceData) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    return res.json({
      success: true,
      message: "Invoice retrieved successfully",
      data: invoiceData,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  
  }
};

// GET all invoice by customer

const getInvoiceByCustomer = async (req, res) => {
  const { customerId } = req.params;

  try {
    const invoiceByCustomer = await Invoice.findAll ({
      where: { customerId },
      include: [
        {
          model: Customer,
          as: "customer",
        },
        {
          model: Product,
          as: "products",
        },
      ],
      order: [[ "createdAt", "DESC" ]],
    });

    return res.json({
      success: true,
      message: " Customer invoices retrieved successfully",
      count: invoiceByCustomer.length,
      data: invoiceByCustomer,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }

};

 // Get all invoices with pagination


const getAllInvoices = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows: invoices } = await Invoice.findAndCountAll({
      include: [
        {
          model: Customer,
          as: "customer",
          attributes: ["id", "name", "mobile"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    return res.json({
      success: true,
      message: "Invoices retrieved successfully",
      data: invoices,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};





  // update invoice with product

  const updateInvoice = async (req, res) => {
    const { id } = req.params;
    const { customer: customerdata, productdata } = req.body;

    //start transaction

    const transaction = await sequelize.transaction();

    try {

      //find existing invoice
      const invoiceData = await Invoice.findByPk(id, {
        include: [
          { 
         model: Product,
         as: 'products'
      },
    ],
     transaction,
    });

    if ( !invoiceData ) {
      await transaction.rollback();
      return res.status(404).json({
        sucess:false,
        message: 'Invoice not found',
      });
    }

    // update customer if data changed

    const existingCustomer = await Customer.findByPk(invoiceData.customerId,
      { transaction }
    );

    if( existingCustomer && customerdata ) {
      await existingCustomer.update({
        name: customerdata.name || existingCustomer.name,
        gst_number: customerdata.gst_number || existingCustomer.gst_number,
      }, { transaction });

    }

    //delete old items

    await Product.destroy({
      where: { invoiceId: id },
      force: true, // hard delete old items
      transaction,
    });


    //create new products

     const createdProducts = [];
    for (const item of productdata) {
      const newProduct = await Product.create(
        {
          invoiceId: invoiceData.id,
          product: item.product,
          rate: (item.rate),
          quantity: (item.quantity),
          gstSlab: (item.gstSlab),
        },
        { transaction }
      );

      createdProducts.push(newProduct);
    }

    //calculate  and update totalPrice

    const totalPrice = createdProducts.reduce(
      (sum, item) => sum + Number(item.totalWithGST || 0),
      0
    );

    await invoiceData.update(
      {
        totalPrice: Number(totalPrice.toFixed(2)),
      },
      { transaction }
    );

    //commit transaction

    await transaction.commit();

    //fetch updated invoice

     const updatedInvoice = await Invoice.findByPk(id, {
      include: [
          {
            model: Customer,
            as: 'customer'
          },
          {
            model: Product,
            as: 'products'

          },
        ],
    });

    return res.json({
      success: true,
      message: "Invoice updated successfully",
      data: updatedInvoice,
    });

  } catch (error) {
    await transaction.rollback();
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// soft delete

const softDeleteInvoice = async (req, res) => {
  const { id } = req.params;

  try {
    const deleteInvoice =  await Invoice.findByPk(id);

    if (!deleteInvoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    //soft delete(paranoid must be true in model)

    await deleteInvoice.destroy();

    return res.json({
      success: true,
      message: "Invoice soft deleted successfully",
      data:{
        id: deleteInvoice.id,
        invoiceNumber: deleteInvoice.invoiceNumber,
        deletedAt: deleteInvoice.deletedAt,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


//hard delete (permanently delete data)

const hardDeleteInvoice = async (req, res) => {
  const { id } = req.params;

  try {
    const hardDeleteInvoice = await Invoice.findByPk(id, {
      paranoid: false,
    });

    if (!hardDeleteInvoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    //HARD delete

    await hardDeleteInvoice.destroy({ force: true});

    return res.json({
      success: true,
      message: "Invoice permanently deleted",
      data: {
        id: hardDeleteInvoice.id,
        invoiceNumber: hardDeleteInvoice.invoiceNumber,
      },
    });
  } catch (error) {
    return res.status(500).json ({
      seccess: false,
      message: error.message,
    });
  }
};


// Restore soft-deleted invoice


const softDeleteRestoreInvoice = async (req, res) => {
  const { id } = req.params;

  try {
    const restoreInvoice = await Invoice. findByPk(id, {
    paranoid: false,
  });

  if (!restoreInvoice) {
    return res.status(404).json({
      success:false,
      message: "Invoice not found",
    });
  }

  if (!restoreInvoice.deletedAt) {
    return res.status(400).json({
      success: false,
      message: "Invioce is not deleted",
    });
  }

  //restore invoice

  await restoreInvoice.restore();

  return res.json({
    success: true,
    message: "Invoice restored successfully",
    data: restoreInvoice,
  });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//PDF 


const generateInvoicePDF = async (req, res) => {

  try {
    const { id } = req.params;
   // console.log(req.params);

    const pdfInvoice = await Invoice.findByPk(id, {
      include: [
        { model: Customer, as: "customer" },
        { model: Product, as: 'products' },
      ],
    });

    if (!pdfInvoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    const doc = createPDF(pdfInvoice);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=invoice-${pdfInvoice.invoiceNo}.pdf`
    );

    doc.pipe(res);
    doc.end();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};







  module.exports = {
    createInvoice,
    getCustomerByMobile,
    getInvoice,
    getInvoiceByCustomer,
    updateInvoice,
    softDeleteInvoice,
    hardDeleteInvoice,
    softDeleteRestoreInvoice,
    getAllInvoices,
    generateInvoicePDF
   

  }
