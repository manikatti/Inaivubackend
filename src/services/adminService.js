// services/adminService.js
import User from "../models/User.js";

export default {
  // அனைத்து பயனர்களையும் பெறுதல்
  getAllUsers: async (roleFilter) => {
    const query = roleFilter ? { role: roleFilter } : {};
    return await User.find(query).sort({ createdAt: -1 });
  },

  // பயனரை Verify செய்தல்
  verifyUserByAdmin: async (userId) => {
    const user = await User.findById(userId);
    if (!user) throw new Error("பயனர் கணக்கு கண்டறியப்படவில்லை");

    user.isVerified = true;
    return await user.save();
  },

  // பயனரின் Active/Inactive நிலையை மாற்றுதல்
  toggleUserActiveStatus: async (userId, isActive) => {
    const user = await User.findById(userId);
    if (!user) throw new Error("பயனர் கணக்கு கண்டறியப்படவில்லை");

    user.isActive = isActive;
    return await user.save();
  },
};
