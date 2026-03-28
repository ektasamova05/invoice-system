const express = require("express");
const router = express.Router();

const customerController = require("../controllers/customer_controller");


router.get("/", customerController.getAllCustomers);
router.post("/", customerController.createCustomer);
router.get("/mobile/:mobile", customerController.getCustomerByMobile);

module.exports = router;
