import mongoose from "mongoose";

const unlockedProfileSchema = new mongoose.Schema(
  {
    userProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      required: true,
    },
    unlockedProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      required: true,
    },
    paymentId: {
      type: String,
      required: true,
    }, // Razorpay / Stripe பேமெண்ட் ஐடி
    amount: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true },
);

// ஒரே ப்ரொபைலை மீண்டும் மீண்டும் பணம் கொடுத்து வாங்காமல் இருக்க unique index
unlockedProfileSchema.index(
  { userProfile: 1, unlockedProfile: 1 },
  { unique: true },
);

export default mongoose.model("UnlockedProfile", unlockedProfileSchema);
