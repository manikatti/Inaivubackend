import Profile from "../models/Profile.js";
import Interest from "../models/Interest.js";
import UnlockedProfile from "../models/UnlockedProfile.js";

export default {
  // 1. பிரைவசி செட்டிங்ஸை அப்டேட் செய்வது
  updatePrivacySettings: async (userId, privacySettings) => {
    const profile = await Profile.findOne({ userId });
    if (!profile) {
      throw new Error("ப்ரொபைல் கண்டறியப்படவில்லை.");
    }

    profile.privacySettings = {
      ...profile.privacySettings,
      ...privacySettings,
    };

    await profile.save();
    return profile;
  },

  // 2. ஒருவர் மற்றொருவரின் போட்டோவைப் பார்க்க அனுமதி உள்ளதா எனச் சரிபார்க்கும் முறை
  canViewPhotos: async (viewerUserId, targetProfileId) => {
    const viewerProfile = await Profile.findOne({ userId: viewerUserId });
    if (!viewerProfile) return false;

    // தன் சொந்த ப்ரொபைலாக இருந்தால் பார்க்கலாம்
    if (viewerProfile._id.toString() === targetProfileId) return true;

    const targetProfile = await Profile.findById(targetProfileId);
    if (!targetProfile) return false;

    // போட்டோ லாக் செய்யப்படவில்லை என்றால் அனைவரும் பார்க்கலாம்
    if (!targetProfile.privacySettings?.isPhotoLocked) return true;

    // லாக் செய்யப்பட்டிருந்தால், விருப்பம் (Interest) ஏற்கப்பட்டுள்ளதா எனப் பார்த்தல்
    const interest = await Interest.findOne({
      $or: [
        {
          senderProfile: viewerProfile._id,
          receiverProfile: targetProfileId,
          status: "ACCEPTED",
        },
        {
          senderProfile: targetProfileId,
          receiverProfile: viewerProfile._id,
          status: "ACCEPTED",
        },
      ],
    });

    if (interest) return true;

    // அல்லது பேமெண்ட் மூலம் அன்லாக் செய்யப்பட்டிருந்தாலும் பார்க்கலாம்
    const unlocked = await UnlockedProfile.findOne({
      userProfile: viewerProfile._id,
      unlockedProfile: targetProfileId,
    });

    return !!unlocked;
  },
};
