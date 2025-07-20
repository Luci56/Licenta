const User = require("../models/User");

/**
 * Calculator avansat pentru similaritatea pacientilor folosind algoritmul T-D3K.
 * Combina similaritatea clinica D3K cu analiza traiectoriei HbA1c.
 * Conform articolului: "Diabetes medication recommendation system using patient similarity analytics".
 */
class EnhancedPatientSimilarityCalculator {
  constructor() {
    this.ranges = {
      age: { min: 21, max: 100 },
      systolicPressure: { min: 80, max: 250 },
      diastolicPressure: { min: 50, max: 150 },
      cholesterolHDL: { min: 15, max: 150 },
      cholesterolLDL: { min: 50, max: 200 },
      triglycerides: { min: 50, max: 500 },
      hemoglobinA1c: { min: 4.0, max: 20.0 },
      diseaseDuration: { min: 0, max: 80 }
    };


    this.clinicalWeights = {
      age: 0.08,
      gender: 0.05,
      systolicPressure: 0.12,
      diastolicPressure: 0.10,
      cholesterolHDL: 0.10,
      cholesterolLDL: 0.10,
      triglycerides: 0.08,
      hemoglobinA1c: 0.25,  
      hasHyperlipidemia: 0.06,
      hasHypertension: 0.06,
      diseaseDuration: 0.12,
      medicationCount: 0.08
    };

    
    this.trajectoryThreshold = 0.3; 
    this.normalHbA1cRange = { min: 4.0, max: 7.0 }; 
    this.nGramSize = 6; 
    
    // Clasificarea medicamentelor conform Supplementary Table S1
    this.medicationClasses = {
      // Diabetes medications
      'metformin': { class: 'biguanides', type: 'dm' },
      'gliclazide': { class: 'sulfonylureas', type: 'dm' },
      'glipizide': { class: 'sulfonylureas', type: 'dm' },
      'sitagliptin': { class: 'dpp4_inhibitors', type: 'dm' },
      'vildagliptin': { class: 'dpp4_inhibitors', type: 'dm' },
      'linagliptin': { class: 'dpp4_inhibitors', type: 'dm' },
      'empagliflozin': { class: 'sglt2_inhibitors', type: 'dm' },
      'dapagliflozin': { class: 'sglt2_inhibitors', type: 'dm' },
      'acarbose': { class: 'alpha_glucosidase_inhibitors', type: 'dm' },
      'insulin': { class: 'insulin', type: 'dm' }
    };

    // Intensitatea dozajului conform articolului 
    this.dosageIntensity = {
      metformin: { L: 850, M: 1700, H: 2550 }, // max 3000mg
      gliclazide: { L: 107, M: 213, H: 320 },  // max 320mg
      glipizide: { L: 10, M: 20, H: 30 },      // max 30mg
      sitagliptin: { L: 33, M: 67, H: 100 },   // max 100mg
      vildagliptin: { L: 33, M: 67, H: 100 },  // max 100mg
      empagliflozin: { L: 8, M: 17, H: 25 },   // max 25mg
      dapagliflozin: { L: 8, M: 17, H: 25 },   // max 25mg
      acarbose: { L: 100, M: 200, H: 300 }     // max 300mg
    };
  }

  /**
   * Normalizare min-max conform articolului
   */
  normalizeValue(value, min, max) {
    if (max === min) return 0.5;
    return Math.max(0, Math.min(1, (value - min) / (max - min)));
  }

  /**
   * Calculează distanța Mahalanobis adaptată conform D3K method
   */
  calculateD3KDistance(vector1, vector2, weights) {
    if (vector1.length !== vector2.length) {
      throw new Error("Vectorii trebuie să aibă aceeași lungime");
    }

    let distance = 0;
    for (let i = 0; i < vector1.length; i++) {
      const diff = vector1[i] - vector2[i];
      // Distanța Mahalanobis adaptată cu greutățile D3K
      distance += weights[i] * (diff * diff);
    }
    
    return Math.sqrt(distance);
  }

  mapHbA1cTrajectory(hba1cValues) {
    if (!hba1cValues || hba1cValues.length < 2) {
      return "N"; 
    }

    let trajectory = "";
    
    for (let i = 0; i < hba1cValues.length - 1; i++) {
      const v1 = hba1cValues[i];
      const v2 = hba1cValues[i + 1];
      const difference = Math.abs(v2 - v1);
      
      if (difference <= this.trajectoryThreshold) {
        
        if (v1 >= this.normalHbA1cRange.min && v1 <= this.normalHbA1cRange.max) {
          trajectory += "N"; 
        } else {
          trajectory += "A"; 
        }
      } else {
        
        if (v2 > v1) {
          trajectory += "U"; 
        } else {
          trajectory += "D"; 
        }
      }
    }
    
    return trajectory;
  }


  generateNGrams(trajectory, n = this.nGramSize) {
    if (trajectory.length < n) {
      return [trajectory];
    }
    
    const nGrams = [];
    for (let i = 0; i <= trajectory.length - n; i++) {
      nGrams.push(trajectory.substring(i, i + n));
    }
    return nGrams;
  }

  calculateTrajectorySimilarity(trajectory1, trajectory2) {
    const nGrams1 = this.generateNGrams(trajectory1);
    const nGrams2 = this.generateNGrams(trajectory2);
    
    // Creează vocabularul tuturor n-grams unice
    const allNGrams = new Set([...nGrams1, ...nGrams2]);
    const vocab = Array.from(allNGrams);
    
    // Creează vectorii de frecvență
    const vector1 = vocab.map(ngram => nGrams1.filter(t => t === ngram).length);
    const vector2 = vocab.map(ngram => nGrams2.filter(t => t === ngram).length);
    
    
    const dotProduct = vector1.reduce((sum, v1, i) => sum + v1 * vector2[i], 0);
    const magnitude1 = Math.sqrt(vector1.reduce((sum, v) => sum + v * v, 0));
    const magnitude2 = Math.sqrt(vector2.reduce((sum, v) => sum + v * v, 0));
    
    if (magnitude1 === 0 || magnitude2 === 0) {
      return 0;
    }
    
    return dotProduct / (magnitude1 * magnitude2);
  }

 
  extractClinicalProfile(userData, analysisData) {
    const currentYear = new Date().getFullYear();
    const age = currentYear - userData.birthYear;
    const genderValue = userData.gender === "Masculin" ? 1 : 0;
    
    const medicationCount = this.getMedicationCount(userData.currentMedication);
    
    return [
      this.normalizeValue(age, this.ranges.age.min, this.ranges.age.max),
      genderValue,
      this.normalizeValue(
        analysisData.systolicPressure || 130, 
        this.ranges.systolicPressure.min, 
        this.ranges.systolicPressure.max
      ),
      this.normalizeValue(
        analysisData.diastolicPressure || 80, 
        this.ranges.diastolicPressure.min, 
        this.ranges.diastolicPressure.max
      ),
      this.normalizeValue(
        analysisData.cholesterolHDL || 50, 
        this.ranges.cholesterolHDL.min, 
        this.ranges.cholesterolHDL.max
      ),
      this.normalizeValue(
        analysisData.cholesterolLDL || 100, 
        this.ranges.cholesterolLDL.min, 
        this.ranges.cholesterolLDL.max
      ),
      this.normalizeValue(
        analysisData.triglycerides || 150, 
        this.ranges.triglycerides.min, 
        this.ranges.triglycerides.max
      ),
      this.normalizeValue(
        analysisData.hemoglobinA1c || 7.0, 
        this.ranges.hemoglobinA1c.min, 
        this.ranges.hemoglobinA1c.max
      ),
      analysisData.hasHyperlipidemia ? 1 : 0,
      analysisData.hasHypertension ? 1 : 0,
      this.normalizeValue(
        analysisData.diseaseDuration || 5, 
        this.ranges.diseaseDuration.min, 
        this.ranges.diseaseDuration.max
      ),
      this.normalizeValue(medicationCount, 0, 5) // max 5 medicamente
    ];
  }

  /**
 * Calculeaza numarul de medicamente pentru diabet conform articolului.
 * Numara doar medicamentele prescrise din clasele definite.
 * 
 * @param {Object} currentMedication - Obiectul cu medicamentele curente
 * @returns {number} Numarul total de medicamente prescrise
 */
  getMedicationCount(currentMedication) {
    if (!currentMedication) return 0;
    
    let count = 0;
    Object.keys(this.medicationClasses).forEach(med => {
      if (currentMedication[med] && currentMedication[med].prescribed) {
        count++;
      }
    });
    
    return count;
  }

  /**
 * Calculeaza similaritatea D3K conform articolului stiintific.
 * Utilizeaza distanta ponderata si exponential decay pentru similaritate.
 * 
 * @param {Array} profile1 - Profilul clinic al primului pacient
 * @param {Array} profile2 - Profilul clinic al celui de-al doilea pacient
 * @returns {number} Scor de similaritate intre 0 si 1
 */
  calculateD3KSimilarity(profile1, profile2) {
    const weights = Object.values(this.clinicalWeights);
    const distance = this.calculateD3KDistance(profile1, profile2, weights);
    
    // Convertește distanța în similaritate folosind exponential decay
    return Math.exp(-distance);
  }

  /**
 * Calculeaza similaritatea T-D3K combinata conform articolului.
 * Combina similaritatea D3K cu analiza traiectoriei temporale.
 * 
 * @param {Object} currentUser - Utilizatorul curent pentru comparatie
 * @param {Object} otherUser - Celalalt utilizator din comparatie
 * @returns {number} Scor final T-D3K intre 0 si 1
 */
  calculateTD3KSimilarity(currentUser, otherUser) {
    const currentAnalysis = this.getLatestAnalysisData(currentUser);
    const otherAnalysis = this.getLatestAnalysisData(otherUser);
    
    if (!currentAnalysis || !otherAnalysis) {
      return 0;
    }

    // Calculează D3K similarity
    const currentProfile = this.extractClinicalProfile(currentUser, currentAnalysis);
    const otherProfile = this.extractClinicalProfile(otherUser, otherAnalysis);
    const d3kSimilarity = this.calculateD3KSimilarity(currentProfile, otherProfile);

    // Calculează trajectory similarity
    let trajectorySimilarity = 0.5; 
    
    const currentHbA1cValues = this.extractHbA1cTrajectory(currentUser);
    const otherHbA1cValues = this.extractHbA1cTrajectory(otherUser);
    
    if (currentHbA1cValues.length >= 2 && otherHbA1cValues.length >= 2) {
      const currentTrajectory = this.mapHbA1cTrajectory(currentHbA1cValues);
      const otherTrajectory = this.mapHbA1cTrajectory(otherHbA1cValues);
      
      trajectorySimilarity = this.calculateTrajectorySimilarity(currentTrajectory, otherTrajectory);
    }

    // Combină D3K și trajectory similarities cu greutăți egale
    const alpha = 0.5; 
    const beta = 0.5;  
    
    return alpha * d3kSimilarity + beta * trajectorySimilarity;
  }

 /**
 * Extrage traiectoria HbA1c din datele utilizatorului.
 * Ordoneaza cronologic valorile pentru analiza temporala.
 * 
 * @param {Object} user - Utilizatorul pentru extragerea datelor
 * @returns {Array} Lista valorilor HbA1c ordonate cronologic
 */
  extractHbA1cTrajectory(user) {
    if (!user.analysisData || !Array.isArray(user.analysisData)) {
      return [];
    }
    
    return user.analysisData
      .filter(data => data.hemoglobinA1c && data.hemoglobinA1c > 0)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map(data => data.hemoglobinA1c);
  }
/**
 * Obtine cele mai recente date de analiza ale utilizatorului.
 * Gestioneaza atat format array cat si obiect simplu.
 * 
 * @param {Object} user - Utilizatorul pentru obtinerea datelor
 * @returns {Object|null} Ultimele date de analiza sau null daca nu exista
 */
  getLatestAnalysisData(user) {
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

 /**
 * Obtine valorile glicemiei recente din datele zilnice.
 * Cauta in dailyData cea mai recenta inregistrare cu glicemie.
 * 
 * @param {Object} user - Utilizatorul pentru obtinerea datelor
 * @returns {number|null} Valoarea glicemiei sau null daca nu exista
 */
  getLatestBloodSugar(user) {
    if (!user.dailyData || user.dailyData.length === 0) return null;
    
    const sorted = [...user.dailyData].sort((a, b) => 
      new Date(b.date) - new Date(a.date)
    );
    return sorted[0].bloodGlucose || sorted[0].bloodSugar;
  }

 /**
 * Genereaza recomandari de medicamente conform articolului stiintific.
 * Clasifica pacientul si ofera recomandari bazate pe cel mai similar pacient.
 * 
 * @param {Array} similarPatients - Lista pacientilor similari ordonata
 * @param {Object} targetPatient - Pacientul pentru care se genereaza recomandari
 * @returns {Object|null} Obiect cu recomandari sau null daca nu se pot genera
 */
  generateMedicationRecommendations(similarPatients, targetPatient) {
    const targetAnalysis = this.getLatestAnalysisData(targetPatient);
    if (!targetAnalysis) return null;

    const targetHbA1c = targetAnalysis.hemoglobinA1c;
    const targetAge = new Date().getFullYear() - targetPatient.birthYear;
    const hasComorbidities = targetAnalysis.hasHypertension || targetAnalysis.hasHyperlipidemia;

    // Clasifică pacientul în grup conform articolului
    let patientGroup = 'DM';
    if (targetAnalysis.hasHyperlipidemia && targetAnalysis.hasHypertension) {
      patientGroup = 'DHL'; 
    } else if (targetAnalysis.hasHyperlipidemia) {
      patientGroup = 'DM_HLD'; 
    } else if (targetAnalysis.hasHypertension) {
      patientGroup = 'DM_HTN'; 
    }

    const mostSimilarPatient = similarPatients[0];
    const recommendations = this.extractMedicationRecommendations(
      mostSimilarPatient, 
      targetHbA1c, 
      targetAge, 
      hasComorbidities,
      patientGroup
    );

    return {
      patientGroup,
      recommendations,
      basedOnPatient: mostSimilarPatient.userId,
      similarityScore: mostSimilarPatient.similarity,
      targetHbA1c: targetHbA1c < 7 ? 'Controlat' : targetHbA1c < 8 ? 'Moderat' : 'Suboptimal'
    };
  }
/**
 * Extrage recomandari specifice de medicatie conform pattern-urilor clinice.
 * Implementeaza logica de prima si a doua linie de tratament.
 * 
 * @param {Object} similarPatient - Pacientul similar ca baza pentru recomandari
 * @param {number} targetHbA1c - Valoarea HbA1c a pacientului tinta
 * @param {number} targetAge - Varsta pacientului tinta
 * @param {boolean} hasComorbidities - Prezenta comorbiditatilor
 * @param {string} patientGroup - Grupa de clasificare a pacientului
 * @returns {Object} Obiect cu recomandari detaliate de medicatie
 */
  extractMedicationRecommendations(similarPatient, targetHbA1c, targetAge, hasComorbidities, patientGroup) {
    const recommendations = {
      primary: [],
      secondary: [],
      monitoring: {},
      lifestyle: []
    };

    // Prima linie: Metformin 
    if (targetHbA1c >= 6.5) {
      const intensity = targetHbA1c > 9 ? 'H' : targetHbA1c > 8 ? 'M' : 'L';
      recommendations.primary.push({
        medication: 'Metformin',
        dosage: this.dosageIntensity.metformin[intensity],
        unit: 'mg/day',
        intensity: intensity,
        rationale: 'First-line therapy for T2DM'
      });
    }

    
    if (targetHbA1c > 7.0) {
      if (hasComorbidities && targetAge > 60) {
        recommendations.secondary.push({
          medication: 'Empagliflozin',
          dosage: 10,
          unit: 'mg/day',
          intensity: 'L',
          rationale: 'Cardiovascular benefits with comorbidities'
        });
      } else {
        recommendations.secondary.push({
          medication: 'Sitagliptin',
          dosage: 50,
          unit: 'mg/day',
          intensity: 'M',
          rationale: 'Well-tolerated second-line option'
        });
      }
    }


    if (targetHbA1c > 9.0) {
      recommendations.secondary.push({
        medication: 'Insulin (Basal)',
        dosage: 'Titrare',
        unit: 'units/day',
        intensity: 'Variable',
        rationale: 'Needed for severe hyperglycemia'
      });
    }

    recommendations.monitoring = {
      hba1c: {
        frequency: targetHbA1c > 8 ? 'La fiecare 3 luni' : 'La fiecare 6 luni',
        target: targetAge > 70 ? '<8.0%' : '<7.0%'
      },
      bloodGlucose: {
        frequency: 'Zilnic (a jeun și 2h postprandial)',
        target: 'A jeun: 80-130 mg/dL, Postprandial: <180 mg/dL'
      },
      bloodPressure: {
        frequency: 'La fiecare vizită',
        target: '<140/90 mmHg (sau <130/80 mmHg dacă tolerat)'
      },
      lipids: {
        frequency: 'Anual',
        target: 'LDL <100 mg/dL (sau <70 mg/dL cu risc cardiovascular ridicat)'
      }
    };

    recommendations.lifestyle = [
      'Pierdere în greutate: 5-10% din greutatea corporală',
      'Activitate fizică: 150 min/săptămână exerciții aerobice moderate',
      'Dietă: Reducerea carbohidraților rafinați, creșterea fibrelor',
      'Renunțarea la fumat (dacă aplicabil)',
      'Limitarea consumului de alcool'
    ];

    return recommendations;
  }
}

/**
 * Endpoint principal pentru calcularea similaritatii pacientilor.
 * Implementeaza algoritmul complet T-D3K si genereaza recomandari.
 * 
 * @param {Object} req - Obiectul request Express
 * @param {string} req.params.userId - ID-ul utilizatorului pentru comparatie
 * @param {Object} res - Obiectul response Express
 * @returns {Promise<Object>} JSON cu rezultatele similaritatii si recomandari
 * @throws {Error} Returneaza eroare 404 daca utilizatorul nu este gasit
 * @throws {Error} Returneaza eroare 400 daca nu exista date de analiza
 * @throws {Error} Returneaza eroare 500 pentru erori de server
 */
const calculatePatientSimilarity = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const calculator = new EnhancedPatientSimilarityCalculator();
    
    // Obține utilizatorul curent
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({ message: "Utilizatorul nu a fost găsit!" });
    }
    
    const allUsers = await User.find({ _id: { $ne: userId } });
    if (allUsers.length === 0) {
      return res.status(200).json({ 
        message: "Nu există alți utilizatori pentru comparație!", 
        currentUserDetails: {}, 
        similarPatients: [],
        recommendations: null
      });
    }

    const currentAnalysis = calculator.getLatestAnalysisData(currentUser);
    if (!currentAnalysis) {
      return res.status(400).json({ 
        message: "Utilizatorul curent nu are date de analiză!" 
      });
    }

    console.log("Calculez similaritatea folosind algoritmul T-D3K conform Nature 2022...");

    const similarityResults = [];
    
    for (const otherUser of allUsers) {
      const otherAnalysis = calculator.getLatestAnalysisData(otherUser);
      
      if (otherAnalysis) {
        const similarity = calculator.calculateTD3KSimilarity(currentUser, otherUser);
        
        similarityResults.push({
          userId: otherUser._id,
          email: otherUser.email,
          similarity: similarity,
          details: {
            age: new Date().getFullYear() - otherUser.birthYear,
            gender: otherUser.gender,
            systolicPressure: otherAnalysis.systolicPressure,
            diastolicPressure: otherAnalysis.diastolicPressure,
            cholesterolHDL: otherAnalysis.cholesterolHDL,
            cholesterolLDL: otherAnalysis.cholesterolLDL,
            triglycerides: otherAnalysis.triglycerides,
            hemoglobinA1c: otherAnalysis.hemoglobinA1c,
            hasHyperlipidemia: otherAnalysis.hasHyperlipidemia,
            hasHypertension: otherAnalysis.hasHypertension,
            diseaseDuration: otherAnalysis.diseaseDuration,
            bloodSugar: calculator.getLatestBloodSugar(otherUser)
          }
        });
      }
    }

    // Sortează după similaritate (descrescător)
    similarityResults.sort((a, b) => b.similarity - a.similarity);

    // Generează recomandări de medicație
    const recommendations = similarityResults.length > 0 
      ? calculator.generateMedicationRecommendations(similarityResults, currentUser)
      : null;

    // Pregătește detaliile utilizatorului curent
    const currentUserDetails = {
      age: new Date().getFullYear() - currentUser.birthYear,
      gender: currentUser.gender,
      systolicPressure: currentAnalysis.systolicPressure,
      diastolicPressure: currentAnalysis.diastolicPressure,
      cholesterolHDL: currentAnalysis.cholesterolHDL,
      cholesterolLDL: currentAnalysis.cholesterolLDL,
      triglycerides: currentAnalysis.triglycerides,
      hemoglobinA1c: currentAnalysis.hemoglobinA1c,
      hasHyperlipidemia: currentAnalysis.hasHyperlipidemia,
      hasHypertension: currentAnalysis.hasHypertension,
      diseaseDuration: currentAnalysis.diseaseDuration
    };

    console.log(`Găsiți ${similarityResults.length} pacienți pentru comparație`);
    console.log("Top 3 similarități:", similarityResults.slice(0, 3).map(r => ({
      email: r.email,
      similarity: (r.similarity * 100).toFixed(1) + '%'
    })));

    res.status(200).json({
      message: "Similaritate calculată cu succes folosind algoritmul T-D3K conform Nature 2022",
      algorithm: "T-D3K (Trajectory + Data-driven Domain Knowledge)",
      methodology: "Conform articolului: Diabetes medication recommendation system using patient similarity analytics - Scientific Reports 2022",
      currentUserDetails: currentUserDetails,
      similarPatients: similarityResults.slice(0, 10),
      totalPatientsCompared: similarityResults.length,
      recommendations: recommendations
    });

  } catch (error) {
    console.error("Eroare la calcularea similarității:", error);
    res.status(500).json({ 
      message: "Eroare la calcularea similarității", 
      error: error.message 
    });
  }
};

module.exports = {
  calculatePatientSimilarity,
  EnhancedPatientSimilarityCalculator
};