/********************************************************************************
* WEB322 – Assignment 05
*
* I declare that this assignment is my own work and completed based on my
* current understanding of the course concepts.
*
* The assignment was completed in accordance with:
* a. The Seneca's Academic Integrity Policy
* https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
*
* b. The academic integrity policies noted in the assessment description
*
* I did NOT use generative AI tools (ChatGPT, Copilot, etc) to produce the code
* for this assessment.
*
* Name: _______kamdin kianpour___________ Student ID: _____134281229_____
*
********************************************************************************/
const HTTP_PORT = process.env.PORT || 8080;

const express = require("express");
const app = express();
app.use(express.static("public"));  
app.set("view engine", "ejs");      //ejs
app.use(express.urlencoded({ extended: true })); //forms
require("dotenv").config();   

// +++ Database connection code
// +++ TODO: Remember to add your Neon.tech connection variables to the .env file!!
const { Sequelize } = require("sequelize");
const sequelize = new Sequelize(process.env.PGDATABASE, process.env.PGUSER, process.env.PGPASSWORD, {
  host: process.env.PGHOST,
  dialect: "postgres",
  port: 5432,
  dialectOptions: {
    ssl: { rejectUnauthorized: false },
  },
});

// +++ 4. TODO: Define your database table
const Location = sequelize.define("Location", {
  name: Sequelize.TEXT,
  category: Sequelize.STRING,
  address: Sequelize.TEXT,
  comments: Sequelize.TEXT,
  image: Sequelize.TEXT
}, {
  createdAt: false,
  updatedAt: false
});

// +++ 5. TODO: Define your server routes
app.get("/", async (req, res) => {    
  try {
    const locations = await Location.findAll();
    return res.render("home.ejs", { locations, destination: "St. John's, Newfoundland" });
  } catch (err) {
    console.log(err);
    return res.status(500).send("Error retrieving locations");
  }
});

app.get("/memories/add", (req, res) => {    
  return res.render("add.ejs");
});

app.post("/memories/add", async (req, res) => {
  try {
    const { name, category, address, comments, image } = req.body;
    await Location.create({ name, category, address, comments, image });
    return res.redirect("/");
  } catch (err) {
    console.log(err);
    return res.status(500).send("Error adding location");
  }
});

app.get("/memories/delete/:id", async (req, res) => {
  try {
    await Location.destroy({ where: { id: req.params.id } });
    return res.redirect("/");
  } catch (err) {
    console.log(err);
    return res.status(500).send("Error deleting location");
  }
});

// +++ Function to start serer
async function startServer() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    console.log("SUCCESS connecting to database");
  } catch (err) {
    console.log("ERROR: connecting to database");
    console.log(err);
    console.log("Please resolve these errors and try again.");
  }
}
if (process.env.VERCEL !== "1" && process.env.NODE_ENV !== "production") {
  startServer().then(() => {
    app.listen(HTTP_PORT, () => {
      console.log(`server listening on: http://localhost:${HTTP_PORT}`);
    });
  });
} else {
  startServer().then(() => {
    module.exports = app;
  }).catch(err => {
    console.error("Vercel initialization failed:", err);
    process.exit(1);
  });
}