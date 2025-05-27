const mongoose = require("mongoose");

// Schema pentru medicamentație
const medicationSchema = {
  // Biguanides
  metformin: {
    prescribed: { type: Boolean, default: false },
    dosage: { type: Number, min: 0, max: 3000 }, // mg/day
    intensity: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' }
  },

  // Sulfonylureas
  gliclazide: {
    prescribed: { type: Boolean, default: false },
    dosage: { type: Number, min: 0, max: 320 },
    intensity: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' }
  },
  glipizide: {
    prescribed: { type: Boolean, default: false },
    dosage: { type: Number, min: 0, max: 30 },
    intensity: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' }
  },

  // DPP-4 inhibitors
  sitagliptin: {
    prescribed: { type: Boolean, default: false },
    dosage: { type: Number, min: 0, max: 100 },
    intensity: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' }
  },
  vildagliptin: {
    prescribed: { type: Boolean, default: false },
    dosage: { type: Number, min: 0, max: 100 },
    intensity: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' }
  },
  linagliptin: {
    prescribed: { type: Boolean, default: false },
    dosage: { type: Number, default: 5 }, // Fixed dose
    intensity: { type: String, enum: ['medium'], default: 'medium' }
  },

  // SGLT-2 inhibitors
  empagliflozin: {
    prescribed: { type: Boolean, default: false },
    dosage: { type: Number, min: 0, max: 25 },
    intensity: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' }
  },
  dapagliflozin: {
    prescribed: { type: Boolean, default: false },
    dosage: { type: Number, min: 0, max: 25 },
    intensity: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' }
  },

  // Alpha-glucosidase inhibitors
  acarbose: {
    prescribed: { type: Boolean, default: false },
    dosage: { type: Number, min: 0, max: 300 },
    intensity: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' }
  },

  // Insulin (binary variable)
  insulin: {
    prescribed: { type: Boolean, default: false },
    type: { type: String, enum: ['actrapid', 'apidra', 'insulatard', 'lantus', 'levemir', 'mixtard', 'novomix', 'novorapid'] },
    units_per_day: { type: Number, min: 0, max: 100 }
  },

  // Additional information
  treatmentStartDate: { type: Date, default: Date.now },
  lastMedicationReview: { type: Date, default: Date.now },
  adherenceScore: { type: Number, min: 0, max: 100, default: 85 }, // % compliance
  sideEffects: [{ type: String }], // Array of reported side effects
  treatmentGoals: {
    targetHbA1c: { type: Number, min: 4.0, max: 10.0, default: 7.0 },
    targetFastingGlucose: { type: Number, min: 80, max: 130, default: 100 },
    achieved: { type: Boolean, default: false }
  }
};

// Schema extinsă pentru utilizatori
const userSchema = mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    birthYear: {
      type: Number,
      required: true,
    },
    gender: {
      type: String,
      enum: ["Masculin", "Feminin"],
      required: true,
    },
    height: {
      type: Number,
      required: true,
      min: 100,
      max: 250,
    },
    weight: {
      type: Number,
      min: 30,
      max: 200, // kg
    },
    diagnosisYear: {
      type: Number,
      required: true,
    },

    // Date pentru monitorizare zilnică (glicemia)
    dailyData: [
      {
        date: {
          type: Date,
          default: Date.now,
        },
        bloodGlucose: {
          type: Number,
          required: true,
          min: 50,
          max: 400,
        },
        postMealGlucose: {
          type: Number,
          min: 50,
          max: 400,
        },
        timeOfDay: {
          type: String,
          enum: ['fasting', 'postbreakfast', 'prelunch', 'postlunch', 'predinner', 'postdinner', 'bedtime'],
          default: 'fasting'
        }
      },
    ],

    // Date pentru analize periodice
    analysisData: [
      {
        date: {
          type: Date,
          default: Date.now,
        },
        systolicPressure: {
          type: Number,
          min: 80,
          max: 250,
        },
        diastolicPressure: {
          type: Number,
          min: 50,
          max: 150,
        },
        cholesterolHDL: {
          type: Number,
          min: 15,
          max: 150,
        },
        cholesterolLDL: {
          type: Number,
          min: 50,
          max: 200,
        },
        totalCholesterol: {
          type: Number,
          min: 100,
          max: 400,
        },
        triglycerides: {
          type: Number,
          min: 50,
          max: 500,
        },
        hemoglobinA1c: {
          type: Number,
          min: 4.0,
          max: 20.0,
        },
        fastingGlucose: {
          type: Number,
          min: 70,
          max: 300,
        },
        creatinine: {
          type: Number,
          min: 0.5,
          max: 5.0, // mg/dL
        },
        eGFR: {
          type: Number,
          min: 15,
          max: 120, // mL/min/1.73m²
        },
        microalbumin: {
          type: Number,
          min: 0,
          max: 300, // mg/g creatinine
        },
        hasHyperlipidemia: {
          type: Boolean,
          default: false,
        },
        hasHypertension: {
          type: Boolean,
          default: false,
        },
        hasNephropathy: {
          type: Boolean,
          default: false,
        },
        hasRetinopathy: {
          type: Boolean,
          default: false,
        },
        hasNeuropathy: {
          type: Boolean,
          default: false,
        },
        diseaseDuration: {
          type: Number,
          min: 0,
          max: 80,
        }
      },
    ],

    // Medicamentația curentă
    currentMedication: medicationSchema,

    // Istoricul medicamentației
    medicationHistory: [
      {
        date: { type: Date, default: Date.now },
        medication: medicationSchema,
        changeReason: { type: String },
        prescribedBy: { type: String, default: 'Dr. Smith' }
      }
    ],

    // Informații clinice suplimentare
    clinicalInfo: {
      diabetesType: {
        type: String,
        enum: ['type1', 'type2', 'gestational', 'mody'],
        default: 'type2'
      },
      smokingStatus: {
        type: String,
        enum: ['never', 'former', 'current'],
        default: 'never'
      },
      alcoholConsumption: {
        type: String,
        enum: ['none', 'occasional', 'moderate', 'heavy'],
        default: 'none'
      },
      physicalActivity: {
        type: String,
        enum: ['sedentary', 'light', 'moderate', 'vigorous'],
        default: 'light'
      },
      familyHistoryDiabetes: {
        type: Boolean,
        default: false
      },
      comorbidities: [{
        condition: { type: String },
        diagnosisDate: { type: Date },
        severity: { type: String, enum: ['mild', 'moderate', 'severe'] }
      }],
      allergies: [{ type: String }],
      emergencyContact: {
        name: { type: String },
        phone: { type: String },
        relationship: { type: String }
      }
    },

    // Scor de risc cardiovascular
    cardiovascularRisk: {
      score: { type: Number, min: 0, max: 100 },
      category: { type: String, enum: ['low', 'moderate', 'high', 'very_high'] },
      lastCalculated: { type: Date, default: Date.now }
    }
  },
  {
    timestamps: true,
  }
);

// Metode pentru calcularea scorurilor
userSchema.methods.calculateBMI = function() {
  if (this.weight && this.height) {
    const heightInM = this.height / 100;
    return (this.weight / (heightInM * heightInM)).toFixed(1);
  }
  return null;
};

userSchema.methods.getLatestHbA1c = function() {
  if (this.analysisData && this.analysisData.length > 0) {
    const sortedData = this.analysisData.sort((a, b) => new Date(b.date) - new Date(a.date));
    return sortedData[0].hemoglobinA1c;
  }
  return null;
};

userSchema.methods.getMedicationComplexity = function() {
  let complexity = 0;
  const meds = this.currentMedication;
  
  // Count prescribed medications
  Object.keys(meds.toObject()).forEach(key => {
    if (meds[key] && meds[key].prescribed) {
      complexity++;
    }
  });
  
  return complexity;
};

// Index pentru optimizarea căutărilor
userSchema.index({ email: 1 });
userSchema.index({ 'analysisData.hemoglobinA1c': 1 });
userSchema.index({ 'currentMedication.metformin.prescribed': 1 });

const User = mongoose.model("User", userSchema);

module.exports = User;