const { sequelize } = require("../config/connection");
const { User, Product, /* other models */ } = require("../models/index.model");
const fs = require("fs").promises;
const path = require("path");

async function resetDatabase() {
  try {
    // Drop all tables (force: true)
    await sequelize.sync({ force: true });
    console.log("Database dropped and recreated.");

    // Load seed data JSON files
    const usersData = JSON.parse(await fs.readFile(path.join(__dirname, "../../mocking/users.json"), "utf-8"));
    const productsData = JSON.parse(await fs.readFile(path.join(__dirname, "../../mocking/products.json"), "utf-8"));
    // ... load other JSON data similarly

    // Bulk create records
    await User.bulkCreate(usersData);
    await Product.bulkCreate(productsData);
    // ... other bulk creates

    console.log("Database seeded with initial data.");
    process.exit(0);
  } catch (error) {
    console.error("Error resetting database:", error);
    process.exit(1);
  }
}

resetDatabase();