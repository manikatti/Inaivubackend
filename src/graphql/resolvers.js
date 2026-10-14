import authService from "../services/authService.js";
import adminService from "../services/adminService.js";
import profileService from "../services/profileService.js";
import interestService from "../services/interestService.js";
import shortlistService from "../services/shortlistService.js";
import chatService from "../services/chatService.js";
import paymentService from "../services/paymentService.js";
import privacyService from "../services/privacyService.js";



// Admin ஆத்தரைசேஷன் செக்
const requireAdmin = (context) => {
  if (!context.user?.userId) {
    throw new Error("அனுமதி இல்லை! முதலில் லாகின் செய்யவும்");
  }
  if (context.user.role !== "ADMIN") {
    throw new Error("தடைசெய்யப்பட்டுள்ளது! அட்மின்களுக்கு மட்டுமே அனுமதி உண்டு (Admin Only)");
  }
  return context.user;
};

// லாகின் செய்த பயனரா என சரிபார்க்கும் Auth Middleware
const requireAuth = (context) => {
 
  
  if (!context.user?.userId) {
    throw new Error("அனுமதி இல்லை! முதலில் லாகின் செய்யவும்.");
  }
  return context.user;
};




const resolvers = {
  Query: {
    me: async (_, context) => {
      if (!context.user?.userId) throw new Error("Unauthorized");
      return authService.getMe(context.user.userId);
    },
    getAllUsers: async (_, { role }, context) => {
      requireAdmin(context);
      return adminService.getAllUsers(role);
    },
    getMyProfile: async (_, context) => {
      const user = requireAuth(context);
      return profileService.getMyProfile(user.userId);
    },
    searchProfiles: async (_, { filter, page, limit }) => {
      return profileService.searchProfiles(filter, page, limit);
    },

    getReceivedInterests: async (_, context) => {
      const user = requireAuth(context);
      return interestService.getReceivedInterests(user.userId);
    },
    getSentInterests: async (_, context) => {
      const user = requireAuth(context);
      return interestService.getSentInterests(user.userId);
    },
    getShortlistedProfiles: async (_, context) => {
      const user = requireAuth(context);
      return shortlistService.getShortlistedProfiles(user.userId);
    },
    getMessages: async (_, { profileId }, context) => {
      const user = requireAuth(context);
      return chatService.getMessages(user.userId, profileId);
    },
    isProfileUnlocked: async (_, { profileId }, context) => {
      const user = requireAuth(context);
      return paymentService.isProfileUnlocked(user.userId, profileId);
    },
  },

  Mutation: {
    register: async (_, args) => authService.register(args),
    verifyOtp: async (_, args) => authService.verifyOtp(args),
    resendOtp: async (_, { email }) => authService.resendOtp({ email }),
    login: async (_, { email, password }) => authService.login(email, password),
    // Forgot & Reset Password Resolvers
    forgotPassword: async (_, { email }) => {
      return authService.forgotPassword(email);
    },

    resetPassword: async (_, { email, otp, newPassword }) => {
      return authService.resetPassword(email, otp, newPassword);
    },

    createMyProfile: async (_, { input }, context) => {
      const user = requireAuth(context);
      return profileService.createMyProfile(user.userId, input);
    },
    createProfileByCentre: async (_, { input }, context) => {
      const user = requireAuth(context);

      // CENTRE அல்லது ADMIN மட்டுமே உருவாக்க முடியும்
      if (user.role !== "CENTRE" && user.role !== "ADMIN") {
        throw new Error(
          "தடைசெய்யப்பட்டுள்ளது! தகவல் மையங்களுக்கு மட்டுமே அனுமதி உண்டு.",
        );
      }

      return profileService.createProfileByCentre(user.userId, input);
    },
    uploadProfilePhoto: async (_, { imageBase64 }, context) => {
      const user = requireAuth(context);
      return profileService.uploadProfilePhoto(user.userId, imageBase64);
    },
    uploadCentreClientPhoto: async (_, { profileId, imageBase64 }, context) => {
      const user = requireCentreAuth(context);
      return profileService.uploadCentreClientPhoto(
        user.userId,
        profileId,
        imageBase64,
      );
    },

    sendInterest: async (_, { receiverProfileId }, context) => {
      const user = requireAuth(context);
      return interestService.sendInterest(user.userId, receiverProfileId);
    },
    respondToInterest: async (_, { requestId, status }, context) => {
      const user = requireAuth(context);
      return interestService.respondToInterest(user.userId, requestId, status);
    },
    updateHoroscopeDetails: async (_, { profileId, horoscope }, context) => {
      const user = requireAuth(context);
      return profileService.updateHoroscopeDetails(
        user.userId,
        profileId,
        horoscope,
      );
    },

    toggleShortlist: async (_, { profileId }, context) => {
      const user = requireAuth(context);
      return shortlistService.toggleShortlist(user.userId, profileId);
    },
    sendMessage: async (_, { receiverProfileId, content }, context) => {
      const user = requireAuth(context);
      return chatService.sendMessage(user.userId, receiverProfileId, content);
    },

    unlockProfile: async (_, { profileId, paymentId, amount }, context) => {
      const user = requireAuth(context);
      return paymentService.unlockProfile(
        user.userId,
        profileId,
        paymentId,
        amount,
      );
    },

    // பயனரை Verify செய்ய
    verifyUserByAdmin: async (_, { userId }, context) => {
      requireAdmin(context);
      return adminService.verifyUserByAdmin(userId);
    },

    // பயனரை Activate (true) அல்லது Deactivate (false) செய்ய
    toggleUserActiveStatus: async (_, { userId, isActive }, context) => {
      requireAdmin(context);
      return adminService.toggleUserActiveStatus(userId, isActive);
    },
  },
   updatePrivacySettings: async (_, { privacySettings }, context) => {
      const user = requireAuth(context);
      return privacyService.updatePrivacySettings(user.userId, privacySettings);
    },


  User: {
    id: (u) => String(u._id),
  },
};

export default resolvers;