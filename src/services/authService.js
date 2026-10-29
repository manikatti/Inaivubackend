import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendOtpEmail } from "../utils/email.js";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey123";

// 6 இலக்க OTP உருவாக்கும் செயல்பாடு
const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

 export default {
   // 1. கணக்கு பதிவு (Register & Send OTP)
   register: async ({ phone, email, password, role }) => {
     const existingUser = await User.findOne({ email });
     if (existingUser && existingUser.isVerified) {
       throw new Error("இந்த மின்னஞ்சல் ஏற்கனவே பதிவாகியுள்ளது");
     }

     const hashedPassword = await bcrypt.hash(password, 10);
     const otp = generateOTP();
     const otpExpires = new Date(Date.now() + 60 * 60 * 1000); // 10 நிமிடங்கள்

     let user = existingUser;
     if (!user) {
       user = await User.create({
         phone,
         email,
         password: hashedPassword,
         role: role || "USER",
         otp,
         otpExpires,
       });
     } else {
       // ஏற்கனவே பதிவு செய்து OTP பெறாதவராக இருந்தால் புதுப்பித்தல்
       user.password = hashedPassword;
       user.otp = otp;
       user.otpExpires = otpExpires;
       await user.save();
     }

     // Email மூலம் OTP அனுப்புதல்
    // await sendOtpEmail(email, otp);

     return {
       message:
         "OTP உங்கள் மின்னஞ்சலுக்கு அனுப்பப்பட்டுள்ளது. தயவுசெய்து சரிபார்க்கவும்.",
       user,
     };
   },

   // 2. OTP சரிபார்த்தல் (Verify OTP)
   verifyOtp: async ({ email, otp }) => {
     const user = await User.findOne({ email });
     if (!user) throw new Error("பயனர் கண்டறியப்படவில்லை");

     if (user.isVerified) {
       throw new Error("இந்த மின்னஞ்சல் ஏற்கனவே சரிபார்க்கப்பட்டுவிட்டது");
     }

     if (user.otp !== otp || new Date() > user.otpExpires) {
       throw new Error("தவறான அல்லது காலாவதியான OTP");
     }

     // OTP சரியானால் Verified ஆக மாற்றுதல்
     user.isVerified = true;
     user.otp = null;
     user.otpExpires = null;
     await user.save();

     const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, {
       expiresIn: "7d",
     });

     return {
       token,
       message: "மின்னஞ்சல் வெற்றிகரமாக சரிபார்க்கப்பட்டது!",
       user,
     };
   },

   // 3. Resend OTP
   resendOtp: async ({ email }) => {
     const user = await User.findOne({ email });
     if (!user) throw new Error("பயனர் கண்டறியப்படவில்லை");

     const otp = generateOTP();
     user.otp = otp;
     user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
     await user.save();

     await sendOtpEmail(email, otp);

     return {
       message: "புதிய OTP உங்கள் மின்னஞ்சலுக்கு அனுப்பப்பட்டுள்ளது.",
       user,
     };
   },

   // 4. லாகின் (Login)
   login: async (email, password) => {
     const user = await User.findOne({ email });
     if (!user) throw new Error("கணக்கு எதுவுமில்லை");

     if (!user.isVerified) {
       throw new Error(
         "உங்கள் மின்னஞ்சல் இன்னும் சரிபார்க்கப்படவில்லை. OTP மூலம் சரிபார்க்கவும்.",
       );
     }

     const isValid = await bcrypt.compare(password, user.password);
     if (!isValid) throw new Error("தவறான பாஸ்வேர்ட்");

     const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, {
       expiresIn: "7d",
     });

     return {
       token,
       message: "லாகின் வெற்றி!",
       user,
     };
   },
   // 1. Forgot Password - OTP அனுப்பும் செயல்முறை
   forgotPassword: async (email) => {
     const user = await User.findOne({ email });
     if (!user) {
       throw new Error("இந்த மின்னஞ்சலில் எந்தக் கணக்கும் கண்டறியப்படவில்லை.");
     }

     const otp = generateOTP();
     user.otp = otp;
     user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 நிமிடங்கள் செல்லும்
     await user.save();

     // OTP மின்னஞ்சல் அனுப்புதல்
     await sendOtpEmail(email, otp);

     return {
       message:
         "பாஸ்வேர்ட் மாற்றத்திற்கான OTP உங்கள் மின்னஞ்சலுக்கு அனுப்பப்பட்டுள்ளது.",
     };
   },
   // 2. Reset Password - OTP சரிபார்த்து பாஸ்வேர்ட் மாற்றுதல்
   resetPassword: async (email, otp, newPassword) => {
     const user = await User.findOne({ email });
     if (!user) {
       throw new Error("பயனர் கணக்கு கண்டறியப்படவில்லை.");
     }

     // OTP சரிபார்த்தல்
     if (!user.otp || user.otp !== otp || new Date() > user.otpExpires) {
       throw new Error("தவறான அல்லது காலாவதியான OTP.");
     }

     // புதிய பாஸ்வேர்ட்டை Encrypt செய்து சேமித்தல்
     user.password = await bcrypt.hash(newPassword, 10);
     user.otp = null;
     user.otpExpires = null;
     await user.save();

     return {
       message:
         "உங்கள் பாஸ்வேர்ட் வெற்றிகரமாக மாற்றப்பட்டது! தற்போது புதிய பாஸ்வேர்ட் மூலம் லாகின் செய்யலாம்.",
     };
   },
 };


