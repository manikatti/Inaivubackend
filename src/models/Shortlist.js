// models/Shortlist.js
import mongoose from "mongoose";

const shortlistSchema = new mongoose.Schema(
  {
    userProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      required: true,
    },
    shortlistedProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      required: true,
    },
  },
  { timestamps: true },
);

// ஒரே ப்ரொபைலை மீண்டும் மீண்டும் ஷார்ட்லிஸ்ட் செய்யாமல் தடுக்க unique index
shortlistSchema.index(
  { userProfile: 1, shortlistedProfile: 1 },
  { unique: true },
);

export default mongoose.model("Shortlist", shortlistSchema);
