const app = require('./app');
const sequelize = require("./config/db"); 
const db = require("./models");
const cors = require("cors");
require('dotenv').config();

app.use(cors());


app.use("/api/customer", require("./Routes/customer_route"));
app.use("/api/invoice", require("./Routes/invoice_route"));

sequelize.sync({ alter: false })
 .then(() =>{
    console.log("Database synced successfully!");
    app.listen(5000, () => console.log("Server running on http://localhost:5000"))
 })
 .catch((err) => console.log("Database sync error:", err));
