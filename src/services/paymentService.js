import UnlockedProfile from "../models/UnlockedProfile.js";
import Profile from "../models/Profile.js";

export default {
  // 1. ப்ரொபைலை அன்லாக் செய்தல்
  unlockProfile: async (userId, profileId, paymentId, amount) => {
    const userProfile = await Profile.findOne({ userId });
    if (!userProfile) {
      throw new Error("முதலில் உங்கள் ப்ரொபைலை உருவாக்கவும்.");
    }

    if (userProfile._id.toString() === profileId) {
      throw new Error("உங்கள் சொந்த ப்ரொபைலை நீங்களே அன்லாக் செய்ய முடியாது.");
    }

    // ஏற்கனவே அன்லாக் செய்யப்பட்டுள்ளதா எனச் சரிபார்த்தல்
    const existing = await UnlockedProfile.findOne({
      userProfile: userProfile._id,
      unlockedProfile: profileId,
    });

    if (existing) {
      return true; // ஏற்கனவே அன்லாக் செய்யப்பட்டுள்ளது
    }

    // புதியதாகச் சேமித்தல்
    const unlocked = new UnlockedProfile({
      userProfile: userProfile._id,
      unlockedProfile: profileId,
      paymentId,
      amount,
    });

    await unlocked.save();
    return true;
  },

  // 2. அன்லாக் செய்யப்பட்டுள்ளதா எனச் சரிபார்க்கும் முறை
  isProfileUnlocked: async (userId, profileId) => {
    const userProfile = await Profile.findOne({ userId });
    if (!userProfile) return false;

    // தன் சொந்த ப்ரொபைலாக இருந்தால் பார்க்கலாம்
    if (userProfile._id.toString() === profileId) return true;

    const unlocked = await UnlockedProfile.findOne({
      userProfile: userProfile._id,
      unlockedProfile: profileId,
    });

    return !!unlocked; // இருந்தால் true, இல்லையெனில் false
  },
};
