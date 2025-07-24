//////////////////////
// FIX server.js for Vercel: Removed app.listen and added export for serverless function
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
const express = require("express");
const app = express();
const path = require("path");
require("dotenv").config();
const { Sequelize } = require("sequelize");

const HTTP_PORT = process.env.PORT || 8080;

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");

// ✅ Export the app immediately for Vercel
module.exports = app;

// ✅ Setup database
const sequelize = new Sequelize(process.env.PGDATABASE, process.env.PGUSER, process.env.PGPASSWORD, {
  host: process.env.PGHOST,
  dialect: "postgres",
  port: 5432,
  dialectOptions: {
    ssl: { rejectUnauthorized: false },
  },
});

// ✅ Define model
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

// ✅ Routes
app.get("/", async (req, res) => {
  try {
    const locations = await Location.findAll();
    res.render("home.ejs", { locations, destination: "St. John's, Newfoundland" });
  } catch (err) {
    console.error(err);
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
    console.error(err);
    res.status(500).send("Error adding location");
  }
});

app.get("/memories/delete/:id", async (req, res) => {
  try {
    await Location.destroy({ where: { id: req.params.id } });
    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting location");
  }
});

// ✅ Start DB connection only for dev (local) use
if (process.env.VERCEL !== "1" && process.env.NODE_ENV !== "production") {
  sequelize.authenticate()
    .then(() => sequelize.sync())
    .then(() => {
      app.listen(HTTP_PORT, () => {
        console.log("App listening on port " + HTTP_PORT);
      });
    })
    .catch((err) => {
      console.error("Failed to connect to DB:", err);
    });
}
