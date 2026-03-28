const db = require("../models");
const {  Customer } = db;


//GET by mobile
const getCustomerByMobile = async (req, res) => {
  try { 


    const { mobile } = req.params;

    const customer = await Customer.findOne({
      where: { mobile: mobile.trim() }
    });
   

    if (!customer) {
      return res.status(400).json({
        message: "customer not found",
        exists: false,
      });
    }

    res.json({
      success: true,
      message: 'Customer found',
      data: customer,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });

  }
};



//POST create new customer with checking existing mobile number

const createCustomer = async (req, res) => {
  try{ 
    const { mobile, name, address, gst_number } = req.body;

    // check if customer already exists
    const existingCustomer = await Customer.findByOne(mobile);
    if (existingCustomer) {
      return res.status(400).json({ message: "Customer already exists" });
    }

    const customer = await Customer.create({
      name,
      mobile,
      address,
      gst_number
    });

    res.status(201).json({
      success: true,
      data: customer
    });
  } catch (err) {
    res.status(500). json({ message: err.message });
  }
 };


  //GET all customer


const getAllCustomers = async(req, res) => {
  try{ 
  const customers = await Customer.findAll({
    order: [['createAt', 'DESC']],
  });

  res.json({
    message:'Customer retrived successfully',
    data: customers,
  });

} catch (err) {
  res.status(500).json({ message: err.message });
}
};

  module.exports = {
    createCustomer,
    getAllCustomers,
    getCustomerByMobile,
  }

