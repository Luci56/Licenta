const User = require("../models/User");
const EnhancedTD3KAlgorithm = require("../utils/EnhancedTD3KAlgorithm");

/**
 * Patient Similarity Calculator conform articol Nature 2022
 * "Diabetes medication recommendation system using patient similarity analytics"
 * Scientific Reports 12, 20910 (2022)
 * https://doi.org/10.1038/s41598-022-24494-x
 */

const calculatePatientSimilarity = async (req, res) => {
  try {
    const { userId } = req.params;
    
    console.log("=== DMRS T-D3K Algorithm Execution ===");
    console.log("Conform Nature 2022: https://doi.org/10.1038/s41598-022-24494-x");
    
    const td3kAlgorithm = new EnhancedTD3KAlgorithm();
    
    // Get target patient
    const targetPatient = await User.findById(userId);
    if (!targetPatient) {
      return res.status(404).json({ 
        message: "Target patient not found!",
        reference: "T-D3K Algorithm - Nature 2022"
      });
    }
    
    // Get target patient's latest analysis
    const targetAnalysis = td3kAlgorithm.getLatestAnalysisData(targetPatient);
    if (!targetAnalysis) {
      return res.status(400).json({ 
        message: "Target patient lacks analysis data required for T-D3K algorithm!",
        requiredData: [
          "systolicPressure", "diastolicPressure", 
          "cholesterolHDL", "cholesterolLDL", "triglycerides",
          "hemoglobinA1c", "hasHyperlipidemia", "hasHypertension",
          "diseaseDuration"
        ],
        reference: "T-D3K Algorithm - Nature 2022"
      });
    }

    // Get all other patients for comparison
    const allPatients = await User.find({ _id: { $ne: userId } });
    if (allPatients.length === 0) {
      return res.status(200).json({ 
        message: "No other patients available for similarity comparison!",
        targetPatientProfile: {
          patientGroup: td3kAlgorithm.classifyPatientGroup(targetAnalysis),
          hba1c: targetAnalysis.hemoglobinA1c,
          hba1cStatus: td3kAlgorithm.getHbA1cStatus(targetAnalysis.hemoglobinA1c)
        },
        similarPatients: [],
        recommendations: null,
        algorithm: "T-D3K (Trajectory + Data-driven Domain Knowledge)",
        reference: "Scientific Reports 12, 20910 (2022)"
      });
    }

    console.log(`Calculating T-D3K similarity for ${allPatients.length} patients...`);
    
    // Calculate T-D3K similarities
    const similarityResults = [];
    let patientsWithSufficientData = 0;
    
    for (const otherPatient of allPatients) {
      const otherAnalysis = td3kAlgorithm.getLatestAnalysisData(otherPatient);
      
      if (otherAnalysis) {
        patientsWithSufficientData++;
        
        // Calculate T-D3K similarity
        const td3kSimilarity = td3kAlgorithm.calculateTD3KSimilarity(
          targetPatient, 
          otherPatient
        );
        
        // Extract HbA1c trajectories for analysis
        const targetTrajectory = td3kAlgorithm.extractHbA1cTrajectory(targetPatient);
        const otherTrajectory = td3kAlgorithm.extractHbA1cTrajectory(otherPatient);
        
        similarityResults.push({
          userId: otherPatient._id,
          email: otherPatient.email,
          similarity: td3kSimilarity,
          patientGroup: td3kAlgorithm.classifyPatientGroup(otherAnalysis),
          trajectoryLength: otherTrajectory.length,
          details: {
            age: new Date().getFullYear() - otherPatient.birthYear,
            gender: otherPatient.gender,
            systolicPressure: otherAnalysis.systolicPressure,
            diastolicPressure: otherAnalysis.diastolicPressure,
            cholesterolHDL: otherAnalysis.cholesterolHDL,
            cholesterolLDL: otherAnalysis.cholesterolLDL,
            triglycerides: otherAnalysis.triglycerides,
            hemoglobinA1c: otherAnalysis.hemoglobinA1c,
            hasHyperlipidemia: otherAnalysis.hasHyperlipidemia,
            hasHypertension: otherAnalysis.hasHypertension,
            diseaseDuration: otherAnalysis.diseaseDuration,
            medicationCount: td3kAlgorithm.getDMMedicationCount(otherPatient.currentMedication),
            hba1cStatus: td3kAlgorithm.getHbA1cStatus(otherAnalysis.hemoglobinA1c),
            bloodSugar: getLatestBloodSugar(otherPatient)
          }
        });
      }
    }

    // Sort by T-D3K similarity (descending)
    similarityResults.sort((a, b) => b.similarity - a.similarity);
    
    // Filter patients with meaningful similarity (threshold: 0.1)
    const meaningfulSimilarities = similarityResults.filter(p => p.similarity > 0.1);
    
    console.log(`Found ${meaningfulSimilarities.length} patients with meaningful similarity (>0.1)`);
    
    // Generate medication recommendations using T-D3K
    const recommendations = meaningfulSimilarities.length > 0 
      ? td3kAlgorithm.generateMedicationRecommendations(
          meaningfulSimilarities, 
          targetPatient, 
          10 // K=10 conform articolului
        )
      : null;

    // Prepare target patient profile
    const targetPatientProfile = {
      age: new Date().getFullYear() - targetPatient.birthYear,
      gender: targetPatient.gender,
      patientGroup: td3kAlgorithm.classifyPatientGroup(targetAnalysis),
      systolicPressure: targetAnalysis.systolicPressure,
      diastolicPressure: targetAnalysis.diastolicPressure,
      cholesterolHDL: targetAnalysis.cholesterolHDL,
      cholesterolLDL: targetAnalysis.cholesterolLDL,
      triglycerides: targetAnalysis.triglycerides,
      hemoglobinA1c: targetAnalysis.hemoglobinA1c,
      hba1cStatus: td3kAlgorithm.getHbA1cStatus(targetAnalysis.hemoglobinA1c),
      hasHyperlipidemia: targetAnalysis.hasHyperlipidemia,
      hasHypertension: targetAnalysis.hasHypertension,
      diseaseDuration: targetAnalysis.diseaseDuration,
      medicationCount: td3kAlgorithm.getDMMedicationCount(targetPatient.currentMedication),
      hba1cTrajectoryLength: td3kAlgorithm.extractHbA1cTrajectory(targetPatient).length
    };

    // Performance metrics simulation conform articolului
    const expectedHitRatios = {
      'DM': 0.81,      // 81% conform articol
      'DM_HLD': 0.84,  // 84% conform articol
      'DM_HTN': 0.78,  // 78% conform articol
      'DHL': 0.75      // 75% conform articol
    };
    
    const patientGroup = targetPatientProfile.patientGroup;
    const expectedHitRatio = expectedHitRatios[patientGroup] || 0.795; // Average

    console.log("=== T-D3K Algorithm Results ===");
    console.log(`Target Patient Group: ${patientGroup}`);
    console.log(`Expected Hit Ratio: ${(expectedHitRatio * 100).toFixed(1)}%`);
    console.log(`Top 3 Similar Patients:`);
    meaningfulSimilarities.slice(0, 3).forEach((p, index) => {
      console.log(`  ${index + 1}. Similarity: ${(p.similarity * 100).toFixed(1)}% | HbA1c: ${p.details.hemoglobinA1c}% | Group: ${p.patientGroup}`);
    });

    res.status(200).json({
      success: true,
      message: "Patient similarity calculated successfully using T-D3K algorithm",
      algorithm: {
        name: "T-D3K (Trajectory + Data-driven Domain Knowledge)",
        components: [
          "D3K Similarity (Clinical profile with learned Mahalanobis weights)",
          "Trajectory Similarity (HbA1c patterns using n-grams and cosine similarity)"
        ],
        parameters: {
          nGramSize: td3kAlgorithm.nGramSize,
          trajectoryThreshold: td3kAlgorithm.trajectoryThreshold,
          alpha: td3kAlgorithm.alpha,
          beta: td3kAlgorithm.beta
        },
        reference: "Scientific Reports 12, 20910 (2022)",
        doi: "https://doi.org/10.1038/s41598-022-24494-x"
      },
      targetPatientProfile: targetPatientProfile,
      similarPatients: meaningfulSimilarities.slice(0, 20), // Top 20 for analysis
      totalPatientsAnalyzed: allPatients.length,
      patientsWithSufficientData: patientsWithSufficientData,
      meaningfulSimilarities: meaningfulSimilarities.length,
      recommendations: recommendations,
      expectedPerformance: {
        patientGroup: patientGroup,
        expectedHitRatio: `${(expectedHitRatio * 100).toFixed(1)}%`,
        expectedRecall: "94%",
        expectedPrecision: "95%",
        expectedMRR: "52%",
        note: "Performance metrics from original study (100 test patients per group)"
      },
      methodology: {
        step1: "Extract clinical profiles (12 normalized features)",
        step2: "Calculate D3K similarity using learned Mahalanobis weights",
        step3: "Map HbA1c trajectories to symbol sequences (N,A,U,D)",
        step4: "Generate 6-grams from trajectory sequences",
        step5: "Calculate trajectory similarity using cosine similarity",
        step6: "Combine: T-D3K = 0.5×D3K + 0.5×Trajectory",
        step7: "Rank similar patients and extract medication patterns",
        step8: "Apply clinical guidelines for final recommendations"
      }
    });

  } catch (error) {
    console.error("T-D3K Algorithm Error:", error);
    res.status(500).json({ 
      success: false,
      message: "Error calculating patient similarity using T-D3K algorithm", 
      error: error.message,
      algorithm: "T-D3K (Nature 2022)",
      reference: "Scientific Reports 12, 20910 (2022)"
    });
  }
};

/**
 * Get latest blood glucose reading
 */
const getLatestBloodSugar = (patient) => {
  if (!patient.dailyData || patient.dailyData.length === 0) return null;
  
  const sorted = [...patient.dailyData].sort((a, b) => 
    new Date(b.date) - new Date(a.date)
  );
  return sorted[0].bloodGlucose || sorted[0].bloodSugar;
};

/**
 * Batch evaluation for research purposes
 * Evaluates T-D3K algorithm performance on patient groups
 */
const evaluateTD3KPerformance = async (req, res) => {
  try {
    const { patientGroup = 'DM', sampleSize = 100 } = req.body;
    
    console.log(`=== T-D3K Performance Evaluation ===`);
    console.log(`Patient Group: ${patientGroup}`);
    console.log(`Sample Size: ${sampleSize}`);
    
    const td3kAlgorithm = new EnhancedTD3KAlgorithm();
    
    // Get patients from specified group with suboptimal HbA1c (≥8%)
    const groupFilter = {
      'DM': { 
        'analysisData.hasHyperlipidemia': { $ne: true },
        'analysisData.hasHypertension': { $ne: true }
      },
      'DM_HLD': { 'analysisData.hasHyperlipidemia': true },
      'DM_HTN': { 'analysisData.hasHypertension': true },
      'DHL': { 
        'analysisData.hasHyperlipidemia': true,
        'analysisData.hasHypertension': true 
      }
    };
    
    const testPatients = await User.find({
      ...groupFilter[patientGroup],
      'analysisData.hemoglobinA1c': { $gte: 8.0 }
    }).limit(sampleSize);
    
    if (testPatients.length === 0) {
      return res.status(404).json({
        message: `No patients found for group ${patientGroup} with HbA1c ≥ 8%`,
        algorithm: "T-D3K Evaluation"
      });
    }
    
    const results = {
      patientGroup: patientGroup,
      totalTestPatients: testPatients.length,
      hitRatios: [],
      recalls: [],
      precisions: [],
      mrrs: [],
      averageMetrics: {}
    };
    
    // Evaluate each test patient
    for (let i = 0; i < Math.min(testPatients.length, 10); i++) { // Limit for demo
      const testPatient = testPatients[i];
      const otherPatients = await User.find({ 
        _id: { $ne: testPatient._id }
      }).limit(100); // Limit database size for demo
      
      // Calculate similarities
      const similarities = [];
      for (const otherPatient of otherPatients) {
        const similarity = td3kAlgorithm.calculateTD3KSimilarity(testPatient, otherPatient);
        if (similarity > 0.1) {
          similarities.push({
            patient: otherPatient,
            similarity: similarity
          });
        }
      }
      
      similarities.sort((a, b) => b.similarity - a.similarity);
      
      // Generate recommendations
      const recommendations = td3kAlgorithm.generateMedicationRecommendations(
        similarities,
        testPatient,
        10
      );
      
      // Extract actual medications (ground truth)
      const actualMedications = td3kAlgorithm.extractPatientMedications({
        currentMedication: testPatient.currentMedication
      });
      
      // Calculate metrics
      if (recommendations && recommendations.recommendations) {
        const metrics = td3kAlgorithm.calculateEvaluationMetrics(
          recommendations.recommendations,
          actualMedications,
          10
        );
        
        results.hitRatios.push(metrics.hitRatio);
        results.recalls.push(metrics.recall);
        results.precisions.push(metrics.precision);
        results.mrrs.push(metrics.mrr);
      }
    }
    
    // Calculate averages
    if (results.hitRatios.length > 0) {
      results.averageMetrics = {
        hitRatio: (results.hitRatios.reduce((a, b) => a + b, 0) / results.hitRatios.length * 100).toFixed(1) + '%',
        recall: (results.recalls.reduce((a, b) => a + b, 0) / results.recalls.length).toFixed(3),
        precision: (results.precisions.reduce((a, b) => a + b, 0) / results.precisions.length).toFixed(3),
        mrr: (results.mrrs.reduce((a, b) => a + b, 0) / results.mrrs.length).toFixed(3)
      };
    }
    
    // Expected results from paper
    const expectedResults = {
      'DM': { hitRatio: '81%', recall: '0.95', precision: '0.95', mrr: '0.55' },
      'DM_HLD': { hitRatio: '84%', recall: '0.94', precision: '0.95', mrr: '0.53' },
      'DM_HTN': { hitRatio: '78%', recall: '0.93', precision: '0.95', mrr: '0.53' },
      'DHL': { hitRatio: '75%', recall: '0.94', precision: '0.96', mrr: '0.45' }
    };
    
    res.status(200).json({
      success: true,
      message: "T-D3K Algorithm performance evaluation completed",
      algorithm: "T-D3K (Nature 2022)",
      reference: "Scientific Reports 12, 20910 (2022)",
      results: results,
      expectedFromPaper: expectedResults[patientGroup],
      note: "This is a limited evaluation for demonstration. Full evaluation requires larger dataset and extended computation time.",
      methodology: "Conform Figure 1-4 from the original paper"
    });
    
  } catch (error) {
    console.error("T-D3K Evaluation Error:", error);
    res.status(500).json({
      success: false,
      message: "Error evaluating T-D3K algorithm performance",
      error: error.message
    });
  }
};

module.exports = {
  calculatePatientSimilarity,
  evaluateTD3KPerformance,
  EnhancedTD3KAlgorithm
};