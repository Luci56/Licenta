const express = require("express");
const User = require("../models/User");

const router = express.Router();

/**
 * Endpoint pentru inregistrarea unui nou pacient in sistem.
 * Creeaza un cont nou cu informatiile personale si medicale de baza.
 * 
 * @route POST /api/users/register
 * @param {Object} req.body - Datele necesare pentru inregistrare
 * @param {string} req.body.email - Adresa de email unica a pacientului
 * @param {string} req.body.password - Parola pentru securizarea contului
 * @param {number} req.body.birthYear - Anul nasterii pacientului
 * @param {string} req.body.gender - Genul pacientului (Masculin/Feminin)
 * @param {number} req.body.height - Inaltimea in centimetri
 * @param {number} req.body.weight - Greutatea in kilograme
 * @param {number} req.body.diagnosisYear - Anul diagnosticarii diabetului
 * @returns {Object} Mesaj de confirmare sau eroare
 * @throws {Error} 400 - Eroare de validare sau email existent
 */
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

// Salvare glicemie zilnică 
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

    user.markModified("dailyData");

    // Salvăm utilizatorul actualizat
    await user.save();
    
    res.status(200).json({ message: "Glicemia a fost salvată cu succes!" });
  } catch (err) {
    console.error("Eroare la salvarea glicemiei:", err);
    res.status(400).json({ message: "Eroare la salvarea glicemiei: " + err.message });
  }
});

/**
 * Endpoint pentru adaugarea rezultatelor analizelor medicale periodice.
 * Salveaza rezultatele analizelor de laborator pentru monitorizarea progresiei diabetului.
 * 
 * @route POST /api/users/add-analysis-data/:id
 * @param {string} req.params.id - ID-ul utilizatorului
 * @param {Object} req.body - Rezultatele analizelor
 * @param {number} req.body.systolicPressure - Tensiunea arteriala sistolica
 * @param {number} req.body.diastolicPressure - Tensiunea arteriala diastolica
 * @param {number} req.body.cholesterolHDL - Colesterolul HDL (mg/dL)
 * @param {number} req.body.cholesterolLDL - Colesterolul LDL (mg/dL)
 * @param {number} req.body.hemoglobinA1c - Hemoglobina glicata (%)
 * @param {boolean} req.body.hasHyperlipidemia - Prezenta hiperlipidemiei
 * @param {boolean} req.body.hasHypertension - Prezenta hipertensiunii
 * @param {number} req.body.diseaseDuration - Durata bolii in ani
 * @returns {Object} Mesaj de confirmare sau eroare
 * @throws {Error} 404 - Utilizatorul nu a fost gasit
 * @throws {Error} 400 - Eroare de validare a datelor
 */
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

/**
 * Endpoint pentru autentificarea pacientilor in sistem.
 * Verifica credentialele si returneaza datele utilizatorului pentru sesiune.
 * 
 * @route POST /api/users/login
 * @param {Object} req.body - Credentialele de autentificare
 * @param {string} req.body.email - Adresa de email a pacientului
 * @param {string} req.body.password - Parola contului
 * @returns {Object} Mesaj de succes si datele utilizatorului
 * @throws {Error} 404 - Utilizatorul nu exista
 * @throws {Error} 401 - Parola incorecta
 * @throws {Error} 500 - Eroare de server
 */
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

/**
 * Endpoint pentru obtinerea datelor complete ale unui pacient.
 * Returneaza profilul complet cu toate informatiile medicale si istoricul.
 * 
 * @route GET /api/users/:id
 * @param {string} req.params.id - ID-ul utilizatorului
 * @returns {Object} Datele complete ale utilizatorului
 * @throws {Error} 404 - Utilizatorul nu a fost gasit
 * @throws {Error} 400 - Eroare la obtinerea datelor
 */
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

/**
 * Endpoint pentru actualizarea profilului personal al pacientului.
 * Permite modificarea informatiilor antropometrice (greutate, inaltime).
 * 
 * @route PUT /api/users/update-profile/:id
 * @param {string} req.params.id - ID-ul utilizatorului
 * @param {Object} req.body - Datele pentru actualizare
 * @param {number} req.body.weight - Greutatea noua in kilograme (30-200 kg)
 * @param {number} req.body.height - Inaltimea noua in centimetri (100-250 cm)
 * @returns {Object} Mesaj de confirmare si datele actualizate
 */
router.put("/update-profile/:id", async (req, res) => {
  const { id } = req.params;
  const { weight, height } = req.body;

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "Utilizatorul nu a fost găsit!" });
    }

    // Validează datele
    if (weight && (weight < 30 || weight > 200)) {
      return res.status(400).json({ message: "Greutatea trebuie să fie între 30 și 200 kg!" });
    }

    if (height && (height < 100 || height > 250)) {
      return res.status(400).json({ message: "Înălțimea trebuie să fie între 100 și 250 cm!" });
    }

    // Actualizează doar câmpurile furnizate
    const updateData = {};
    if (weight !== undefined) updateData.weight = weight;
    if (height !== undefined) updateData.height = height;

    const updatedUser = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({ 
      message: "Profilul a fost actualizat cu succes!",
      user: updatedUser
    });
  } catch (err) {
    console.error("Eroare la actualizarea profilului:", err);
    res.status(400).json({ message: "Eroare la actualizarea profilului: " + err.message });
  }
});

module.exports = router;