const express = require("express");
const User = require("../models/User");

const router = express.Router();

// Înregistrare utilizator
router.post("/register", async (req, res) => {
  const { email, password, birthYear, gender, height, diagnosisYear } = req.body;

  try {
    // Creăm un nou utilizator
    const user = new User({
      email,
      password,
      birthYear,
      gender,
      height,
      diagnosisYear,
    });

    // Salvăm utilizatorul în baza de date
    await user.save();
    res.status(201).json({ message: "Utilizator înregistrat cu succes!" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Adaugă date zilnice pentru un utilizator
router.post("/add-daily-data/:id", async (req, res) => {
  const { id } = req.params;
  const {
    systolicPressure,
    diastolicPressure,
    cholesterolHDL,
    cholesterolLDL,
    hemoglobinA1c,
  } = req.body;

  try {
    // Găsim utilizatorul după ID
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "Utilizatorul nu a fost găsit!" });
    }

    // Adăugăm datele zilnice
    user.dailyData.push({
      systolicPressure,
      diastolicPressure,
      cholesterolHDL,
      cholesterolLDL,
      hemoglobinA1c,
    });

    // Salvăm modificările în baza de date
    await user.save();
    res.status(200).json({ message: "Datele zilnice au fost salvate cu succes!" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


// Ruta pentru login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Utilizatorul nu există!" });
    }

    if (user.password !== password) {
      return res.status(401).json({ message: "Parolă incorectă!" });
    }

    res.status(200).json({ message: "Conectare reușită!", user });
  } catch (err) {
    res.status(500).json({ message: "Eroare de server!" });
  }
});

module.exports = router;


module.exports = router;
