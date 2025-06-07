// Enhanced medicationController.js - True Personalized Recommendations
const User = require("../models/User");

class PersonalizedMedicationRecommendationSystem {
  constructor() {
    // Medication effectiveness scoring
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

    // HbA1c control thresholds
    this.controlThresholds = {
      excellent: 6.5,
      good: 7.0,
      moderate: 8.0,
      poor: 9.0
    };
  }

  /**
   * Analyze medications used by similar patients and their effectiveness
   */
  analyzeSimilarPatientMedications(similarPatients) {
    const medicationAnalysis = {};
    const effectivenessScores = {};

    similarPatients.forEach(patient => {
      if (!patient.details || !patient.details.hemoglobinA1c) return;

      const hba1c = patient.details.hemoglobinA1c;
      const isWellControlled = hba1c <= this.controlThresholds.good;
      const controlScore = this.calculateControlScore(hba1c);

      // Get patient's full data to access medication
      this.extractPatientMedications(patient, controlScore, medicationAnalysis, effectivenessScores);
    });

    // Calculate medication recommendations based on effectiveness
    return this.generateMedicationRecommendations(medicationAnalysis, effectivenessScores);
  }

  /**
   * Calculate control score based on HbA1c
   */
  calculateControlScore(hba1c) {
    if (hba1c <= this.controlThresholds.excellent) return 1.0; // Excellent
    if (hba1c <= this.controlThresholds.good) return 0.8;      // Good
    if (hba1c <= this.controlThresholds.moderate) return 0.6;  // Moderate
    if (hba1c <= this.controlThresholds.poor) return 0.4;      // Poor
    return 0.2; // Very poor
  }

  /**
   * Extract medications from similar patients
   */
  async extractPatientMedications(patient, controlScore, medicationAnalysis, effectivenessScores) {
    try {
      // Get full patient data from database
      const fullPatient = await User.findById(patient.userId);
      if (!fullPatient || !fullPatient.currentMedication) return;

      const medications = fullPatient.currentMedication;

      // Analyze each prescribed medication
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
        }
      });
    } catch (error) {
      console.error('Error extracting patient medications:', error);
    }
  }

  /**
   * Generate personalized medication recommendations
   */
  generateMedicationRecommendations(medicationAnalysis, effectivenessScores) {
    const recommendations = {
      primary: [],
      secondary: [],
      rationale: {},
      effectiveness: {}
    };

    // Calculate effectiveness scores for each medication
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

    // Sort medications by effectiveness
    const sortedMedications = Object.entries(effectivenessScores)
      .sort(([,a], [,b]) => (b.effectiveness * b.usage) - (a.effectiveness * a.usage));

    // Generate primary recommendations (top 2-3 most effective)
    sortedMedications.slice(0, 3).forEach(([medName, data]) => {
      if (data.effectiveness >= 0.6 && data.usage >= 2) { // At least moderate effectiveness and used by 2+ patients
        recommendations.primary.push({
          medication: this.formatMedicationName(medName),
          class: data.medInfo.class,
          dosage: data.avgDose || this.getStandardDose(medName),
          unit: this.getDosageUnit(medName),
          effectiveness: `${(data.effectiveness * 100).toFixed(0)}% success rate`,
          usage: `Used by ${data.usage} similar patients`,
          rationale: this.generateRationale(medName, data),
          evidenceLevel: this.getEvidenceLevel(data.usage, data.effectiveness)
        });
      }
    });

    // Generate secondary recommendations
    sortedMedications.slice(3, 6).forEach(([medName, data]) => {
      if (data.effectiveness >= 0.4 && data.usage >= 1) {
        recommendations.secondary.push({
          medication: this.formatMedicationName(medName),
          class: data.medInfo.class,
          dosage: data.avgDose || this.getStandardDose(medName),
          unit: this.getDosageUnit(medName),
          effectiveness: `${(data.effectiveness * 100).toFixed(0)}% success rate`,
          usage: `Used by ${data.usage} similar patients`,
          rationale: this.generateRationale(medName, data),
          evidenceLevel: this.getEvidenceLevel(data.usage, data.effectiveness)
        });
      }
    });

    // If no medications found, provide standard recommendations
    if (recommendations.primary.length === 0) {
      recommendations.primary.push({
        medication: 'Metformin',
        class: 'Biguanides',
        dosage: 1000,
        unit: 'mg/day',
        effectiveness: 'Standard first-line therapy',
        usage: 'Recommended by guidelines',
        rationale: 'No similar patients found - using standard care guidelines',
        evidenceLevel: 'Guidelines'
      });
    }

    recommendations.effectiveness = effectivenessScores;
    return recommendations;
  }

  /**
   * Generate rationale for medication recommendation
   */
  generateRationale(medName, data) {
    const avgHbA1c = data.patients.reduce((sum, p) => sum + p.hba1c, 0) / data.patients.length;
    const wellControlledCount = data.patients.filter(p => p.hba1c <= 7.0).length;
    
    let rationale = `${wellControlledCount}/${data.patients.length} similar patients achieved good control (HbA1c ≤7.0%)`;
    
    if (data.medInfo.cardiovascularBenefit) {
      rationale += '. Additional cardiovascular benefits demonstrated';
    }

    if (avgHbA1c <= 7.0) {
      rationale += '. Excellent average control in similar patients';
    }

    return rationale;
  }

  /**
   * Get evidence level based on usage and effectiveness
   */
  getEvidenceLevel(usage, effectiveness) {
    if (usage >= 5 && effectiveness >= 0.8) return 'A (Strong)';
    if (usage >= 3 && effectiveness >= 0.6) return 'B (Moderate)';
    if (usage >= 2 && effectiveness >= 0.4) return 'C (Limited)';
    return 'Guidelines';
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
      'insulin': 'Variable'
    };
    return standardDoses[medName] || 'Standard dose';
  }

  getDosageUnit(medName) {
    return medName === 'insulin' ? 'units/day' : 'mg/day';
  }
}

/**
 * Enhanced controller function that uses actual similar patient data
 */
const getMedicationRecommendations = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Get current user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilizatorul nu a fost găsit!" });
    }
    
    // Get user's latest analysis data
    const latestAnalysis = getLatestAnalysisData(user);
    if (!latestAnalysis) {
      return res.status(400).json({ 
        message: "Nu există date de analiză pentru acest utilizator!" 
      });
    }
    
    // Calculate similar patients (using existing similarity algorithm)
    const { calculatePatientSimilarity } = require('./similarityController');
    
    // Create a mock request/response to reuse similarity calculation
    const mockReq = { params: { userId } };
    let similarityResults = null;
    
    const mockRes = {
      status: () => mockRes,
      json: (data) => {
        similarityResults = data;
        return mockRes;
      }
    };
    
    // Get similarity results
    await calculatePatientSimilarity(mockReq, mockRes);
    
    if (!similarityResults || !similarityResults.similarPatients) {
      return res.status(400).json({ 
        message: "Nu s-au putut calcula pacienții similari!" 
      });
    }
    
    // Initialize recommendation system
    const recommendationSystem = new PersonalizedMedicationRecommendationSystem();
    
    // Get top 10 most similar patients for analysis
    const topSimilarPatients = similarityResults.similarPatients.slice(0, 10);
    
    // Generate personalized recommendations based on similar patients
    const personalizedRecommendations = await recommendationSystem.analyzeSimilarPatientMedications(topSimilarPatients);
    
    // Patient profile
    const currentYear = new Date().getFullYear();
    const patientProfile = {
      age: currentYear - user.birthYear,
      gender: user.gender,
      currentHbA1c: latestAnalysis.hemoglobinA1c,
      diseaseDuration: latestAnalysis.diseaseDuration || (currentYear - user.diagnosisYear),
      bloodPressure: `${latestAnalysis.systolicPressure || 'N/A'}/${latestAnalysis.diastolicPressure || 'N/A'}`,
      comorbidities: {
        hyperlipidemia: latestAnalysis.hasHyperlipidemia || false,
        hypertension: latestAnalysis.hasHypertension || false
      },
      currentMedications: extractCurrentMedications(user.currentMedication)
    };
    
    // Generate monitoring recommendations
    const monitoring = generateMonitoringRecommendations(latestAnalysis);
    
    // Generate lifestyle recommendations
    const lifestyle = generateLifestyleRecommendations(patientProfile);
    
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
      message: "Eroare la generarea recomandărilor personalizate", 
      error: error.message 
    });
  }
};

/**
 * Helper functions
 */
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
  Object.keys(currentMedication).forEach(med => {
    if (currentMedication[med] && currentMedication[med].prescribed) {
      medications.push({
        name: med,
        dosage: currentMedication[med].dosage,
        intensity: currentMedication[med].intensity
      });
    }
  });
  
  return medications;
}

function generateMonitoringRecommendations(analysisData) {
  const hba1c = analysisData.hemoglobinA1c;
  
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
  
  if (patientProfile.currentHbA1c > 7.0) {
    recommendations.push({
      category: 'Control Glicemic',
      recommendation: 'Monitorizare mai frecventă a glicemiei și ajustare alimentație'
    });
  }
  
  recommendations.push({
    category: 'Activitate Fizică',
    recommendation: 'Minimum 150 minute/săptămână exerciții aerobice moderate + 2 sesiuni exerciții de rezistență'
  });
  
  recommendations.push({
    category: 'Nutriție',
    recommendation: 'Dietă mediteraneană sau DASH, control porții carbohidrați, 5-7 porții legume/zi'
  });
  
  if (patientProfile.comorbidities.hypertension) {
    recommendations.push({
      category: 'Gestionare Hipertensiune',
      recommendation: 'Reducere sodiu (<2300mg/zi), creștere potasiu, gestionare stres'
    });
  }
  
  recommendations.push({
    category: 'Gestionare Stres',
    recommendation: 'Tehnici de relaxare, somn adecvat (7-8h/noapte), suport social'
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
    insights.push('HbA1c este peste ținta recomandată - s-ar putea necesita intensificarea tratamentului');
  } else if (analysisData.hemoglobinA1c <= 7.0) {
    insights.push('HbA1c este la țintă - menținerea tratamentului actual pare eficientă');
  }
  
  if (analysisData.hasHypertension && analysisData.hasHyperlipidemia) {
    insights.push('Prezența atât a hipertensiunii cât și a hiperlipidemiei crește riscul cardiovascular - se recomandă medicație cu beneficii cardiovasculare');
  }
  
  return insights;
}

// Keep existing getMedicationStats function unchanged
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
    
    res.status(200).json({
      message: "Statistici medicație generate cu succes",
      totalPatients: totalPatients,
      medicationStats: medicationStats
    });
    
  } catch (error) {
    console.error("Eroare la generarea statisticilor:", error);
    res.status(500).json({ 
      message: "Eroare la generarea statisticilor", 
      error: error.message 
    });
  }
};

module.exports = {
  getMedicationRecommendations,
  getMedicationStats
};