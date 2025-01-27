const mongoose = require("mongoose");

// Definim schema pentru utilizatori
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
    },
    diagnosisYear: {
      type: Number,
      required: true,
    },
    // Date pentru monitorizare zilnică
    dailyData: [
      {
        date: {
          type: Date,
          default: Date.now, // Data implicită este data curentă
        },
        systolicPressure: {
          type: Number,
          min: 80,
          max: 250, // Limite realiste pentru presiune sistolică
        },
        diastolicPressure: {
          type: Number,
          min: 50,
          max: 150, // Limite realiste pentru presiune diastolică
        },
        cholesterolHDL: {
          type: Number,
          min: 15,
          max: 150, // Interval pentru HDL
        },
        cholesterolLDL: {
          type: Number,
          min: 50,
          max: 200, // Interval pentru LDL
        },
        hemoglobinA1c: {
          type: Number,
          min: 4.0,
          max: 20.0, // Interval realist pentru HbA1c
          validate: {
            validator: (v) => v.toFixed(1) === `${v}`, // Validează o singură zecimală
            message: (props) =>
              `${props.value} trebuie să aibă o singură zecimală!`,
          },
        },
      },
    ],
  },
  {
    timestamps: true, // Adaugă automat createdAt și updatedAt
  }
);

// Creăm modelul User pe baza schemei
const User = mongoose.model("User", userSchema);

module.exports = User;
