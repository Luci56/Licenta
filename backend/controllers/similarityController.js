const User = require("../models/User");

/**
 * Enhanced Patient Similarity Calculator
 * Based on the research paper: "Diabetes medication recommendation system using patient similarity analytics"
 * Published in Scientific Reports 2022
 * 
 * This implementation uses:
 * 1. Data-driven and Domain Knowledge (D3K) similarity measure
 * 2. Mahalanobis distance for better clinical dissimilarity measurement
 * 3. HbA1c trajectory analysis (T-D3K approach)
 * 4. Weighted similarity based on medical importance
 */

class EnhancedPatientSimilarityCalculator {
  constructor() {
    // Medical parameter ranges based on clinical guidelines from the research
    this.ranges = {
      age: { min: 21, max: 100 },
      systolicPressure: { min: 80, max: 250 },
      diastolicPressure: { min: 50, max: 150 },
      cholesterolHDL: { min: 15, max: 150 },
      cholesterolLDL: { min: 50, max: 200 },
      hemoglobinA1c: { min: 4.0, max: 20.0 },
      diseaseDuration: { min: 0, max: 80 }
    };

    // Enhanced weights based on clinical importance from research
    // HbA1c has highest weight as it's the primary diabetes control indicator
    this.clinicalWeights = {
      age: 0.05,
      gender: 0.05,
      systolicPressure: 0.10,
      diastolicPressure: 0.08,
      cholesterolHDL: 0.08,
      cholesterolLDL: 0.08,
      hemoglobinA1c: 0.30,  // Highest weight - primary diabetes indicator
      hasHyperlipidemia: 0.08,
      hasHypertension: 0.08,
      diseaseDuration: 0.10   // Important for disease progression
    };

    // HbA1c trajectory threshold for determining significant changes
    this.hba1cThreshold = 0.3; // 0.3% change considered significant
    
    // Normal HbA1c range for trajectory analysis
    this.normalHbA1cRange = { min: 4.0, max: 7.0 };
  }

  /**
   * Normalize value using min-max scaling
   * @param {number} value - Value to normalize
   * @param {number} min - Minimum value in range
   * @param {number} max - Maximum value in range
   * @returns {number} Normalized value between 0 and 1
   */
  normalizeValue(value, min, max) {
    if (max === min) return 0.5; // Avoid division by zero
    return Math.max(0, Math.min(1, (value - min) / (max - min)));
  }

  /**
   * Calculate Mahalanobis distance-inspired weighted similarity
   * This is a simplified version since we don't have the full covariance matrix
   * @param {Array} vector1 - First patient's feature vector
   * @param {Array} vector2 - Second patient's feature vector
   * @param {Array} weights - Feature weights
   * @returns {number} Weighted distance
   */
  calculateWeightedDistance(vector1, vector2, weights) {
    if (vector1.length !== vector2.length || vector1.length !== weights.length) {
      throw new Error("Vectors and weights must have the same length");
    }

    let distance = 0;
    for (let i = 0; i < vector1.length; i++) {
      const diff = vector1[i] - vector2[i];
      // Apply weight to the squared difference (simplified Mahalanobis approach)
      distance += weights[i] * (diff * diff);
    }
    
    return Math.sqrt(distance);
  }

  /**
   * Map HbA1c trajectory to symbolic representation
   * Based on the paper's approach: N=Normal, A=Abnormal, U=Increasing, D=Decreasing
   * @param {Array} hba1cValues - Array of HbA1c values over time
   * @returns {string} Symbolic trajectory representation
   */
  mapHbA1cTrajectory(hba1cValues) {
    if (!hba1cValues || hba1cValues.length < 2) {
      return "N"; // Default for insufficient data
    }

    let trajectory = "";
    
    for (let i = 0; i < hba1cValues.length - 1; i++) {
      const v1 = hba1cValues[i];
      const v2 = hba1cValues[i + 1];
      const difference = Math.abs(v2 - v1);
      
      if (difference <= this.hba1cThreshold) {
        // Small change - classify as Normal or Abnormal based on range
        if (v1 >= this.normalHbA1cRange.min && v1 <= this.normalHbA1cRange.max) {
          trajectory += "N";
        } else {
          trajectory += "A";
        }
      } else {
        // Significant change - classify as Increasing or Decreasing
        if (v2 > v1) {
          trajectory += "U"; // Uptrend
        } else {
          trajectory += "D"; // Downtrend
        }
      }
    }
    
    return trajectory;
  }

  /**
   * Generate n-grams from trajectory string
   * @param {string} trajectory - Symbolic trajectory
   * @param {number} n - N-gram size (default 6 as per paper)
   * @returns {Array} Array of n-grams
   */
  generateNGrams(trajectory, n = 6) {
    if (trajectory.length < n) {
      return [trajectory]; // Return the whole string if shorter than n
    }
    
    const nGrams = [];
    for (let i = 0; i <= trajectory.length - n; i++) {
      nGrams.push(trajectory.substring(i, i + n));
    }
    return nGrams;
  }

  /**
   * Calculate trajectory similarity using cosine similarity
   * @param {Array} trajectory1 - First patient's trajectory n-grams
   * @param {Array} trajectory2 - Second patient's trajectory n-grams
   * @returns {number} Trajectory similarity score (0-1)
   */
  calculateTrajectorySimilarity(trajectory1, trajectory2) {
    // Create vocabulary of all unique n-grams
    const allNGrams = new Set([...trajectory1, ...trajectory2]);
    const vocab = Array.from(allNGrams);
    
    // Create frequency vectors
    const vector1 = vocab.map(ngram => trajectory1.filter(t => t === ngram).length);
    const vector2 = vocab.map(ngram => trajectory2.filter(t => t === ngram).length);
    
    // Calculate cosine similarity
    const dotProduct = vector1.reduce((sum, v1, i) => sum + v1 * vector2[i], 0);
    const magnitude1 = Math.sqrt(vector1.reduce((sum, v) => sum + v * v, 0));
    const magnitude2 = Math.sqrt(vector2.reduce((sum, v) => sum + v * v, 0));
    
    if (magnitude1 === 0 || magnitude2 === 0) {
      return 0;
    }
    
    return dotProduct / (magnitude1 * magnitude2);
  }

  /**
   * Extract clinical profile vector from user data
   * @param {Object} userData - User data object
   * @param {Object} analysisData - User's analysis data
   * @returns {Array} Normalized clinical profile vector
   */
  extractClinicalProfile(userData, analysisData) {
    const currentYear = new Date().getFullYear();
    const age = currentYear - userData.birthYear;
    const genderValue = userData.gender === "Masculin" ? 1 : 0;
    
    return [
      this.normalizeValue(age, this.ranges.age.min, this.ranges.age.max),
      genderValue, // Binary: 1 for male, 0 for female
      this.normalizeValue(
        analysisData.systolicPressure || 120, 
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
      )
    ];
  }

  /**
   * Calculate D3K (Data-driven and Domain Knowledge) similarity
   * @param {Array} profile1 - First patient's clinical profile
   * @param {Array} profile2 - Second patient's clinical profile
   * @returns {number} D3K similarity score (0-1)
   */
  calculateD3KSimilarity(profile1, profile2) {
    const weights = Object.values(this.clinicalWeights);
    const distance = this.calculateWeightedDistance(profile1, profile2, weights);
    
    // Convert distance to similarity (higher distance = lower similarity)
    // Using exponential decay for better discrimination
    return Math.exp(-distance);
  }

  /**
   * Calculate combined T-D3K (Trajectory + D3K) similarity
   * @param {Object} currentUser - Current user data
   * @param {Object} otherUser - Other user data for comparison
   * @returns {number} Combined similarity score (0-1)
   */
  calculateTD3KSimilarity(currentUser, otherUser) {
    // Get latest analysis data
    const currentAnalysis = this.getLatestAnalysisData(currentUser);
    const otherAnalysis = this.getLatestAnalysisData(otherUser);
    
    if (!currentAnalysis || !otherAnalysis) {
      return 0; // Cannot compare without analysis data
    }

    // Calculate D3K similarity based on clinical profiles
    const currentProfile = this.extractClinicalProfile(currentUser, currentAnalysis);
    const otherProfile = this.extractClinicalProfile(otherUser, otherAnalysis);
    const d3kSimilarity = this.calculateD3KSimilarity(currentProfile, otherProfile);

    // Calculate trajectory similarity if enough HbA1c data exists
    let trajectorySimilarity = 0.5; // Default neutral similarity
    
    if (currentUser.dailyData && otherUser.dailyData) {
      // Extract HbA1c values from analysis data over time
      const currentHbA1cValues = this.extractHbA1cTrajectory(currentUser);
      const otherHbA1cValues = this.extractHbA1cTrajectory(otherUser);
      
      if (currentHbA1cValues.length >= 2 && otherHbA1cValues.length >= 2) {
        const currentTrajectory = this.mapHbA1cTrajectory(currentHbA1cValues);
        const otherTrajectory = this.mapHbA1cTrajectory(otherHbA1cValues);
        
        const currentNGrams = this.generateNGrams(currentTrajectory);
        const otherNGrams = this.generateNGrams(otherTrajectory);
        
        trajectorySimilarity = this.calculateTrajectorySimilarity(currentNGrams, otherNGrams);
      }
    }

    // Combine D3K and trajectory similarities (equal weights as per paper)
    const alpha = 0.5; // Weight for D3K similarity
    const beta = 0.5;  // Weight for trajectory similarity
    
    return alpha * d3kSimilarity + beta * trajectorySimilarity;
  }

  /**
   * Extract HbA1c trajectory from user's analysis data
   * @param {Object} user - User data
   * @returns {Array} Array of HbA1c values over time
   */
  extractHbA1cTrajectory(user) {
    if (!user.analysisData || !Array.isArray(user.analysisData)) {
      return [];
    }
    
    // Sort by date and extract HbA1c values
    return user.analysisData
      .filter(data => data.hemoglobinA1c)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map(data => data.hemoglobinA1c);
  }

  /**
   * Get latest analysis data from user
   * @param {Object} user - User data
   * @returns {Object|null} Latest analysis data
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
   * Get latest blood sugar value from user's daily data
   * @param {Object} user - User data
   * @returns {number|null} Latest blood sugar value
   */
  getLatestBloodSugar(user) {
    if (!user.dailyData || user.dailyData.length === 0) return null;
    
    const sorted = [...user.dailyData].sort((a, b) => 
      new Date(b.date) - new Date(a.date)
    );
    return sorted[0].bloodGlucose || sorted[0].bloodSugar;
  }
}

/**
 * Enhanced similarity calculation function for the API
 */
const calculatePatientSimilarity = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Initialize the enhanced calculator
    const calculator = new EnhancedPatientSimilarityCalculator();
    
    // Get current user
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({ message: "Utilizatorul nu a fost găsit!" });
    }
    
    // Get all other users
    const allUsers = await User.find({ _id: { $ne: userId } });
    if (allUsers.length === 0) {
      return res.status(200).json({ 
        message: "Nu există alți utilizatori pentru comparație!", 
        currentUserDetails: {}, 
        similarPatients: [] 
      });
    }

    // Get current user's latest analysis data
    const currentAnalysis = calculator.getLatestAnalysisData(currentUser);
    if (!currentAnalysis) {
      return res.status(400).json({ 
        message: "Utilizatorul curent nu are date de analiză!" 
      });
    }

    console.log("Calculez similaritatea folosind algoritmul T-D3K îmbunătățit...");

    // Calculate similarities with all other users
    const similarityResults = [];
    
    for (const otherUser of allUsers) {
      const otherAnalysis = calculator.getLatestAnalysisData(otherUser);
      
      if (otherAnalysis) {
        // Calculate T-D3K similarity
        const similarity = calculator.calculateTD3KSimilarity(currentUser, otherUser);
        
        // Get latest blood sugar for the other user
        const latestBloodSugar = calculator.getLatestBloodSugar(otherUser);
        
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
            hemoglobinA1c: otherAnalysis.hemoglobinA1c,
            hasHyperlipidemia: otherAnalysis.hasHyperlipidemia,
            hasHypertension: otherAnalysis.hasHypertension,
            diseaseDuration: otherAnalysis.diseaseDuration,
            bloodSugar: latestBloodSugar
          }
        });
      }
    }

    // Sort by similarity (descending)
    similarityResults.sort((a, b) => b.similarity - a.similarity);

    // Prepare current user details for response
    const currentUserDetails = {
      age: new Date().getFullYear() - currentUser.birthYear,
      gender: currentUser.gender,
      systolicPressure: currentAnalysis.systolicPressure,
      diastolicPressure: currentAnalysis.diastolicPressure,
      cholesterolHDL: currentAnalysis.cholesterolHDL,
      cholesterolLDL: currentAnalysis.cholesterolLDL,
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

    // Return top 10 similar patients
    res.status(200).json({
      message: "Similaritate calculată cu succes folosind algoritmul T-D3K îmbunătățit",
      algorithm: "T-D3K (Trajectory + Data-driven Domain Knowledge)",
      currentUserDetails: currentUserDetails,
      similarPatients: similarityResults.slice(0, 10),
      totalPatientsCompared: similarityResults.length
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