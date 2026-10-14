import Profile from "../models/Profile.js";
import { InformationCentre } from "../models/InformationCentre.js";
import { v2 as cloudinary } from "cloudinary";


// Cloudinary அமைப்பு (உங்கள் Credentials இங்கே கொடுக்கவும்)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "iyjyd4od",
  api_key: process.env.CLOUDINARY_API_KEY || "992852177176651",
  api_secret:
    process.env.CLOUDINARY_API_SECRET || "WFM4vWGkTFNVuaXrruQq5kctodI",
});


export default {
  // 1. தன் சொந்த ப்ரொபைலைப்பெற
  getMyProfile: async (userId) => {
    return await Profile.findOne({ userId });
  },

  // 2. தனிநபர் பயனர் (User) ப்ரொபைல் உருவாக்குவது
  createMyProfile: async (userId, input) => {
    // ஏற்கனவே ப்ரொபைல் உள்ளதா என சரிபார்த்தல்
    const existingProfile = await Profile.findOne({ userId });
    if (existingProfile) {
      throw new Error("உங்களுக்கு ஏற்கனவே ப்ரொபைல் உள்ளது.");
    }

    return await Profile.create({
      ...input,
      userId,
      createdByType: "SELF",
    });
  },

  // 3. தகவல் மையம் (Centre) வாடிக்கையாளருக்கு ப்ரொபைல் உருவாக்குவது
  createProfileByCentre: async (userId, input) => {
    // லாகின் செய்த பயனரின் தகவல் மையம் உள்ளதா எனப் பார்த்தல்
    let centre = await InformationCentre.findOne({ userId });

    // தகவல் மையம் அக்கவுண்ட் இல்லை என்றால் தற்காலிகமாக உருவாக்குதல்
    if (!centre) {
      centre = await InformationCentre.create({
        userId,
        name: "My Information Centre",
        ownerName: "Manager",
        phone: "0000000000",
        address: "Centre Address",
        district: input.district || "Default District",
      });
    }

    return await Profile.create({
      ...input,
      createdByCentreId: centre._id,
      createdByType: "CENTRE",
    });
  },

  uploadProfilePhoto: async (userId, imageBase64) => {
    // 1. Cloudinary-ல் Base64 படத்தை அப்லோட் செய்தல்
    const uploadResponse = await cloudinary.uploader.upload(imageBase64, {
      folder: "matrimony_profiles",
    });

    const imageUrl = uploadResponse.secure_url;

    // 2. பயனரின் Profile-ஐக் கண்டறிந்து போட்டோ URL-ஐ சேமித்தல்
    const profile = await Profile.findOne({ userId });
    if (!profile) {
      throw new Error(
        "Profile கண்டறியப்படவில்லை. முதலில் ப்ரொபைலை உருவாக்கவும்.",
      );
    }

    // photos அரேயில் புதிய போட்டோவைச் சேர்த்தல்
    profile.photos.push(imageUrl);
    await profile.save();

    return profile;
  },

  uploadCentreClientPhoto: async (userId, profileId, imageBase64) => {
    // 1. லாகின் செய்துள்ள பயனரின் 'தகவல் மையம்' (Centre) விவரத்தைக் கண்டறிதல்
    const centre = await InformationCentre.findOne({ userId });
    if (!centre) {
      throw new Error("தகவல் மையம் (Centre) கணக்கு கண்டறியப்படவில்லை.");
    }

    // 2. குறிப்பிட்ட அந்த profileId இந்த சென்டருக்குரியதுதானா எனச் சரிபார்த்தல்
    const profile = await Profile.findOne({
      _id: profileId,
      createdByCentreId: centre._id,
      createdByType: "CENTRE",
    });

    if (!profile) {
      throw new Error(
        "இந்த வரன் (Profile) உங்கள் மையத்திற்கு உரியது அல்ல அல்லது கிடைக்கவில்லை.",
      );
    }

    // 3. Cloudinary-ல் படத்தை அப்லோட் செய்தல்
    const uploadResponse = await cloudinary.uploader.upload(imageBase64, {
      folder: "matrimony_centre_profiles",
    });

    const imageUrl = uploadResponse.secure_url;

    // 4. அந்த குறிப்பிட்ட வாடிக்கையாளரின் போட்டோஸ் அரேயில் (Array) மட்டும் சேமித்தல்
    profile.photos.push(imageUrl);
    await profile.save();

    return profile;
  },
  searchProfiles: async (filter, page = 1, limit = 10) => {
    let query = {};

    if (filter.gender) query.gender = filter.gender;
    if (filter.religion)
      query.religion = { $regex: filter.religion, $options: "i" };
    if (filter.caste) query.caste = { $regex: filter.caste, $options: "i" };

    if (filter.districts && filter.districts.length > 0) {
      query.districts = { $in: filter.map((d) => new RegExp(d, "i")) };
    } else if (filter.district) {
      query.district = { $regex: filter.district, $options: "i" };
    }
    if (filter.maritalStatus) query.maritalStatus = filter.maritalStatus;
    if (filter.minAge !== undefined || filter.maxAge !== undefined) {
      const currentDate = new Date();
      query.dateOfBirth = {};
      if (filter.minAge !== undefined) {
        const maxBirthDate = new Date();
        maxBirthDate.setFullYear(currentDate.getFullYear() - filter.minAge);
        query.dateOfBirth.$lte = maxBirthDate.toISOString().split("T")[0];
      }

      if (filter.maxAge !== undefined) {
        const minBirthDate = new Date();
        minBirthDate.setFullYear(currentDate.getFullYear() - filter.maxAge - 1);
        query.dateOfBirth.$gte = minBirthDate.toISOString().split("T")[0];
      }
    }

    console.log(query);

    const skip = (page - 1) * limit;

    return await Profile.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
  },

  updateHoroscopeDetails: async (userId, profileId, horoscopeData) => {
    // 1. ப்ரொபைல் அந்த பயனர் அல்லது சென்டருக்குரியதுதானா எனச் சரிபார்த்தல்
    const profile = await Profile.findOne({ _id: profileId });
    if (!profile) {
      throw new Error("ப்ரொபைல் கண்டறியப்படவில்லை.");
    }

    // 2. ஜோதிட விவரங்களை அப்டேட் செய்தல்
    profile.horoscope = {
      ...profile.horoscope,
      ...horoscopeData,
    };

    await profile.save();
    return profile;
  },
};
