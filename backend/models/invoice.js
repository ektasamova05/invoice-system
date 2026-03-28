const { DataTypes, Model } = require("sequelize");

module.exports = (sequelize) => {
class invoice extends Model {

    //calculate totalPrice from products

    async calculateTotalPrice() {
        const items = await this.getProducts();
        const total = items.reduce((sum, item) => sum + Number(item.totalWithGst || 0), 0);
        return (total.toFixed(2));
    }

    //update totalPrice based on items

    async updateTotalPrice() {
        const total = await this.calculateTotalPrice();
        await this.update({ totalPrice: Number(total)});
        return total;
    }
}

invoice.init( {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
    customerId:{
        type:DataTypes.INTEGER,
        allowNull:false,
    },
    invoiceNumber:{
        type:DataTypes.INTEGER,
        unique: true,
        allowNull: false,

    },
    totalPrice:{
        type:DataTypes.FLOAT,
        allowNull: false,
    },

},

{
    sequelize,
    modelName: "invoice",
    tableName: "invoice",
    timestamps: true,
    paranoid: true
    
}
);

return invoice;

}