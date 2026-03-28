const { DataTypes, Model } = require("sequelize");

module.exports = (sequelize) => {
class product extends Model {

// total

  calculateTotal() {
  const rate = Number(this.rate);
  const quantity = Number(this.quantity);
  return rate * quantity;   // return NUMBER only
}

  //GST amount

  calculateGSTAmount() {
    const total = this.calculateTotal();
    return ((total * Number(this.gstSlab / 100)).toFixed(2));
  }

  //total with gst

  calculateTotalWithGST() {
    const total = this.calculateTotal();
    const gstAmount = this.calculateGSTAmount();
    return total + gstAmount;
  }

  updateCalculations() {
  const total = this.calculateTotal();
  const gstAmount = (total * Number(this.gstSlab)) / 100;

  this.total = Number(total.toFixed(2));
  this.totalWithGst = Number((total + gstAmount).toFixed(2));
}

}


product.init(  {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
    invoiceId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },

      product: {
        type: DataTypes.STRING,
        allowNull: false
      },

      rate: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          isDecimal: true
        }
      },

      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          isInt: true
        }
      },

      total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },

      gstSlab: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          isIn: [[5, 12, 18, 28]]
        }
      },

      totalWithGst: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },

      
    },
    {
      sequelize,
      modelName: "product",
      tableName: "product",
      paranoid: false,
      timestamps: true,
    
    

    hooks: {
      beforeValidate: (item) => {
        item.updateCalculations();
      },
      beforeCreate: (item) => {
        item.updateCalculations();
      },
      beforeUpdate: (item) => {
        if (item.changed('rate') || item.changed('quantity') || item.changed('gstSlab')) {
          item.updateCalculations();
        }
      },
    },
  }
  );

  return product;
}
  



