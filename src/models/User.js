import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    phone: { type: String, default: null },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["USER", "CENTRE", "ADMIN"],
      default: "USER",
    },
    isVerified: { type: Boolean, default: false }, // OTP சரிபார்க்கப்பட்டதா?
    isActive: { type: Boolean, default: true },
    otp: { type: String, default: null }, // OTP எண்
    otpExpires: { type: Date, default: null }, // OTP காலாவதியாகும் நேரம்
  },
  { timestamps: true },
);

export default mongoose.model("User", userSchema);
