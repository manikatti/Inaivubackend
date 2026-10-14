import Shortlist from "../models/Shortlist.js";
import Profile from "../models/Profile.js";

export default {
  // 1. Shortlist Toggle (Add / Remove)
  toggleShortlist: async (userId, profileId) => {
    const userProfile = await Profile.findOne({ userId });
    if (!userProfile) {
      throw new Error("முதலில் உங்கள் ப்ரொபைலை உருவாக்கவும்.");
    }

    if (userProfile._id.toString() === profileId) {
      throw new Error("உங்களுக்கு நீங்களே ஷார்ட்லிஸ்ட் செய்ய முடியாது.");
    }

    // ஏற்கனவே ஷார்ட்லிஸ்ட் செய்யப்பட்டுள்ளதா எனச் சரிபார்த்தல்
    const existing = await Shortlist.findOne({
      userProfile: userProfile._id,
      shortlistedProfile: profileId
    });

    if (existing) {
      // ஏற்கனவே இருந்தால் நீக்கிவிடவும் (Remove)
      await Shortlist.deleteOne({ _id: existing._id });
      return false; // Removed
    } else {
      // இல்லையெனில் புதிதாகச் சேர்க்கவும் (Add)
      const shortlist = new Shortlist({
        userProfile: userProfile._id,
        shortlistedProfile: profileId
      });
      await shortlist.save();
      return true; // Added
    }
  },

  // 2. ஷார்ட்லிஸ்ட் செய்த প্রোபைல்களின் பட்டியலைப் பெறுவது
  getShortlistedProfiles: async (userId) => {
    const userProfile = await Profile.findOne({ userId });
    if (!userProfile) return [];

    const shortlists = await Shortlist.find({ userProfile: userProfile._id })
      .populate("shortlistedProfile")
      .sort({ createdAt: -1 });

    // வெறும் shortlistedProfile விவரங்களை மட்டும் மேப் செய்து அனுப்புதல்
    return shortlists.map(s => s.shortlistedProfile);
  }
};