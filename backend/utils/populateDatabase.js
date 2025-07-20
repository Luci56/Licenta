const mongoose = require('mongoose');
const User = require('../models/User');


const medicationDosages = {
  metformin: { low: 1000, medium: 2000, high: 3000 },
  gliclazide: { low: 80, medium: 160, high: 320 },
  glipizide: { low: 10, medium: 20, high: 30 },
  sitagliptin: { low: 25, medium: 50, high: 100 },
  vildagliptin: { low: 25, medium: 75, high: 100 },
  linagliptin: { medium: 5 },
  empagliflozin: { low: 10, medium: 12.5, high: 25 },
  dapagliflozin: { low: 5, medium: 10, high: 25 },
  acarbose: { low: 100, medium: 200, high: 300 }
};


const randomBetween = (min, max) => Math.random() * (max - min) + min;
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomChoice = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomBool = (probability = 0.5) => Math.random() < probability;


const generateCorrelatedData = (hba1c, age, diseaseDuration) => {
  
  const riskFactor = (hba1c - 5.5) * 0.3 + diseaseDuration * 0.1;
  
  return {
    hasHypertension: randomBool(Math.min(0.8, 0.2 + riskFactor * 0.15)),
    hasHyperlipidemia: randomBool(Math.min(0.7, 0.15 + riskFactor * 0.12)),
    hasNephropathy: randomBool(Math.min(0.4, riskFactor * 0.08)),
    hasRetinopathy: randomBool(Math.min(0.3, riskFactor * 0.06)),
    hasNeuropathy: randomBool(Math.min(0.5, riskFactor * 0.1)),
    systolicPressure: Math.round(randomBetween(110, 180) + riskFactor * 5),
    diastolicPressure: Math.round(randomBetween(70, 110) + riskFactor * 3),
    cholesterolLDL: Math.round(randomBetween(80, 160) + riskFactor * 8),
    cholesterolHDL: Math.round(randomBetween(35, 65) - riskFactor * 2),
    triglycerides: Math.round(randomBetween(80, 250) + riskFactor * 15)
  };
};

/**
 * Genereaza schema de medicatie bazata pe profilul clinic al pacientului.
 * Implementeaza ghidurile clinice pentru tratamentul diabetului tip 2
 * cu escaladarea terapeutica conform severității.
 * 
 * @param {number} hba1c - Hemoglobina glicata pentru determinarea intensității
 * @param {boolean} hasHypertension - Prezenta hipertensiunii
 * @param {boolean} hasHyperlipidemia - Prezenta hiperlipidemiei  
 * @param {number} diseaseDuration - Durata bolii pentru alegerea medicamentelor
 * @param {number} age - Varsta pentru personalizarea obiectivelor
 * @returns {Object} Schema completa de medicatie cu dozele si intensitatea
 */
const generateMedication = (hba1c, hasHypertension, hasHyperlipidemia, diseaseDuration, age) => {
  const medication = {};
  
  
  if (randomBool(0.85)) {
    const intensity = hba1c > 8.5 ? 'high' : hba1c > 7.5 ? 'medium' : 'low';
    medication.metformin = {
      prescribed: true,
      dosage: medicationDosages.metformin[intensity],
      intensity
    };
  }

 
  if (hba1c > 7.0) {
    
    if (randomBool(0.4)) {
      const drug = randomChoice(['sitagliptin', 'vildagliptin', 'linagliptin']);
      const intensity = drug === 'linagliptin' ? 'medium' : randomChoice(['low', 'medium', 'high']);
      medication[drug] = {
        prescribed: true,
        dosage: medicationDosages[drug][intensity],
        intensity
      };
    }
    
    else if (randomBool(0.3) && (hasHypertension || age > 60)) {
      const drug = randomChoice(['empagliflozin', 'dapagliflozin']);
      const intensity = randomChoice(['low', 'medium', 'high']);
      medication[drug] = {
        prescribed: true,
        dosage: medicationDosages[drug][intensity],
        intensity
      };
    }
    
    else if (randomBool(0.25)) {
      const drug = randomChoice(['gliclazide', 'glipizide']);
      const intensity = randomChoice(['low', 'medium', 'high']);
      medication[drug] = {
        prescribed: true,
        dosage: medicationDosages[drug][intensity],
        intensity
      };
    }
  }

  
  if (hba1c > 9.0 && randomBool(0.6)) {
    
    if (randomBool(0.4)) {
      medication.insulin = {
        prescribed: true,
        type: randomChoice(['lantus', 'levemir', 'novomix', 'mixtard']),
        units_per_day: randomInt(20, 60)
      };
    } else {
      
      if (randomBool(0.2)) {
        const intensity = randomChoice(['low', 'medium', 'high']);
        medication.acarbose = {
          prescribed: true,
          dosage: medicationDosages.acarbose[intensity],
          intensity
        };
      }
    }
  }

  
  const targetHbA1c = age > 70 ? 8.0 : hasHypertension ? 7.5 : 7.0;
  
  medication.treatmentGoals = {
    targetHbA1c,
    targetFastingGlucose: randomBetween(90, 120),
    achieved: hba1c <= targetHbA1c + 0.5
  };

  medication.adherenceScore = randomInt(70, 95);
  medication.treatmentStartDate = new Date(Date.now() - randomInt(30, 1000) * 24 * 60 * 60 * 1000);
  medication.lastMedicationReview = new Date(Date.now() - randomInt(1, 90) * 24 * 60 * 60 * 1000);

  return medication;
};

/**
 * Genereaza un pacient sintetic complet cu toate datele medicale.
 * Creeaza un profil realistic cu corelatii intre varsta, durata bolii,
 * controlul glicemic, comorbiditati si schema de medicatie.
 * 
 * @param {number} index - Indexul pacientului pentru email unic
 * @returns {Object} Obiect pacient complet conform schemei User
 */
const generatePatient = (index) => {
  const currentYear = new Date().getFullYear();
  const birthYear = randomInt(1945, 1985); //  40-80
  const age = currentYear - birthYear;
  const diagnosisYear = randomInt(Math.max(2000, birthYear + 25), currentYear - 1);
  const diseaseDuration = currentYear - diagnosisYear;
  
  
  const hba1c = randomBetween(5.8, 11.5);
  
  
  const clinicalData = generateCorrelatedData(hba1c, age, diseaseDuration);
  
 
  const height = randomInt(150, 190);
  const idealWeight = (height - 100) * 0.9;
  const weight = Math.round(idealWeight + randomBetween(-10, 30)); 
  
  const patient = {
    email: `patient${index}@diabetes-study.com`,
    password: `password${index}`,
    birthYear,
    gender: randomChoice(['Masculin', 'Feminin']),
    height,
    weight,
    diagnosisYear,
    
    
    dailyData: [],
    
    
    analysisData: [{
      date: new Date(Date.now() - randomInt(1, 30) * 24 * 60 * 60 * 1000),
      systolicPressure: clinicalData.systolicPressure,
      diastolicPressure: clinicalData.diastolicPressure,
      cholesterolHDL: clinicalData.cholesterolHDL,
      cholesterolLDL: clinicalData.cholesterolLDL,
      totalCholesterol: clinicalData.cholesterolLDL + clinicalData.cholesterolHDL + 30,
      triglycerides: clinicalData.triglycerides,
      hemoglobinA1c: Math.round(hba1c * 10) / 10,
      fastingGlucose: Math.round(randomBetween(90, 180)),
      creatinine: randomBetween(0.8, 2.5),
      eGFR: randomInt(30, 120),
      microalbumin: randomBetween(0, 200),
      hasHyperlipidemia: clinicalData.hasHyperlipidemia,
      hasHypertension: clinicalData.hasHypertension,
      hasNephropathy: clinicalData.hasNephropathy,
      hasRetinopathy: clinicalData.hasRetinopathy,
      hasNeuropathy: clinicalData.hasNeuropathy,
      diseaseDuration
    }],
    
    clinicalInfo: {
      diabetesType: 'type2',
      smokingStatus: randomChoice(['never', 'former', 'current']),
      alcoholConsumption: randomChoice(['none', 'occasional', 'moderate']),
      physicalActivity: randomChoice(['sedentary', 'light', 'moderate']),
      familyHistoryDiabetes: randomBool(0.6),
      comorbidities: [],
      allergies: randomBool(0.2) ? [randomChoice(['penicillin', 'sulfa', 'iodine'])] : []
    },

    cardiovascularRisk: {
      score: Math.round(randomBetween(10, 70)),
      category: randomChoice(['low', 'moderate', 'high']),
      lastCalculated: new Date()
    }
  };

  
  for (let i = 0; i < 30; i++) {
    const baseGlucose = hba1c * 28.7 - 46.7; 
    const dailyVariation = randomBetween(-30, 50);
    patient.dailyData.push({
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
      bloodGlucose: Math.max(80, Math.round(baseGlucose + dailyVariation)),
      timeOfDay: randomChoice(['fasting', 'postbreakfast', 'prelunch', 'postlunch'])
    });
  }

  
  patient.currentMedication = generateMedication(
    hba1c, 
    clinicalData.hasHypertension, 
    clinicalData.hasHyperlipidemia, 
    diseaseDuration, 
    age
  );

  
  if (clinicalData.hasHypertension) {
    patient.clinicalInfo.comorbidities.push({
      condition: 'Hypertension',
      diagnosisDate: new Date(diagnosisYear + randomInt(0, 3), randomInt(1, 12), randomInt(1, 28)),
      severity: randomChoice(['mild', 'moderate', 'severe'])
    });
  }

  if (clinicalData.hasHyperlipidemia) {
    patient.clinicalInfo.comorbidities.push({
      condition: 'Hyperlipidemia',
      diagnosisDate: new Date(diagnosisYear + randomInt(0, 4), randomInt(1, 12), randomInt(1, 28)),
      severity: randomChoice(['mild', 'moderate'])
    });
  }

  return patient;
};

/**
 * Functia principala pentru popularea bazei de date cu pacienti sintetici.
 * Genereaza numarul specificat de pacienti si ii insereaza in baza de date
 * folosind inserare in loturi pentru performanta optimizata.
 * 
 * @param {number} numberOfPatients - Numarul de pacienti de generat (default: 100)
 * @returns {Promise<void>} Promise care se rezolva la finalizarea popularii
 * @throws {Error} Aruncă eroare daca popularea esueaza
 */
const populateDatabase = async (numberOfPatients = 100) => {
  try {
    console.log(`🔄 Generating ${numberOfPatients} synthetic patients...`);
    
    
    
    const patients = [];
    
    for (let i = 1; i <= numberOfPatients; i++) {
      const patient = generatePatient(i);
      patients.push(patient);
      
      if (i % 10 === 0) {
        console.log(`📊 Generated ${i}/${numberOfPatients} patients...`);
      }
    }
    
    
    console.log('💾 Inserting patients into database...');
    await User.insertMany(patients);
    
    console.log(`✅ Successfully populated database with ${numberOfPatients} patients!`);
    
    
    const stats = await generateStats();
    console.log('\n📈 Database Statistics:');
    console.log(stats);
    
  } catch (error) {
    console.error('❌ Error populating database:', error);
    throw error;
  }
};


const generateStats = async () => {
  const total = await User.countDocuments();
  const withMetformin = await User.countDocuments({ 'currentMedication.metformin.prescribed': true });
  const withInsulin = await User.countDocuments({ 'currentMedication.insulin.prescribed': true });
  const withSGLT2 = await User.countDocuments({ 
    $or: [
      { 'currentMedication.empagliflozin.prescribed': true },
      { 'currentMedication.dapagliflozin.prescribed': true }
    ]
  });
  const withDPP4 = await User.countDocuments({ 
    $or: [
      { 'currentMedication.sitagliptin.prescribed': true },
      { 'currentMedication.vildagliptin.prescribed': true },
      { 'currentMedication.linagliptin.prescribed': true }
    ]
  });

  return {
    totalPatients: total,
    medicationStats: {
      metformin: `${withMetformin} (${Math.round(withMetformin/total*100)}%)`,
      insulin: `${withInsulin} (${Math.round(withInsulin/total*100)}%)`,
      sglt2Inhibitors: `${withSGLT2} (${Math.round(withSGLT2/total*100)}%)`,
      dpp4Inhibitors: `${withDPP4} (${Math.round(withDPP4/total*100)}%)`
    }
  };
};


if (require.main === module) {
  const connectDB = require('./config/db'); 
  
  const main = async () => {
    try {
      await connectDB();
      const numPatients = process.argv[2] ? parseInt(process.argv[2]) : 100;
      await populateDatabase(numPatients);
      process.exit(0);
    } catch (error) {
      console.error('Failed to populate database:', error);
      process.exit(1);
    }
  };
  
  main();
}

module.exports = { populateDatabase, generateStats };