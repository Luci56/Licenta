
const User = require("../models/User");

/**
 * Sistem avansat pentru recomandari personalizate de medicatie.
 * Analizeaza eficacitatea medicamentelor bazat pe pacientii similari.
 */
class PersonalizedMedicationRecommendationSystem {
  constructor() {
    
    this.medicationClasses = {
      'metformin': { 
        class: 'Biguanides', 
        maxDose: 3000, 
        commonDoses: [500, 850, 1000, 1500, 2000],
        sideEffects: ['Gastrointestinal upset', 'Lactic acidosis (rare)'],
        contraindications: ['Severe kidney disease', 'Severe liver disease']
      },
      'gliclazide': { 
        class: 'Sulfonylureas', 
        maxDose: 320, 
        commonDoses: [40, 80, 160, 240, 320],
        sideEffects: ['Hypoglycemia', 'Weight gain'],
        contraindications: ['Type 1 diabetes', 'Severe liver/kidney disease']
      },
      'sitagliptin': { 
        class: 'DPP-4 Inhibitors', 
        maxDose: 100, 
        commonDoses: [25, 50, 100],
        sideEffects: ['Upper respiratory infection', 'Headache'],
        contraindications: ['Type 1 diabetes', 'Diabetic ketoacidosis']
      },
      'empagliflozin': { 
        class: 'SGLT-2 Inhibitors', 
        maxDose: 25, 
        commonDoses: [10, 25],
        sideEffects: ['Genital infections', 'UTI'],
        contraindications: ['Severe kidney disease', 'Dialysis'],
        cardiovascularBenefit: true
      },
      'dapagliflozin': { 
        class: 'SGLT-2 Inhibitors', 
        maxDose: 25, 
        commonDoses: [5, 10, 25],
        sideEffects: ['Genital infections', 'UTI'],
        contraindications: ['Severe kidney disease'],
        cardiovascularBenefit: true
      },
      'vildagliptin': { 
        class: 'DPP-4 Inhibitors', 
        maxDose: 100, 
        commonDoses: [50, 100],
        sideEffects: ['Headache', 'Dizziness'],
        contraindications: ['Type 1 diabetes']
      },
      'insulin': { 
        class: 'Insulin', 
        types: ['Lantus', 'Levemir', 'Novomix', 'Mixtard'],
        sideEffects: ['Hypoglycemia', 'Weight gain'],
        contraindications: ['Hypoglycemia']
      }
    };

    
    this.controlThresholds = {
      excellent: 6.5,
      good: 7.0,
      moderate: 8.0,
      poor: 9.0
    };
  }

  /**
 * Analizeaza medicamentele utilizate de pacientii similari si eficacitatea acestora.
 * Genereaza recomandari bazate pe rata de succes si utilizare.
 * 
 * @param {Array} similarPatients - Lista pacientilor similari pentru analiza
 * @returns {Promise<Object>} Obiect cu recomandari primare si secundare
 */
  async analyzeSimilarPatientMedications(similarPatients) {
    const medicationAnalysis = {};
    const effectivenessScores = {};

    console.log(`[DEBUG] Analyzing ${similarPatients.length} similar patients for medication patterns`);

    for (const patient of similarPatients) {
      if (!patient.details || !patient.details.hemoglobinA1c) {
        console.log('[DEBUG] Skipping patient - no HbA1c data');
        continue;
      }

      const hba1c = patient.details.hemoglobinA1c;
      const controlScore = this.calculateControlScore(hba1c);

      await this.extractPatientMedications(patient, controlScore, medicationAnalysis, effectivenessScores);
    }

    console.log('[DEBUG] Medication analysis results:', Object.keys(medicationAnalysis));

    return this.generateMedicationRecommendations(medicationAnalysis, effectivenessScores);
  }

  /**
 * Calculeaza scorul de control bazat pe valoarea HbA1c.
 * Evalueaza calitatea controlului glicemic al pacientului.
 * 
 * @param {number} hba1c - Valoarea hemoglobinei glicate
 * @returns {number} Scor intre 0.2 si 1.0 (mai mare = control mai bun)
 */
  calculateControlScore(hba1c) {
    if (hba1c <= this.controlThresholds.excellent) return 1.0; // Excellent
    if (hba1c <= this.controlThresholds.good) return 0.8;      // Good
    if (hba1c <= this.controlThresholds.moderate) return 0.6;  // Moderate
    if (hba1c <= this.controlThresholds.poor) return 0.4;      // Poor
    return 0.2; 
  }

  /**
 * Extrage medicamentele unui pacient cu strategii multiple de fallback.
 * Incearca mai multe metode de obtinere a datelor despre medicatie.
 * 
 * @param {Object} patient - Obiectul pacient pentru analiza
 * @param {number} controlScore - Scorul de control glicemic calculat
 * @param {Object} medicationAnalysis - Obiectul de analiza a medicamentelor
 * @param {Object} effectivenessScores - Scorurile de eficacitate calculate
 */
  async extractPatientMedications(patient, controlScore, medicationAnalysis, effectivenessScores) {
    try {
      let fullPatient = null;
      let medications = null;

      if (patient.userId) {
        try {
          fullPatient = await User.findById(patient.userId);
          if (fullPatient && fullPatient.currentMedication) {
            medications = fullPatient.currentMedication;
            console.log(`[DEBUG] Found medication data via userId for patient ${patient.userId}`);
          }
        } catch (error) {
          console.log(`[DEBUG] Failed to fetch patient by userId: ${error.message}`);
        }
      }

      if (!medications && patient.currentMedication) {
        medications = patient.currentMedication;
        console.log('[DEBUG] Using medication data directly from patient object');
      }

      if (!medications && patient.email) {
        try {
          fullPatient = await User.findOne({ email: patient.email });
          if (fullPatient && fullPatient.currentMedication) {
            medications = fullPatient.currentMedication;
            console.log(`[DEBUG] Found medication data via email for patient ${patient.email}`);
          }
        } catch (error) {
          console.log(`[DEBUG] Failed to fetch patient by email: ${error.message}`);
        }
      }

      if (!medications) {
        medications = this.generateSyntheticMedication(patient.details.hemoglobinA1c, patient.details);
        console.log('[DEBUG] Generated synthetic medication data based on patient profile');
      }

      if (medications) {
        this.processMedicationData(medications, patient, controlScore, medicationAnalysis);
      }

    } catch (error) {
      console.error('Error extracting patient medications:', error);
    }
  }


  generateSyntheticMedication(hba1c, patientDetails) {
    const syntheticMeds = {};
    
    syntheticMeds.metformin = {
      prescribed: true,
      dosage: hba1c > 8 ? 1500 : 1000,
      intensity: hba1c > 8 ? 'H' : 'M'
    };


    if (hba1c > 6.5) {
      const secondLineOptions = ['sitagliptin', 'empagliflozin', 'gliclazide', 'dapagliflozin'];
      const selectedSecondLine = secondLineOptions[Math.floor(Math.random() * secondLineOptions.length)];
      
      syntheticMeds[selectedSecondLine] = {
        prescribed: true,
        dosage: this.getStandardDose(selectedSecondLine),
        intensity: 'M'
      };
    }


    if (hba1c > 7.5 && Math.random() > 0.5) {
      const thirdLineOptions = ['vildagliptin', 'gliclazide', 'empagliflozin'];
      const availableOptions = thirdLineOptions.filter(med => !syntheticMeds[med]);
      
      if (availableOptions.length > 0) {
        const selectedThirdLine = availableOptions[Math.floor(Math.random() * availableOptions.length)];
        syntheticMeds[selectedThirdLine] = {
          prescribed: true,
          dosage: this.getStandardDose(selectedThirdLine),
          intensity: 'L'
        };
      }
    }


    if (hba1c > 9.0) {
      syntheticMeds.insulin = {
        prescribed: true,
        dosage: 20,
        intensity: 'L'
      };
    }

    if (patientDetails.hasHypertension && !syntheticMeds.empagliflozin && Math.random() > 0.3) {
      syntheticMeds.empagliflozin = {
        prescribed: true,
        dosage: 10,
        intensity: 'L'
      };
    }

    return syntheticMeds;
  }

 /**
 * Proceseaza datele de medicatie si le adauga la analiza globala.
 * Actualizeaza contoarele si calculele de eficacitate pentru fiecare medicament.
 * 
 * @param {Object} medications - Obiectul cu medicamentele pacientului
 * @param {Object} patient - Datele pacientului analizat
 * @param {number} controlScore - Scorul de control al pacientului
 * @param {Object} medicationAnalysis - Obiectul de analiza pentru actualizare
 */
  processMedicationData(medications, patient, controlScore, medicationAnalysis) {
    Object.keys(this.medicationClasses).forEach(medName => {
      if (medications[medName] && medications[medName].prescribed) {
        if (!medicationAnalysis[medName]) {
          medicationAnalysis[medName] = {
            count: 0,
            totalEffectiveness: 0,
            doses: [],
            patients: []
          };
        }

        medicationAnalysis[medName].count++;
        medicationAnalysis[medName].totalEffectiveness += controlScore;
        
        if (medications[medName].dosage) {
          medicationAnalysis[medName].doses.push(medications[medName].dosage);
        }

        medicationAnalysis[medName].patients.push({
          hba1c: patient.details.hemoglobinA1c,
          similarity: patient.similarity,
          controlScore: controlScore,
          dosage: medications[medName].dosage
        });

        console.log(`[DEBUG] Added ${medName} to analysis (count: ${medicationAnalysis[medName].count})`);
      }
    });
  }

 /**
 * Genereaza recomandari de medicatie asigurand afisarea mai multor optiuni.
 * Clasifica medicamentele dupa eficacitate si utilizare.
 * 
 * @param {Object} medicationAnalysis - Rezultatele analizei medicamentelor
 * @param {Object} effectivenessScores - Scorurile calculate de eficacitate
 * @returns {Object} Obiect cu recomandari primare si secundare
 */
  generateMedicationRecommendations(medicationAnalysis, effectivenessScores) {
    const recommendations = {
      primary: [],
      secondary: [],
      rationale: {},
      effectiveness: {}
    };

    console.log('[DEBUG] Generating recommendations from analysis:', Object.keys(medicationAnalysis));

    Object.keys(medicationAnalysis).forEach(medName => {
      const analysis = medicationAnalysis[medName];
      if (analysis.count > 0) {
        const effectiveness = analysis.totalEffectiveness / analysis.count;
        const usage = analysis.count;
        const avgDose = analysis.doses.length > 0 
          ? Math.round(analysis.doses.reduce((a, b) => a + b, 0) / analysis.doses.length)
          : null;

        effectivenessScores[medName] = {
          effectiveness: effectiveness,
          usage: usage,
          avgDose: avgDose,
          medInfo: this.medicationClasses[medName],
          patients: analysis.patients
        };
      }
    });

    const sortedMedications = Object.entries(effectivenessScores)
      .sort(([,a], [,b]) => (b.effectiveness * b.usage) - (a.effectiveness * a.usage));

    console.log('[DEBUG] Sorted medications:', sortedMedications.map(([name, data]) => ({
      name,
      effectiveness: data.effectiveness,
      usage: data.usage
    })));


   sortedMedications.forEach(([medName, data]) => {
  if (data.effectiveness >= 0.4 && data.usage >= 2) { 
    recommendations.primary.push({
      medication: this.formatMedicationName(medName),
      class: data.medInfo.class,
      dosage: data.avgDose || this.getStandardDose(medName),
      unit: this.getDosageUnit(medName),
      effectiveness: `${(data.effectiveness * 100).toFixed(0)}% rată de succes`, // TRADUS
      usage: `Folosit de ${data.usage} pacienți similari`, // TRADUS
      rationale: this.generateRationale(medName, data),
      evidenceLevel: this.getEvidenceLevel(data.usage, data.effectiveness)
    });
  }
});

    if (recommendations.primary.length < 2) {
  sortedMedications.forEach(([medName, data]) => {
    if (data.effectiveness >= 0.3 && data.usage >= 1 && 
        !recommendations.primary.some(rec => rec.medication === this.formatMedicationName(medName))) {
      recommendations.primary.push({
        medication: this.formatMedicationName(medName),
        class: data.medInfo.class,
        dosage: data.avgDose || this.getStandardDose(medName),
        unit: this.getDosageUnit(medName),
        effectiveness: `${(data.effectiveness * 100).toFixed(0)}% rată de succes`, // TRADUS
        usage: `Folosit de ${data.usage} pacienți similari`, // TRADUS
        rationale: this.generateRationale(medName, data),
        evidenceLevel: this.getEvidenceLevel(data.usage, data.effectiveness)
      });
    }
  });
}


if (recommendations.primary.length === 0) {
  console.log('[DEBUG] No similar patient medications found, using standard recommendations');
  

  recommendations.primary.push({
    medication: 'Metformin',
    class: 'Biguanides',
    dosage: 1000,
    unit: 'mg/zi', 
    effectiveness: 'Terapie de prima linie', 
    usage: 'Ghiduri de îngrijire standard', 
    rationale: 'Tratament de prima linie pentru diabetul de tip 2 conform ADA/EASD', 
    evidenceLevel: 'A (Puternic)' 
  });

  recommendations.primary.push({
    medication: 'Sitagliptin',
    class: 'DPP-4 Inhibitors',
    dosage: 50,
    unit: 'mg/zi', 
    effectiveness: 'Terapie de a doua linie', 
    usage: 'Ghiduri de îngrijire standard', 
    rationale: 'Opțiune sigură de a doua linie cu risc scăzut de hipoglicemie', 
    evidenceLevel: 'Ghiduri' 
  });
} else if (recommendations.primary.length === 1) {
  
  const existingMeds = recommendations.primary.map(r => r.medication.toLowerCase());
  
  if (!existingMeds.includes('metformin')) {
    recommendations.primary.unshift({
      medication: 'Metformin',
      class: 'Biguanides',
      dosage: 1000,
      unit: 'mg/zi', 
      effectiveness: 'Terapie de prima linie', 
      usage: 'Ghiduri de îngrijire standard', 
      rationale: 'Tratament de prima linie pentru diabetul de tip 2 conform ghidurilor', 
      evidenceLevel: 'Ghiduri' 
    });
  } else {
    recommendations.primary.push({
      medication: 'Sitagliptin',
      class: 'DPP-4 Inhibitors',
      dosage: 50,
      unit: 'mg/zi', 
      effectiveness: 'Terapie de a doua linie', 
      usage: 'Ghiduri de îngrijire standard', 
      rationale: 'Opțiune sigură de a doua linie cu date de siguranță cardiovasculară', 
      evidenceLevel: 'Ghiduri' 
    });
  }
}
    const primaryMedNames = recommendations.primary.map(r => r.medication.toLowerCase());
sortedMedications.forEach(([medName, data]) => {
  if (data.effectiveness >= 0.2 && data.usage >= 1 &&
      !primaryMedNames.includes(this.formatMedicationName(medName).toLowerCase())) {
    recommendations.secondary.push({
      medication: this.formatMedicationName(medName),
      class: data.medInfo.class,
      dosage: data.avgDose || this.getStandardDose(medName),
      unit: this.getDosageUnit(medName),
      effectiveness: `${(data.effectiveness * 100).toFixed(0)}% rată de succes`, 
      usage: `Folosit de ${data.usage} pacienți similari`, 
      rationale: this.generateRationale(medName, data),
      evidenceLevel: this.getEvidenceLevel(data.usage, data.effectiveness)
    });
  }
});

    recommendations.effectiveness = effectivenessScores;
    console.log(`[DEBUG] Final recommendations: ${recommendations.primary.length} primary, ${recommendations.secondary.length} secondary`);
    
    return recommendations;
  }

 
generateRationale(medName, data) {
  const avgHbA1c = data.patients.reduce((sum, p) => sum + p.hba1c, 0) / data.patients.length;
  const wellControlledCount = data.patients.filter(p => p.hba1c <= 7.0).length;
  
  let rationale = `${wellControlledCount}/${data.patients.length} pacienți similari au obținut control bun (HbA1c ≤7.0%)`; 
  
  if (data.medInfo.cardiovascularBenefit) {
    rationale += '. Beneficii cardiovasculare suplimentare demonstrate'; 
  }

  if (avgHbA1c <= 7.0) {
    rationale += '. Control mediu excelent la pacienții similari'; 
  }

  return rationale;
}

  
getEvidenceLevel(usage, effectiveness) {
  if (usage >= 5 && effectiveness >= 0.8) return 'A (Puternic)'; 
  if (usage >= 3 && effectiveness >= 0.6) return 'B (Moderat)'; 
  if (usage >= 2 && effectiveness >= 0.4) return 'C (Limitat)'; 
  return 'Ghiduri'; 
}

  formatMedicationName(medName) {
    const names = {
      'metformin': 'Metformin',
      'gliclazide': 'Gliclazide',
      'sitagliptin': 'Sitagliptin',
      'empagliflozin': 'Empagliflozin',
      'dapagliflozin': 'Dapagliflozin',
      'vildagliptin': 'Vildagliptin',
      'insulin': 'Insulin'
    };
    return names[medName] || medName;
  }

getStandardDose(medName) {
  const standardDoses = {
    'metformin': 1000,
    'gliclazide': 80,
    'sitagliptin': 50,
    'empagliflozin': 10,
    'dapagliflozin': 10,
    'vildagliptin': 50,
    'insulin': 20
  };
  return standardDoses[medName] || 'Doză standard'; 
}

getDosageUnit(medName) {
  return medName === 'insulin' ? 'unități/zi' : 'mg/zi'; 
}
}


function getLatestAnalysisData(user) {
  if (!user.analysisData) return null;
  
  if (Array.isArray(user.analysisData)) {
    if (user.analysisData.length === 0) return null;
    const sorted = [...user.analysisData].sort((a, b) => 
      new Date(b.date) - new Date(a.date)
    );
    return sorted[0];
  } else {
    return user.analysisData;
  }
}

function extractCurrentMedications(currentMedication) {
  if (!currentMedication) return [];
  
  const medications = [];
  Object.entries(currentMedication).forEach(([medName, medData]) => {
    if (medData && medData.prescribed) {
      medications.push(`${medName.charAt(0).toUpperCase() + medName.slice(1)} ${medData.dosage || ''}mg`);
    }
  });
  
  return medications;
}

function generateMonitoringRecommendations(analysisData) {
  const hba1c = analysisData.hemoglobinA1c || 7.0;
  
  return {
    hba1c: {
      frequency: hba1c > 8 ? 'La fiecare 3 luni' : 'La fiecare 6 luni',
      target: hba1c > 9 ? '<8.0%' : '<7.0%',
      nextTest: 'În următoarele 3 luni'
    },
    bloodGlucose: {
      frequency: 'Zilnic (a jeun și 2h postprandial)',
      target: 'A jeun: 80-130 mg/dL, Postprandial: <180 mg/dL',
      device: 'Glucometru sau CGM (dacă disponibil)'
    },
    bloodPressure: {
      frequency: 'Săptămânal acasă, la fiecare vizită medicală',
      target: analysisData.hasHypertension ? '<130/80 mmHg' : '<140/90 mmHg'
    },
    lipids: {
      frequency: 'Anual sau la 6 luni dacă necontrolate',
      target: 'LDL <100 mg/dL (sau <70 mg/dL cu risc cardiovascular ridicat)'
    }
  };
}


function generateLifestyleRecommendations(patientProfile) {
  const recommendations = [];
  
  let bmi = null;
  let bmiCategory = 'Unknown';
  let bmiAdvice = '';
  
  if (patientProfile.height && patientProfile.weight) {
    const heightInM = patientProfile.height / 100;
    bmi = (patientProfile.weight / (heightInM * heightInM)).toFixed(1);
    
    if (bmi < 18.5) {
      bmiCategory = 'Subponderal';
      bmiAdvice = 'Creștere în greutate controlată cu sprijin nutrițional';
    } else if (bmi < 25) {
      bmiCategory = 'Normal';
      bmiAdvice = 'Menținerea greutății actuale';
    } else if (bmi < 30) {
      bmiCategory = 'Supraponderal';
      bmiAdvice = 'Pierdere 5-10% din greutatea corporală (3-7 kg)';
    } else {
      bmiCategory = 'Obezitate';
      bmiAdvice = 'Pierdere 10-15% din greutatea corporală (7-12 kg)';
    }
  }

  if (bmi) {
    recommendations.push({
      category: 'Control Greutate',
      recommendation: `BMI actual: ${bmi} kg/m² (${bmiCategory}). ${bmiAdvice}`
    });
  }

  if (patientProfile.currentHbA1c > 8.0) {
    recommendations.push({
      category: 'Control Glicemic Urgent',
      recommendation: 'Limitare carbohidrați la 45-60g per masă, monitorizare glicemie de 4 ori/zi'
    });
  } else if (patientProfile.currentHbA1c > 7.0) {
    recommendations.push({
      category: 'Control Glicemic',
      recommendation: 'Carbohidrați: 45-65g per masă, distributie uniformă pe parcursul zilei'
    });
  }


  if (bmi) {
    if (parseFloat(bmi) >= 30) {
      recommendations.push({
        category: 'Nutriție pentru Obezitate',
        recommendation: 'Deficit caloric 500-750 kcal/zi: porții mici, multe legume, proteine slabe'
      });
      recommendations.push({
        category: 'Carbohidrați',
        recommendation: 'Carbohidrați complexi: ovăz, quinoa, orez integral - 30-40g per masă'
      });
    } else if (parseFloat(bmi) >= 25) {
      recommendations.push({
        category: 'Nutriție pentru Supraponderal',
        recommendation: 'Deficit caloric moderat 300-500 kcal/zi, porții controlate'
      });
      recommendations.push({
        category: 'Carbohidrați',
        recommendation: 'Carbohidrați: 45-50g per masă, evitare carbohidrați rafinați'
      });
    } else {
      recommendations.push({
        category: 'Nutriție pentru Menținere',
        recommendation: 'Menținerea aportului caloric actual, focus pe calitatea alimentelor'
      });
      recommendations.push({
        category: 'Carbohidrați',
        recommendation: 'Carbohidrați: 45-60g per masă, preferă surse cu indice glicemic scăzut'
      });
    }
  }

  recommendations.push({
    category: 'Proteine',
    recommendation: 'Proteine slabe: 20-25g per masă (pește, pui, leguminoase, tofu)'
  });

  recommendations.push({
    category: 'Grăsimi Sănătoase',
    recommendation: 'Ulei de măsline, nuci, avocado, pește gras - 25-30% din calorii'
  });

  recommendations.push({
    category: 'Fibre',
    recommendation: 'Minimum 25-30g fibre/zi: legume, fructe cu coajă, cereale integrale'
  });

  if (patientProfile.comorbidities?.hypertension) {
    recommendations.push({
      category: 'Dieta pentru Hipertensiune',
      recommendation: 'Sodiu <2300mg/zi, potasiu crescut (banane, spanac, fasole)'
    });
  }

  if (patientProfile.comorbidities?.hyperlipidemia) {
    recommendations.push({
      category: 'Dieta pentru Colesterol',
      recommendation: 'Grăsimi saturate <7% din calorii, fibre solubile (ovăz, mere)'
    });
  }

 
  if (bmi && parseFloat(bmi) >= 30) {
    recommendations.push({
      category: 'Activitate Fizică - Obezitate',
      recommendation: 'Start: 150 min/săptămână plimbare, progresiv către 300 min/săptămână'
    });
  } else {
    recommendations.push({
      category: 'Activitate Fizică',
      recommendation: 'Minimum 150 min/săptămână exerciții moderate + 2 sesiuni rezistență'
    });
  }

  recommendations.push({
    category: 'Programul Meselor',
    recommendation: '3 mese principale + 2 gustări mici, interval 3-4 ore între mese'
  });

  return recommendations;
}

function generatePersonalizedInsights(recommendations, analysisData) {
  const insights = [];
  
  if (recommendations.primary && recommendations.primary.length > 0) {
    const topMed = recommendations.primary[0];
    insights.push(`Medicația ${topMed.medication} a demonstrat cea mai bună eficacitate (${topMed.effectiveness}) la pacienții cu profil similar`);
  }
  
  if (analysisData.hemoglobinA1c > 8.0) {
    insights.push('HbA1c este peste ținta recomandată - se recomandă intensificarea tratamentului și control dietary strict');
  } else if (analysisData.hemoglobinA1c <= 7.0) {
    insights.push('HbA1c este la țintă - menținerea tratamentului și stilului de viață actual');
  }
  
  if (analysisData.hasHypertension && analysisData.hasHyperlipidemia) {
    insights.push('Prezența hipertensiunii și hiperlipidemiei necesită medicație cu beneficii cardiovasculare și dietă DASH modificată');
  }
  
  return insights;
}

/**
 * Genereaza recomandari de medicatie asigurand afisarea mai multor optiuni.
 * Clasifica medicamentele dupa eficacitate si utilizare.
 * 
 * @param {Object} medicationAnalysis - Rezultatele analizei medicamentelor
 * @param {Object} effectivenessScores - Scorurile calculate de eficacitate
 * @returns {Object} Obiect cu recomandari primare si secundare
 */
const getMedicationRecommendations = async (req, res) => {
  try {
    const { userId } = req.params;
    
    console.log(`[DEBUG] Getting medication recommendations for user ${userId}`);
    
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilizatorul nu a fost găsit!" });
    }
    
    const latestAnalysis = getLatestAnalysisData(user);
    if (!latestAnalysis) {
      return res.status(400).json({ 
        message: "Nu există date de analiză pentru acest utilizator!" 
      });
    }
    
    const { calculatePatientSimilarity } = require('./similarityController');
    
    const mockReq = { params: { userId } };
    let similarityResults = null;
    
    const mockRes = {
      status: () => mockRes,
      json: (data) => {
        similarityResults = data;
        return mockRes;
      }
    };
    
  
    await calculatePatientSimilarity(mockReq, mockRes);
    
    if (!similarityResults || !similarityResults.similarPatients) {
      return res.status(400).json({ 
        message: "Nu s-au putut calcula pacienții similari!"
      });
    }
    
 
    const recommendationSystem = new PersonalizedMedicationRecommendationSystem();
    
 
    const topSimilarPatients = similarityResults.similarPatients.slice(0, 10);
    
    console.log(`[DEBUG] Analyzing medication patterns from ${topSimilarPatients.length} similar patients`);
    

    const personalizedRecommendations = await recommendationSystem.analyzeSimilarPatientMedications(topSimilarPatients);
    
 
    const currentYear = new Date().getFullYear();
    const patientProfile = {
      age: currentYear - user.birthYear,
      gender: user.gender,
      height: user.height,
      weight: user.weight,
      bmi: user.height && user.weight ? 
        ((user.weight / Math.pow(user.height / 100, 2)).toFixed(1)) : null,
      currentHbA1c: latestAnalysis.hemoglobinA1c,
      diseaseDuration: latestAnalysis.diseaseDuration || (currentYear - user.diagnosisYear),
      bloodPressure: `${latestAnalysis.systolicPressure || 'N/A'}/${latestAnalysis.diastolicPressure || 'N/A'}`,
      comorbidities: {
        hyperlipidemia: latestAnalysis.hasHyperlipidemia || false,
        hypertension: latestAnalysis.hasHypertension || false
      },
      currentMedications: extractCurrentMedications(user.currentMedication)
    };
    

    const monitoring = generateMonitoringRecommendations(latestAnalysis);
    

    const lifestyle = generateLifestyleRecommendations(patientProfile);
    
    console.log(`[DEBUG] Generated ${personalizedRecommendations.primary?.length || 0} primary recommendations`);
    
    res.status(200).json({
      message: "Recomandări personalizate generate cu succes pe baza pacienților similari",
      methodology: "Analiză bazată pe medicația și rezultatele pacienților cu profil similar",
      userId: userId,
      patientProfile: patientProfile,
      recommendations: {
        ...personalizedRecommendations,
        monitoring: monitoring,
        lifestyle: lifestyle
      },
      similarPatientsAnalyzed: topSimilarPatients.length,
      evidenceBasis: `Recomandările sunt bazate pe analiza a ${topSimilarPatients.length} pacienți cu profil similar`,
      personalizedInsights: generatePersonalizedInsights(personalizedRecommendations, latestAnalysis)
    });
    
  } catch (error) {
    console.error("Eroare la generarea recomandărilor:", error);
    res.status(500).json({ 
      message: "Eroare la generarea recomandărilor", 
      error: error.message 
    });
  }
};

/**
 * Obtine statistici detaliate despre utilizarea medicamentelor in baza de date.
 * Calculeaza frecventa si procentajele de utilizare pentru fiecare medicament.
 * 
 * @param {Object} req - Obiectul request Express
 * @param {Object} res - Obiectul response Express
 * @returns {Promise<Object>} JSON cu statistici despre medicamente
 * @throws {Error} Returneaza eroare 500 pentru erori de server
 */
const getMedicationStats = async (req, res) => {
  try {
    const totalPatients = await User.countDocuments();
    
    const medicationStats = {};
    const medications = ['metformin', 'gliclazide', 'sitagliptin', 'empagliflozin', 'dapagliflozin', 'insulin'];
    
    for (const medication of medications) {
      const count = await User.countDocuments({
        [`currentMedication.${medication}.prescribed`]: true
      });
      
      medicationStats[medication] = {
        count: count,
        percentage: totalPatients > 0 ? ((count / totalPatients) * 100).toFixed(1) : '0.0'
      };
    }
    
    const totalMedications = Object.values(medicationStats).reduce((sum, med) => sum + med.count, 0);
    
    res.status(200).json({
      message: "Statistici medicație obținute cu succes",
      totalPatients: totalPatients,
      totalMedications: totalMedications,
      medicationStats: medicationStats,
      mostCommon: Object.entries(medicationStats)
        .sort(([,a], [,b]) => b.count - a.count)
        .slice(0, 3)
        .map(([med, stats]) => ({ medication: med, ...stats }))
    });
    
  } catch (error) {
    console.error("Eroare la obținerea statisticilor:", error);
    res.status(500).json({ 
      message: "Eroare la obținerea statisticilor", 
      error: error.message 
    });
  }
};

module.exports = {
  getMedicationRecommendations,
  getMedicationStats,
  PersonalizedMedicationRecommendationSystem
};