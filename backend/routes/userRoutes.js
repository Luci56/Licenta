const express = require("express");
const User = require("../models/User");

const router = express.Router();

// Înregistrare utilizator
router.post("/register", async (req, res) => {
  const { email, password, birthYear, gender, height, weight, diagnosisYear } = req.body;

  try {
    // Creăm un nou utilizator
    const user = new User({
      email,
      password,
      birthYear,
      gender,
      height,
      weight,
      diagnosisYear,
      dailyData: [],
      analysisData: [],
    });

        console.log("User înainte de salvare:", user); 
    await user.save();
    console.log("User salvat cu succes!");
    res.status(201).json({ message: "Utilizator înregistrat cu succes!" });
  } catch (err) {
    console.error("Eroare la înregistrare:", err);
    res.status(400).json({ message: "Eroare la înregistrare: " + err.message });
  }
});

// Salvare glicemie zilnică - CORECTATĂ
router.post("/add-daily-data/:id", async (req, res) => {
  const { id } = req.params;
  // Acceptăm atât bloodGlucose cât și bloodSugar pentru compatibilitate
  const bloodGlucose = req.body.bloodGlucose || req.body.bloodSugar;

  console.log("Date primite pentru glicemie:", req.body);

  try {
    // Validăm datele primite
    if (!bloodGlucose || isNaN(bloodGlucose) || bloodGlucose <= 0) {
      return res.status(400).json({ message: "Glicemia trebuie să fie un număr pozitiv!" });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "Utilizatorul nu a fost găsit!" });
    }

    // Adăugăm noua valoare în array-ul dailyData
    user.dailyData.push({
      date: new Date(),
      bloodGlucose: Number(bloodGlucose)
    });

    // Marcare explicită a modificării
    user.markModified("dailyData");

    // Salvăm utilizatorul actualizat
    await user.save();
    
    res.status(200).json({ message: "Glicemia a fost salvată cu succes!" });
  } catch (err) {
    console.error("Eroare la salvarea glicemiei:", err);
    res.status(400).json({ message: "Eroare la salvarea glicemiei: " + err.message });
  }
});

// Salvare date analiză - CORECTATĂ
router.post("/add-analysis-data/:id", async (req, res) => {
  const { id } = req.params;
  const { 
    systolicPressure, 
    diastolicPressure, 
    cholesterolHDL, 
    cholesterolLDL, 
    hemoglobinA1c,
    hasHyperlipidemia,
    hasHypertension,
    diseaseDuration
  } = req.body;

  console.log("Date primite pentru analiză:", req.body);

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "Utilizatorul nu a fost găsit!" });
    }

    // Formatăm hemoglobinA1c pentru a avea o singură zecimală
    const formattedHbA1c = parseFloat(hemoglobinA1c).toFixed(1);

    // Verificăm și creăm array-ul analysisData dacă nu există
    if (!user.analysisData || !Array.isArray(user.analysisData)) {
      user.analysisData = [];
    }

    // Adăugăm noile date în array-ul analysisData
    user.analysisData.push({
      date: new Date(),
      systolicPressure: Number(systolicPressure),
      diastolicPressure: Number(diastolicPressure),
      cholesterolHDL: Number(cholesterolHDL),
      cholesterolLDL: Number(cholesterolLDL),
      hemoglobinA1c: Number(formattedHbA1c),
      hasHyperlipidemia: hasHyperlipidemia === true || hasHyperlipidemia === "true" || hasHyperlipidemia === "Da",
      hasHypertension: hasHypertension === true || hasHypertension === "true" || hasHypertension === "Da",
      diseaseDuration: Number(diseaseDuration)
    });

    // Marcare explicită a modificării
    user.markModified("analysisData");
    
    // Salvăm utilizatorul actualizat
    await user.save();
    
    res.status(200).json({ message: "Datele analizelor au fost salvate cu succes!" });
  } catch (err) {
    console.error("Eroare la salvarea datelor de analiză:", err);
    res.status(400).json({ message: "Eroare la salvarea datelor de analiză: " + err.message });
  }
});

// Login utilizator
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
    console.error("Eroare la autentificare:", err);
    res.status(500).json({ message: "Eroare de server la autentificare!" });
  }
});

// Obținere date utilizator
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "Utilizatorul nu a fost găsit!" });
    }
    
    console.log("Date utilizator trimise:", {
      id: user._id,
      email: user.email,
      dailyData: user.dailyData ? user.dailyData.length : 0,
      analysisData: user.analysisData ? (Array.isArray(user.analysisData) ? user.analysisData.length : "obiect") : "null"
    });
    
    res.status(200).json(user);
  } catch (err) {
    console.error("Eroare la obținerea datelor utilizatorului:", err);
    res.status(400).json({ message: "Eroare la obținerea datelor: " + err.message });
  }
});

module.exports = router;