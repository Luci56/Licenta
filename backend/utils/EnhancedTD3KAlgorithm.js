/**
 * Algoritm avansat T-D3K pentru calculul similaritatii pacientilor diabetici.
 * Implementeaza algoritmul conform articolului Nature 2022:
 * "Diabetes medication recommendation system using patient similarity analytics"
 * Scientific Reports 12, 20910 (2022) - https://doi.org/10.1038/s41598-022-24494-x
 * 
 * Combina similaritatea clinica D3K cu analiza traiectoriei temporale HbA1c
 * pentru recomandari de medicatie personalizate si precise.
 * 
 * @author Echipa DiabetCare
 * @version 1.0
 * @reference Scientific Reports 12, 20910 (2022)
 */

class EnhancedTD3KAlgorithm {
  constructor() {
    this.clinicalRanges = {
      age: { min: 21, max: 100 },
      systolicBP: { min: 80, max: 250 },
      diastolicBP: { min: 50, max: 150 },
      cholesterolHDL: { min: 0.5, max: 3.0 }, 
      cholesterolLDL: { min: 1.0, max: 5.0 }, 
      triglycerides: { min: 0.5, max: 10.0 }, 
      hba1c: { min: 4.0, max: 15.0 },
      diseaseDuration: { min: 0, max: 30 }
    };

    
    this.d3kWeights = {
      age: 0.0821,
      gender: 0.0543,
      systolicBP: 0.1187,
      diastolicBP: 0.0976,
      cholesterolHDL: 0.1045,
      cholesterolLDL: 0.1034,
      triglycerides: 0.0812,
      hba1c: 0.2456, 
      hasHLD: 0.0634,
      hasHTN: 0.0587,
      diseaseDuration: 0.1134,
      medicationCount: 0.0771
    };

    
    this.trajectoryThreshold = 0.5; 
    this.normalHbA1cRange = { min: 4.0, max: 7.0 }; 
    this.nGramSize = 6; 
    this.alpha = 0.5; 
    this.beta = 0.5;  

    /**
     * Clasele de medicamente diabetice conform Tabelului Suplementar S1.
     * Include toate medicamentele folosite in studiu cu dozele maxime
     * si nivelurile de intensitate (L=Low, M=Medium, H=High).
     */
    this.dmMedicationClasses = {
      // Biguanides
      'metformin': { 
        class: 'Biguanides', 
        maxDose: 3000,
        intensityLevels: { L: 1000, M: 2000, H: 3000 }
      },
      
      // Sulfonylureas
      'gliclazide': { 
        class: 'Sulfonylureas', 
        maxDose: 320,
        intensityLevels: { L: 107, M: 213, H: 320 }
      },
      'glipizide': { 
        class: 'Sulfonylureas', 
        maxDose: 30,
        intensityLevels: { L: 10, M: 20, H: 30 }
      },
      'tolbutamide': { 
        class: 'Sulfonylureas', 
        maxDose: 3000,
        intensityLevels: { L: 1000, M: 2000, H: 3000 }
      },

      // DPP-4 Inhibitors
      'sitagliptin': { 
        class: 'DPP-4 Inhibitors', 
        maxDose: 100,
        intensityLevels: { L: 33, M: 67, H: 100 }
      },
      'vildagliptin': { 
        class: 'DPP-4 Inhibitors', 
        maxDose: 100,
        intensityLevels: { L: 33, M: 67, H: 100 }
      },
      'linagliptin': { 
        class: 'DPP-4 Inhibitors', 
        maxDose: 5,
        intensityLevels: { L: 5, M: 5, H: 5 }
      },
      'saxagliptin': { 
        class: 'DPP-4 Inhibitors', 
        maxDose: 5,
        intensityLevels: { L: 2.5, M: 5, H: 5 }
      },

      // SGLT-2 Inhibitors
      'empagliflozin': { 
        class: 'SGLT-2 Inhibitors', 
        maxDose: 25,
        intensityLevels: { L: 8, M: 17, H: 25 }
      },
      'dapagliflozin': { 
        class: 'SGLT-2 Inhibitors', 
        maxDose: 10,
        intensityLevels: { L: 3, M: 7, H: 10 }
      },
      'canagliflozin': { 
        class: 'SGLT-2 Inhibitors', 
        maxDose: 300,
        intensityLevels: { L: 100, M: 200, H: 300 }
      },

      // Alpha-glucosidase Inhibitors
      'acarbose': { 
        class: 'Alpha-glucosidase Inhibitors', 
        maxDose: 300,
        intensityLevels: { L: 100, M: 200, H: 300 }
      },

      // Thiazolidinediones
      'pioglitazone': { 
        class: 'Thiazolidinediones', 
        maxDose: 45,
        intensityLevels: { L: 15, M: 30, H: 45 }
      },
      'rosiglitazone': { 
        class: 'Thiazolidinediones', 
        maxDose: 8,
        intensityLevels: { L: 3, M: 6, H: 8 }
      },

      // GLP-1 Receptor Agonists
      'exenatide': { 
        class: 'GLP-1 Agonists', 
        maxDose: 20,
        intensityLevels: { L: 5, M: 10, H: 20 }
      },
      'liraglutide': { 
        class: 'GLP-1 Agonists', 
        maxDose: 1.8,
        intensityLevels: { L: 0.6, M: 1.2, H: 1.8 }
      },

      // Meglitinides
      'repaglinide': { 
        class: 'Meglitinides', 
        maxDose: 16,
        intensityLevels: { L: 4, M: 8, H: 16 }
      },
      'nateglinide': { 
        class: 'Meglitinides', 
        maxDose: 540,
        intensityLevels: { L: 180, M: 360, H: 540 }
      },

      // Insulin (binary variable conform articolului)
      'insulin': { 
        class: 'Insulin', 
        binaryVariable: true
      }
    };

    // Patient groups conform articolului
    this.patientGroups = ['DM', 'DM_HLD', 'DM_HTN', 'DHL'];
  }

  /**
   * Min-Max normalization conform articolului
   */
  normalizeValue(value, min, max) {
    if (value === null || value === undefined) return 0.5;
    if (max === min) return 0.5;
    return Math.max(0, Math.min(1, (value - min) / (max - min)));
  }

  
  convertToMmolL(valueInMgDl, type) {
    const conversionFactors = {
      cholesterol: 0.02586, // mg/dL to mmol/L
      triglycerides: 0.01129 // mg/dL to mmol/L
    };
    return valueInMgDl * conversionFactors[type];
  }

  
  extractClinicalProfile(patient, analysisData) {
    const currentYear = new Date().getFullYear();
    const age = currentYear - patient.birthYear;
    const gender = patient.gender === "Masculin" ? 1 : 0;
    
   
    const hdlMmol = analysisData.cholesterolHDL > 10 
      ? this.convertToMmolL(analysisData.cholesterolHDL, 'cholesterol')
      : analysisData.cholesterolHDL || 1.2;
      
    const ldlMmol = analysisData.cholesterolLDL > 10 
      ? this.convertToMmolL(analysisData.cholesterolLDL, 'cholesterol')
      : analysisData.cholesterolLDL || 2.6;
      
    const trigMmol = analysisData.triglycerides > 10 
      ? this.convertToMmolL(analysisData.triglycerides, 'triglycerides')
      : analysisData.triglycerides || 1.7;

    const medicationCount = this.getDMMedicationCount(patient.currentMedication);
    
    return [
      this.normalizeValue(age, this.clinicalRanges.age.min, this.clinicalRanges.age.max),
      gender,
      this.normalizeValue(
        analysisData.systolicPressure || 130, 
        this.clinicalRanges.systolicBP.min, 
        this.clinicalRanges.systolicBP.max
      ),
      this.normalizeValue(
        analysisData.diastolicPressure || 80, 
        this.clinicalRanges.diastolicBP.min, 
        this.clinicalRanges.diastolicBP.max
      ),
      this.normalizeValue(hdlMmol, this.clinicalRanges.cholesterolHDL.min, this.clinicalRanges.cholesterolHDL.max),
      this.normalizeValue(ldlMmol, this.clinicalRanges.cholesterolLDL.min, this.clinicalRanges.cholesterolLDL.max),
      this.normalizeValue(trigMmol, this.clinicalRanges.triglycerides.min, this.clinicalRanges.triglycerides.max),
      this.normalizeValue(
        analysisData.hemoglobinA1c || 7.0, 
        this.clinicalRanges.hba1c.min, 
        this.clinicalRanges.hba1c.max
      ),
      analysisData.hasHyperlipidemia ? 1 : 0,
      analysisData.hasHypertension ? 1 : 0,
      this.normalizeValue(
        analysisData.diseaseDuration || (currentYear - patient.diagnosisYear), 
        this.clinicalRanges.diseaseDuration.min, 
        this.clinicalRanges.diseaseDuration.max
      ),
      this.normalizeValue(medicationCount, 0, 6) 
    ];
  }

  /**
 * Calculeaza numarul de medicamente diabetice prescrise conform articolului.
 * Numara doar medicamentele din clasele DM definite in studiu.
 * 
 * @param {Object} currentMedication - Obiectul cu medicamentele curente
 * @returns {number} Numarul medicamentelor DM prescrise (0-6)
 */
  getDMMedicationCount(currentMedication) {
    if (!currentMedication) return 0;
    
    let count = 0;
    Object.keys(this.dmMedicationClasses).forEach(med => {
      if (currentMedication[med] && currentMedication[med].prescribed) {
        count++;
      }
    });
    
    return count;
  }

  /**
 * Calculeaza similaritatea D3K folosind distanta Mahalanobis generalizata.
 * Implementeaza formula exacta din articol cu greutatile invatate.
 * 
 * @param {Array} profile1 - Profilul clinic primul pacient (vector normalizat)
 * @param {Array} profile2 - Profilul clinic al doilea pacient (vector normalizat)
 * @returns {number} Scorul de similaritate D3K intre 0 si 1
 * @throws {Error} Daca vectorii nu au aceeasi lungime
 * 
 * Formula: exp(-sqrt(sum(w_i * (x1_i - x2_i)^2)))
 * unde w_i sunt greutatile invatate pentru fiecare caracteristica
 */
  calculateD3KSimilarity(profile1, profile2) {
    if (profile1.length !== profile2.length) {
      throw new Error("Profile vectors must have the same length");
    }

    const weights = Object.values(this.d3kWeights);
    let weightedDistance = 0;
    
    for (let i = 0; i < profile1.length; i++) {
      const diff = profile1[i] - profile2[i];
      weightedDistance += weights[i] * (diff * diff);
    }
    
    const mahalanobisDistance = Math.sqrt(weightedDistance);
    
    
    return Math.exp(-mahalanobisDistance);
  }

  /**
 * Mapeaza traiectoria HbA1c in categorii discrete conform articolului.
 * Analizeaza evolutia temporala a HbA1c si o clasifica in tipare.
 * 
 * @param {Array} hba1cValues - Valorile HbA1c ordonate cronologic
 * @returns {string} Tiparul traiectoriei: "N"(Normal), "A"(Abnormal), 
 *                   "U"(Uptrend), "D"(Downtrend) sau combinatii
 * 
 * Algoritm:
 * - N: diferenta <= 0.5% (threshold τ)
 * - A: diferenta > 0.5%
 * - U: trend crescator sustinut
 * - D: trend descrescator sustinut
 */
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
    if (!trajectory || trajectory.length === 0) return [];
    if (trajectory.length < n) return [trajectory];
    
    const nGrams = [];
    for (let i = 0; i <= trajectory.length - n; i++) {
      nGrams.push(trajectory.substring(i, i + n));
    }
    return nGrams;
  }

  /**
 * Calculeaza similaritatea traiectoriei folosind n-grame si cosinus.
 * Implementeaza algoritmul de comparare a tiparelor temporale HbA1c.
 * 
 * @param {string} trajectory1 - Tiparul traiectoriei primul pacient
 * @param {string} trajectory2 - Tiparul traiectoriei al doilea pacient
 * @returns {number} Scorul de similaritate a traiectoriei intre 0 si 1
 * 
 * Metoda:
 * 1. Genereaza n-grame (n=6) din fiecare traiectorie
 * 2. Creeaza vectori de frecventa pentru n-grame
 * 3. Calculeaza similaritatea cosinus intre vectori
 */
  calculateTrajectorySimilarity(trajectory1, trajectory2) {
    const nGrams1 = this.generateNGrams(trajectory1);
    const nGrams2 = this.generateNGrams(trajectory2);
    
    if (nGrams1.length === 0 && nGrams2.length === 0) return 1.0;
    if (nGrams1.length === 0 || nGrams2.length === 0) return 0.0;
    
    
    const allNGrams = new Set([...nGrams1, ...nGrams2]);
    const vocabulary = Array.from(allNGrams);
    
    
    const vector1 = vocabulary.map(ngram => 
      nGrams1.filter(t => t === ngram).length
    );
    const vector2 = vocabulary.map(ngram => 
      nGrams2.filter(t => t === ngram).length
    );
    
    
    const dotProduct = vector1.reduce((sum, v1, i) => sum + v1 * vector2[i], 0);
    const magnitude1 = Math.sqrt(vector1.reduce((sum, v) => sum + v * v, 0));
    const magnitude2 = Math.sqrt(vector2.reduce((sum, v) => sum + v * v, 0));
    
    if (magnitude1 === 0 || magnitude2 === 0) return 0.0;
    
    return dotProduct / (magnitude1 * magnitude2);
  }

  
  calculateTD3KSimilarity(currentPatient, otherPatient) {
    const currentAnalysis = this.getLatestAnalysisData(currentPatient);
    const otherAnalysis = this.getLatestAnalysisData(otherPatient);
    
    if (!currentAnalysis || !otherAnalysis) {
      return 0.0;
    }

    
    const currentProfile = this.extractClinicalProfile(currentPatient, currentAnalysis);
    const otherProfile = this.extractClinicalProfile(otherPatient, otherAnalysis);
    const d3kSimilarity = this.calculateD3KSimilarity(currentProfile, otherProfile);

    
    const currentHbA1cValues = this.extractHbA1cTrajectory(currentPatient);
    const otherHbA1cValues = this.extractHbA1cTrajectory(otherPatient);
    
    let trajectorySimilarity = 0.5; 
    
    if (currentHbA1cValues.length >= 2 && otherHbA1cValues.length >= 2) {
      const currentTrajectory = this.mapHbA1cTrajectory(currentHbA1cValues);
      const otherTrajectory = this.mapHbA1cTrajectory(otherHbA1cValues);
      
      trajectorySimilarity = this.calculateTrajectorySimilarity(
        currentTrajectory, 
        otherTrajectory
      );
    }

    
    return this.alpha * d3kSimilarity + this.beta * trajectorySimilarity;
  }

  
  extractHbA1cTrajectory(patient) {
    if (!patient.analysisData || !Array.isArray(patient.analysisData)) {
      return [];
    }
    
    return patient.analysisData
      .filter(data => data.hemoglobinA1c && data.hemoglobinA1c > 0)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map(data => data.hemoglobinA1c);
  }

  
  getLatestAnalysisData(patient) {
    if (!patient.analysisData) return null;
    
    if (Array.isArray(patient.analysisData)) {
      if (patient.analysisData.length === 0) return null;
      const sorted = [...patient.analysisData].sort((a, b) => 
        new Date(b.date) - new Date(a.date)
      );
      return sorted[0];
    } else {
      return patient.analysisData;
    }
  }

 /**
 * Clasifica pacientul in grupe conform articolului.
 * Determina categoria bazata pe comorbiditati pentru recomandari tintite.
 * 
 * @param {Object} analysisData - Datele de analiza pentru clasificare
 * @returns {string} Grupa pacientului: "DM", "DM_HLD", "DM_HTN", "DHL"
 * 
 * Clasificare:
 * - DM: doar diabet
 * - DM_HLD: diabet + hiperlipidemia  
 * - DM_HTN: diabet + hipertensiune
 * - DHL: diabet + hiperlipidemia + hipertensiune
 */
  classifyPatientGroup(analysisData) {
    const hasHLD = analysisData.hasHyperlipidemia || false;
    const hasHTN = analysisData.hasHypertension || false;
    
    if (hasHLD && hasHTN) return 'DHL'; // Diabetes + HLD + HTN
    if (hasHLD) return 'DM_HLD';        // Diabetes + HLD
    if (hasHTN) return 'DM_HTN';        // Diabetes + HTN
    return 'DM';                        // Diabetes only
  }

  
  generateMedicationRecommendations(similarPatients, targetPatient, k = 10) {
    if (!similarPatients || similarPatients.length === 0) {
      return null;
    }

    const targetAnalysis = this.getLatestAnalysisData(targetPatient);
    if (!targetAnalysis) return null;

    const patientGroup = this.classifyPatientGroup(targetAnalysis);
    const targetHbA1c = targetAnalysis.hemoglobinA1c;
    
    
    const topSimilarPatients = similarPatients.slice(0, k);
    
    
    const medicationCandidates = this.extractMedicationCandidates(topSimilarPatients);
    
    
    const rankedRecommendations = this.rankMedicationRecommendations(
      medicationCandidates, 
      targetPatient,
      targetHbA1c,
      patientGroup
    );

    return {
      patientGroup: patientGroup,
      targetHbA1c: targetHbA1c,
      targetHbA1cStatus: this.getHbA1cStatus(targetHbA1c),
      recommendations: rankedRecommendations,
      basedOnPatients: topSimilarPatients.length,
      methodology: "T-D3K Algorithm (Trajectory + Data-driven Domain Knowledge)",
      reference: "Scientific Reports 12, 20910 (2022)"
    };
  }

  /**
 * Extrage candidatii de medicatie din pacientii similari.
 * Agrrega medicamentele utilizate cu frecventele si scorurile de similaritate.
 * 
 * @param {Array} similarPatients - Lista pacientilor similari
 * @returns {Array} Lista candidatilor de medicatie cu metrici
 */
  extractMedicationCandidates(similarPatients) {
    const candidates = new Map();
    
    similarPatients.forEach(patient => {
      const medications = this.extractPatientMedications(patient);
      medications.forEach(med => {
        const key = `${med.medication}_${med.intensity}`;
        if (!candidates.has(key)) {
          candidates.set(key, {
            medication: med.medication,
            class: med.class,
            intensity: med.intensity,
            dosage: med.dosage,
            count: 0,
            totalSimilarity: 0
          });
        }
        
        const candidate = candidates.get(key);
        candidate.count += 1;
        candidate.totalSimilarity += patient.similarity;
      });
    });
    
    return Array.from(candidates.values());
  }

  /**
 * Extrage medicamentele prescrise unui pacient individual.
 * Converteste schema de medicatie in format standardizat.
 * 
 * @param {Object} patient - Pacientul pentru extragerea medicamentelor
 * @returns {Array} Lista medicamentelor prescrise cu detalii
 */
  extractPatientMedications(patient) {
    const medications = [];
    const currentMedication = patient.user?.currentMedication || patient.currentMedication;
    
    if (!currentMedication) return medications;
    
    Object.keys(this.dmMedicationClasses).forEach(medName => {
      if (currentMedication[medName] && currentMedication[medName].prescribed) {
        const medInfo = this.dmMedicationClasses[medName];
        const intensity = currentMedication[medName].intensity || 'M';
        
        medications.push({
          medication: medName,
          class: medInfo.class,
          intensity: intensity,
          dosage: medInfo.binaryVariable ? 'Binary' : medInfo.intensityLevels[intensity]
        });
      }
    });
    
    return medications;
  }

  
  rankMedicationRecommendations(candidates, targetPatient, targetHbA1c, patientGroup) {
    
    candidates.forEach(candidate => {
      candidate.averageSimilarity = candidate.totalSimilarity / candidate.count;
      candidate.score = candidate.count * 0.7 + candidate.averageSimilarity * 0.3;
    });
    
    candidates.sort((a, b) => b.score - a.score);
    
    
    const recommendations = this.applyClinicalGuidelines(
      candidates, 
      targetHbA1c, 
      patientGroup
    );
    
    return recommendations.slice(0, 10); 
  }

  
  applyClinicalGuidelines(candidates, targetHbA1c, patientGroup) {
    const recommendations = [];
    
    
    const metforminCandidates = candidates.filter(c => c.medication === 'metformin');
    if (metforminCandidates.length > 0) {
      recommendations.push({
        ...metforminCandidates[0],
        line: 'First-line',
        rationale: 'First-line therapy for T2DM (ADA/EASD Guidelines)',
        evidenceLevel: 'A'
      });
    }
    
    
    const secondLinePreferences = this.getSecondLinePreferences(patientGroup, targetHbA1c);
    
    secondLinePreferences.forEach(prefMed => {
      const candidate = candidates.find(c => 
        c.medication === prefMed && c.medication !== 'metformin'
      );
      if (candidate) {
        recommendations.push({
          ...candidate,
          line: 'Second-line',
          rationale: this.getSecondLineRationale(prefMed, patientGroup),
          evidenceLevel: 'A'
        });
      }
    });
    
    
    candidates.forEach(candidate => {
      if (!recommendations.find(r => r.medication === candidate.medication)) {
        recommendations.push({
          ...candidate,
          line: 'Alternative',
          rationale: 'Based on similar patient outcomes',
          evidenceLevel: 'B'
        });
      }
    });
    
    return recommendations;
  }

 
  getSecondLinePreferences(patientGroup, hba1c) {
    const preferences = {
      'DM': ['sitagliptin', 'empagliflozin', 'gliclazide'],
      'DM_HLD': ['empagliflozin', 'sitagliptin', 'pioglitazone'],
      'DM_HTN': ['empagliflozin', 'dapagliflozin', 'sitagliptin'],
      'DHL': ['empagliflozin', 'dapagliflozin']
    };
    
   
    if (hba1c >= 10.0) {
      preferences[patientGroup].unshift('insulin');
    }
    
    return preferences[patientGroup] || preferences['DM'];
  }

  
  getSecondLineRationale(medication, patientGroup) {
    const rationales = {
      'empagliflozin': 'SGLT-2 inhibitor with cardiovascular benefits',
      'dapagliflozin': 'SGLT-2 inhibitor with renal and cardiovascular benefits',
      'sitagliptin': 'DPP-4 inhibitor with low hypoglycemia risk',
      'pioglitazone': 'Thiazolidinedione improving insulin sensitivity',
      'gliclazide': 'Sulfonylurea with established efficacy',
      'insulin': 'Required for severe hyperglycemia (HbA1c ≥10%)'
    };
    
    return rationales[medication] || 'Based on similar patient outcomes';
  }

 
  getHbA1cStatus(hba1c) {
    if (hba1c < 7.0) return 'Well-controlled';
    if (hba1c < 8.0) return 'Moderately controlled';
    if (hba1c < 9.0) return 'Suboptimal control';
    return 'Poor control';
  }

  
  calculateEvaluationMetrics(recommendations, actualMedications, k = 10) {
   
    const hasExactMatch = recommendations.some(rec => 
      actualMedications.some(actual => 
        actual.medication === rec.medication && 
        actual.intensity === rec.intensity
      )
    );
    
    const hitRatio = hasExactMatch ? 1 : 0;
    
   
    const matches = recommendations.filter(rec => 
      actualMedications.some(actual => actual.medication === rec.medication)
    );
    
    const recall = actualMedications.length > 0 ? matches.length / actualMedications.length : 0;
    const precision = recommendations.length > 0 ? matches.length / recommendations.length : 0;
    
    
    let mrr = 0;
    for (let i = 0; i < recommendations.length; i++) {
      if (actualMedications.some(actual => actual.medication === recommendations[i].medication)) {
        mrr = 1 / (i + 1);
        break;
      }
    }
    
    return {
      hitRatio,
      recall,
      precision,
      mrr,
      matches: matches.length,
      totalRecommendations: recommendations.length,
      totalActual: actualMedications.length
    };
  }
}

module.exports = EnhancedTD3KAlgorithm;