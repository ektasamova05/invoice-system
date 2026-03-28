const {  DataTypes } = require("sequelize");

module.exports = (sequelize) => {

const Customer = sequelize.define("Customer",{
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
    mobile:{
        type:DataTypes.STRING,
        allowNull:false,
        unique:true
    },
    name:{
        type:DataTypes.STRING,
        allowNull: false,
    },
    address:{
        type:DataTypes.STRING,
        allowNull: false,
    },
    gst_number:{
        type:DataTypes.STRING,
        allowNull: false,
    },
},
{
    tableName: "customer",
    freezeTableName: true,
    timestamps: true
    
});

return Customer;
}


