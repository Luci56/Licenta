
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config();
/**
 * Stabileste conexiunea cu baza de date MongoDB.
 * Utilizeaza configuratiile din variabilele de mediu pentru conectare.
 * 
 * @async
 * @function connectDB
 * @returns {Promise<void>} Promise care se rezolva la conectarea cu succes
 * @throws {Error} Opreste executia daca conexiunea esueaza
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

const analyzeDatabase = async () => {
  try {
    console.log('📊 Analyzing diabetes patient database...\n');

    const totalPatients = await User.countDocuments();
    console.log(`👥 Total Patients: ${totalPatients}`);

   
    const currentYear = new Date().getFullYear();
    const ageStats = await User.aggregate([
      {
        $project: {
          age: { $subtract: [currentYear, "$birthYear"] }
        }
      },
      {
        $group: {
          _id: null,
          avgAge: { $avg: "$age" },
          minAge: { $min: "$age" },
          maxAge: { $max: "$age" }
        }
      }
    ]);

    if (ageStats.length > 0) {
      console.log(`📈 Age Statistics:`);
      console.log(`   Average Age: ${Math.round(ageStats[0].avgAge)} years`);
      console.log(`   Age Range: ${ageStats[0].minAge} - ${ageStats[0].maxAge} years`);
    }

    
    const genderStats = await User.aggregate([
      {
        $group: {
          _id: "$gender",
          count: { $sum: 1 }
        }
      }
    ]);

    console.log(`\n👫 Gender Distribution:`);
    genderStats.forEach(stat => {
      const percentage = ((stat.count / totalPatients) * 100).toFixed(1);
      console.log(`   ${stat._id}: ${stat.count} (${percentage}%)`);
    });

    
    const hba1cStats = await User.aggregate([
      {
        $project: {
          latestHbA1c: { $arrayElemAt: ["$analysisData.hemoglobinA1c", -1] }
        }
      },
      {
        $match: {
          latestHbA1c: { $exists: true, $ne: null }
        }
      },
      {
        $group: {
          _id: null,
          avgHbA1c: { $avg: "$latestHbA1c" },
          minHbA1c: { $min: "$latestHbA1c" },
          maxHbA1c: { $max: "$latestHbA1c" },
          controlledCount: {
            $sum: { $cond: [{ $lte: ["$latestHbA1c", 7.0] }, 1, 0] }
          },
          poorControlCount: {
            $sum: { $cond: [{ $gte: ["$latestHbA1c", 9.0] }, 1, 0] }
          }
        }
      }
    ]);

    if (hba1cStats.length > 0) {
      const stats = hba1cStats[0];
      console.log(`\n🩸 HbA1c Statistics:`);
      console.log(`   Average HbA1c: ${stats.avgHbA1c.toFixed(1)}%`);
      console.log(`   Range: ${stats.minHbA1c.toFixed(1)}% - ${stats.maxHbA1c.toFixed(1)}%`);
      console.log(`   Well Controlled (<7.0%): ${stats.controlledCount} (${((stats.controlledCount/totalPatients)*100).toFixed(1)}%)`);
      console.log(`   Poorly Controlled (≥9.0%): ${stats.poorControlCount} (${((stats.poorControlCount/totalPatients)*100).toFixed(1)}%)`);
    }

    
    const medicationStats = await User.aggregate([
      {
        $group: {
          _id: null,
          metforminUsers: {
            $sum: { $cond: [{ $eq: ["$currentMedication.metformin.prescribed", true] }, 1, 0] }
          },
          insulinUsers: {
            $sum: { $cond: [{ $eq: ["$currentMedication.insulin.prescribed", true] }, 1, 0] }
          },
          sitagliptinUsers: {
            $sum: { $cond: [{ $eq: ["$currentMedication.sitagliptin.prescribed", true] }, 1, 0] }
          },
          empagliflozinUsers: {
            $sum: { $cond: [{ $eq: ["$currentMedication.empagliflozin.prescribed", true] }, 1, 0] }
          },
          dapagliflozinUsers: {
            $sum: { $cond: [{ $eq: ["$currentMedication.dapagliflozin.prescribed", true] }, 1, 0] }
          },
          gliclazideUsers: {
            $sum: { $cond: [{ $eq: ["$currentMedication.gliclazide.prescribed", true] }, 1, 0] }
          }
        }
      }
    ]);

    if (medicationStats.length > 0) {
      const stats = medicationStats[0];
      console.log(`\n💊 Medication Usage:`);
      console.log(`   Metformin: ${stats.metforminUsers} (${((stats.metforminUsers/totalPatients)*100).toFixed(1)}%)`);
      console.log(`   Insulin: ${stats.insulinUsers} (${((stats.insulinUsers/totalPatients)*100).toFixed(1)}%)`);
      console.log(`   Sitagliptin: ${stats.sitagliptinUsers} (${((stats.sitagliptinUsers/totalPatients)*100).toFixed(1)}%)`);
      console.log(`   Empagliflozin: ${stats.empagliflozinUsers} (${((stats.empagliflozinUsers/totalPatients)*100).toFixed(1)}%)`);
      console.log(`   Dapagliflozin: ${stats.dapagliflozinUsers} (${((stats.dapagliflozinUsers/totalPatients)*100).toFixed(1)}%)`);
      console.log(`   Gliclazide: ${stats.gliclazideUsers} (${((stats.gliclazideUsers/totalPatients)*100).toFixed(1)}%)`);
    }

    
    const comorbidityStats = await User.aggregate([
      {
        $project: {
          hasHypertension: { $arrayElemAt: ["$analysisData.hasHypertension", -1] },
          hasHyperlipidemia: { $arrayElemAt: ["$analysisData.hasHyperlipidemia", -1] },
          hasNephropathy: { $arrayElemAt: ["$analysisData.hasNephropathy", -1] },
          hasRetinopathy: { $arrayElemAt: ["$analysisData.hasRetinopathy", -1] },
          hasNeuropathy: { $arrayElemAt: ["$analysisData.hasNeuropathy", -1] }
        }
      },
      {
        $group: {
          _id: null,
          hypertension: { $sum: { $cond: [{ $eq: ["$hasHypertension", true] }, 1, 0] } },
          hyperlipidemia: { $sum: { $cond: [{ $eq: ["$hasHyperlipidemia", true] }, 1, 0] } },
          nephropathy: { $sum: { $cond: [{ $eq: ["$hasNephropathy", true] }, 1, 0] } },
          retinopathy: { $sum: { $cond: [{ $eq: ["$hasRetinopathy", true] }, 1, 0] } },
          neuropathy: { $sum: { $cond: [{ $eq: ["$hasNeuropathy", true] }, 1, 0] } }
        }
      }
    ]);

    if (comorbidityStats.length > 0) {
      const stats = comorbidityStats[0];
      console.log(`\n🏥 Comorbidities:`);
      console.log(`   Hypertension: ${stats.hypertension} (${((stats.hypertension/totalPatients)*100).toFixed(1)}%)`);
      console.log(`   Hyperlipidemia: ${stats.hyperlipidemia} (${((stats.hyperlipidemia/totalPatients)*100).toFixed(1)}%)`);
      console.log(`   Nephropathy: ${stats.nephropathy} (${((stats.nephropathy/totalPatients)*100).toFixed(1)}%)`);
      console.log(`   Retinopathy: ${stats.retinopathy} (${((stats.retinopathy/totalPatients)*100).toFixed(1)}%)`);
      console.log(`   Neuropathy: ${stats.neuropathy} (${((stats.neuropathy/totalPatients)*100).toFixed(1)}%)`);
    }

    
    const durationStats = await User.aggregate([
      {
        $project: {
          diseaseDuration: { $arrayElemAt: ["$analysisData.diseaseDuration", -1] }
        }
      },
      {
        $match: {
          diseaseDuration: { $exists: true, $ne: null }
        }
      },
      {
        $group: {
          _id: null,
          avgDuration: { $avg: "$diseaseDuration" },
          minDuration: { $min: "$diseaseDuration" },
          maxDuration: { $max: "$diseaseDuration" }
        }
      }
    ]);

    if (durationStats.length > 0) {
      const stats = durationStats[0];
      console.log(`\n⏱️  Disease Duration:`);
      console.log(`   Average: ${stats.avgDuration.toFixed(1)} years`);
      console.log(`   Range: ${stats.minDuration} - ${stats.maxDuration} years`);
    }

    
    const complexityStats = await User.aggregate([
      {
        $project: {
          medicationCount: {
            $add: [
              { $cond: [{ $eq: ["$currentMedication.metformin.prescribed", true] }, 1, 0] },
              { $cond: [{ $eq: ["$currentMedication.insulin.prescribed", true] }, 1, 0] },
              { $cond: [{ $eq: ["$currentMedication.sitagliptin.prescribed", true] }, 1, 0] },
              { $cond: [{ $eq: ["$currentMedication.empagliflozin.prescribed", true] }, 1, 0] },
              { $cond: [{ $eq: ["$currentMedication.dapagliflozin.prescribed", true] }, 1, 0] },
              { $cond: [{ $eq: ["$currentMedication.gliclazide.prescribed", true] }, 1, 0] },
              { $cond: [{ $eq: ["$currentMedication.vildagliptin.prescribed", true] }, 1, 0] },
              { $cond: [{ $eq: ["$currentMedication.linagliptin.prescribed", true] }, 1, 0] },
              { $cond: [{ $eq: ["$currentMedication.acarbose.prescribed", true] }, 1, 0] }
            ]
          }
        }
      },
      {
        $group: {
          _id: "$medicationCount",
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id": 1 }
      }
    ]);

    console.log(`\n💉 Medication Complexity (Number of Drugs):`);
    complexityStats.forEach(stat => {
      const percentage = ((stat.count / totalPatients) * 100).toFixed(1);
      console.log(`   ${stat._id} medication${stat._id !== 1 ? 's' : ''}: ${stat.count} patients (${percentage}%)`);
    });

    
    const goalStats = await User.aggregate([
      {
        $project: {
          latestHbA1c: { $arrayElemAt: ["$analysisData.hemoglobinA1c", -1] },
          targetHbA1c: "$currentMedication.treatmentGoals.targetHbA1c"
        }
      },
      {
        $match: {
          latestHbA1c: { $exists: true, $ne: null },
          targetHbA1c: { $exists: true, $ne: null }
        }
      },
      {
        $group: {
          _id: null,
          totalWithGoals: { $sum: 1 },
          achievedGoals: {
            $sum: {
              $cond: [
                { $lte: ["$latestHbA1c", { $add: ["$targetHbA1c", 0.5] }] },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    if (goalStats.length > 0) {
      const stats = goalStats[0];
      const achievementRate = ((stats.achievedGoals / stats.totalWithGoals) * 100).toFixed(1);
      console.log(`\n Treatment Goal Achievement:`);
      console.log(`   Patients at/near target: ${stats.achievedGoals}/${stats.totalWithGoals} (${achievementRate}%)`);
    }

    
    console.log(`\n👤 Sample Patient Profiles:`);
    const samplePatients = await User.find({})
      .limit(3)
      .select('email analysisData.hemoglobinA1c currentMedication.metformin currentMedication.insulin birthYear')
      .lean();

    samplePatients.forEach((patient, index) => {
      const age = new Date().getFullYear() - patient.birthYear;
      const hba1c = patient.analysisData?.[patient.analysisData.length - 1]?.hemoglobinA1c;
      const hasMetformin = patient.currentMedication?.metformin?.prescribed;
      const hasInsulin = patient.currentMedication?.insulin?.prescribed;
      
      console.log(`   Patient ${index + 1}: Age ${age}, HbA1c ${hba1c}%, Metformin: ${hasMetformin ? 'Yes' : 'No'}, Insulin: ${hasInsulin ? 'Yes' : 'No'}`);
    });

    console.log(`\n Database analysis complete!`);
    console.log(`\n🔗 API Endpoints Available:`);
    console.log(`   GET /api/similarity/calculate/:userId - Calculate patient similarity`);
    console.log(`   GET /api/medication/recommendations/:userId - Get medication recommendations`);
    console.log(`   GET /api/medication/statistics - Get medication statistics`);
    console.log(`   GET /api/users/:userId - Get user details`);

  } catch (error) {
    console.error(' Error analyzing database:', error);
  } finally {
    mongoose.connection.close();
  }
};

const main = async () => {
  try {
    await connectDB();
    await analyzeDatabase();
    process.exit(0);
  } catch (error) {
    console.error(' Script failed:', error);
    process.exit(1);
  }
};

main();