import mongoose from "mongoose";

const profileSchema = new mongoose.Schema(
  {
    // 1. தனிநபர் பயனருக்கு (Self Profile)
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // 2. தகவல் மையம் மூலம் உருவாக்கப்படும் போது
    createdByCentreId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InformationCentre",
      default: null,
    },
// models/Profile.js (Privacy Settings)
    privacySettings: {
      isPhotoLocked: { 
      type: Boolean, 
      default: false // false என்றால் அனைவருக்கும் தெரியும், true என்றால் லாக் செய்யப்பட்டிருக்கும்
    }
    },
    // ப்ரொபைல் யாரால் உருவாக்கப்பட்டது? ('SELF' அல்லது 'CENTRE')
    createdByType: {
      type: String,
      enum: ["SELF", "CENTRE"],
      required: true,
    },

    // அடிப்படை விவரங்கள்
    fullName: { type: String, required: true },
    gender: {
      type: String,
      enum: ["MALE", "FEMALE", "OTHER"],
      default: "MALE",
      
    },
    horoscope: {
  star: { type: String },         // நட்சத்திரம் (ഉதாரணமாக: Ashwini, Rohini)
  raasi: { type: String },        // ராசி (உதாரணமாக: Mesham, Rishabam)
  dosham: { type: String },       // தோஷம் (உதாரணமாக: Sevvai Dosham, None)
  birthTime: { type: String },    // பிறந்த நேரம்
  birthPlace: { type: String },   // பிறந்த இடம்
  horoscopeUrl: { type: String }  // ஜாதகப் படம் அல்லது PDF-ன் கிளவுட் URL
},  
    dateOfBirth: { type: String },
    religion: { type: String },
    caste: { type: String },
    maritalStatus: {
      type: String,
      enum: ["NEVER_MARRIED", "DIVORCED", "WIDOWED", "SEPARATED"],
      default: "NEVER_MARRIED",
    },
    education: { type: String },
    occupation: { type: String },
    income: { type: String },
    height: { type: String },
    city: { type: String },
    district: { type: String },
    state: { type: String },
    country: { type: String },
    aboutMe: { type: String },

    // தகவல் மையம் மூலமாக பதியும் போது வாடிக்கையாளரின் தொடர்பு எண்
    clientPhone: { type: String },
  },
  { timestamps: true },
);

export default mongoose.model("Profile", profileSchema);
