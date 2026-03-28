
const Sequelize = require("sequelize");
const sequelize = require('../config/db');


const Customer = require("./customer")(sequelize);
const Invoice = require("./invoice")(sequelize);
const Product = require("./product")(sequelize);

/**
* RELATIONSHIP
* One Customer → Many Invoice
*/
Customer.hasMany(Invoice, {
foreignKey: 'customerId',
as: 'invoices',
onDelete: 'CASCADE'
});

Invoice.belongsTo(Customer, {
foreignKey: 'customerId',
as: 'customer'
});


Invoice.hasMany(Product,{
foreignKey: 'invoiceId',
as: 'products',
onDelete: 'CASCADE'
});

Product.belongsTo(Invoice,{
foreignKey: 'invoiceId',
as: 'invoice'
})


module.exports = {
sequelize,
Customer,
Invoice,
Product,
};

