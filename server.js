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

require("dotenv").config(); // Load .env

// Set up Express
app.use(express.static("public"));
app.set("view engine", "ejs");
app.set("views", __dirname + "/views"); // ✅ This line tells Express where your .ejs files are
app.use(express.urlencoded({ extended: true }));

require("pg"); // Fix for Vercel pg issues

// Sequelize setup
const { Sequelize } = require("sequelize");
const sequelize = new Sequelize(
  process.env.PGDATABASE,
  process.env.PGUSER,
  process.env.PGPASSWORD,
  {
    host: process.env.PGHOST,
    dialect: "postgres",
    port: 5432,
    dialectOptions: {
      ssl: { rejectUnauthorized: false },
    },
  }
);

// Define the Location model
const Location = sequelize.define("Location", {
  name: Sequelize.TEXT,
  category: Sequelize.STRING,
  address: Sequelize.TEXT,
  comments: Sequelize.TEXT,
  image: Sequelize.TEXT,
}, {
  createdAt: false,
  updatedAt: false,
});

// Routes
app.get("/", async (req, res) => {
  try {
    const locations = await Location.findAll();
    res.render("home.ejs", { locations, destination: "St. John's, Newfoundland" });
  } catch (err) {
    console.error("Error loading home route:", err);
    res.status(500).send("Error retrieving locations");
  }
});

app.get("/memories/add", (req, res) => {
  res.render("add.ejs");
});

app.post("/memories/add", async (req, res) => {
  try {
    const { name, category, address, comments, image } = req.body;
    await Location.create({ name, category, address, comments, image });
    res.redirect("/");
  } catch (err) {
    console.error("Error adding location:", err);
    res.status(500).send("Error adding location");
  }
});

app.get("/memories/delete/:id", async (req, res) => {
  try {
    await Location.destroy({ where: { id: req.params.id } });
    res.redirect("/");
  } catch (err) {
    console.error("Error deleting location:", err);
    res.status(500).send("Error deleting location");
  }
});
// Start server
async function startServer() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    console.log("SUCCESS connecting to database");
  } catch (err) {
    console.error("ERROR: connecting to database", err);
    console.log("Please resolve these errors and try again.");
  }
}

startServer();

// Always export app — required for Vercel to recognize serverless function
module.exports = app;
