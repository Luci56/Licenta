const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes"); // Importă rutele utilizatorilor
const cors = require("cors");

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// Înregistrează rutele utilizatorilor
app.use("/api/users", userRoutes);

app.get("/", (req, res) => {
  res.send("Serverul rulează...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Serverul rulează pe portul ${PORT}`);
});

app.use("/api/users", (req, res, next) => {
    console.log("Ruta apelată:", req.url);
    next();
  });
  
