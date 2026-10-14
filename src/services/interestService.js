import Interest from "../models/Interest.js";
import Profile from "../models/Profile.js";

export default {
  // 1. விருப்பம் அனுப்புவது
  sendInterest: async (userId, receiverProfileId) => {
    const senderProfile = await Profile.findOne({ userId });
    if (!senderProfile) {
      throw new Error("முதலில் உங்கள் ப்ரொபைலை உருவாக்கவும்.");
    }

    if (senderProfile._id.toString() === receiverProfileId) {
      throw new Error("உங்களுக்கு நீங்களே விருப்பம் அனுப்ப முடியாது.");
    }

    // ஏற்கனவே கோரிக்கை அனுப்பப்பட்டுள்ளதா எனச் சரிபார்த்தல்
    const existing = await Interest.findOne({
      senderProfile: senderProfile._id,
      receiverProfile: receiverProfileId,
    });

    if (existing) {
      throw new Error("ஏற்கனவே இந்த வரனுக்கு விருப்பம் அனுப்பப்பட்டுள்ளது.");
    }

    const interest = new Interest({
      senderProfile: senderProfile._id,
      receiverProfile: receiverProfileId,
      status: "PENDING",
    });

    await interest.save();
    return await interest.populate(["senderProfile", "receiverProfile"]);
  },

  // 2. Accept அல்லது Reject செய்வது
  respondToInterest: async (userId, requestId, status) => {
    const receiverProfile = await Profile.findOne({ userId });
    if (!receiverProfile) {
      throw new Error("ப்ரொபைல் கண்டறியப்படவில்லை.");
    }

    const interest = await Interest.findOne({
      _id: requestId,
      receiverProfile: receiverProfile._id,
    });

    if (!interest) {
      throw new Error("விருப்பக் கோரிக்கை கிடைக்கவில்லை.");
    }

    interest.status = status;
    await interest.save();

    return await interest.populate(["senderProfile", "receiverProfile"]);
  },

  // 3. எனக்கு வந்த விருப்பங்கள்
  getReceivedInterests: async (userId) => {
    const profile = await Profile.findOne({ userId });
    if (!profile) return [];

    return await Interest.find({ receiverProfile: profile._id })
      .populate(["senderProfile", "receiverProfile"])
      .sort({ createdAt: -1 });
  },

  // 4. நான் அனுப்பிய விருப்பங்கள்
  getSentInterests: async (userId) => {
    const profile = await Profile.findOne({ userId });
    if (!profile) return [];

    return await Interest.find({ senderProfile: profile._id })
      .populate(["senderProfile", "receiverProfile"])
      .sort({ createdAt: -1 });
  },
};
