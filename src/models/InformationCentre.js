import mongoose from "mongoose";

// 1. தகவல் மையத்திற்கான Schema
const centreSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    name: { type: String, required: true },
    ownerName: { type: String, required: true },
    phone: { type: String, required: true },
    whatsapp: { type: String },
    email: { type: String },
    address: { type: String, required: true },
    district: { type: String, required: true },
    taluk: { type: String },
    village: { type: String },
    pincode: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

// 2. Named Export மற்றும் Default Export
export const InformationCentre = mongoose.model(
  "InformationCentre",
  centreSchema,
);

export default InformationCentre;
