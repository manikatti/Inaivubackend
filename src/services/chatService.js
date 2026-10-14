import Message from "../models/Message.js";
import Profile from "../models/Profile.js";
import Interest from "../models/Interest.js";

export default {
  // 1. செய்தி அனுப்புவது
  sendMessage: async (userId, receiverProfileId, content) => {
    const senderProfile = await Profile.findOne({ userId });
    if (!senderProfile) {
      throw new Error("முதலில் உங்கள் ப்ரொபைலை உருவாக்கவும்.");
    }

    // பாதுகாப்பு சோதனை: இருவருக்கும் இடையில் விருப்பம் (Interest) ஏற்கப்பட்டுள்ளதா?
    const interest = await Interest.findOne({
      $or: [
        {
          senderProfile: senderProfile._id,
          receiverProfile: receiverProfileId,
          status: "ACCEPTED",
        },
        {
          senderProfile: receiverProfileId,
          receiverProfile: senderProfile._id,
          status: "ACCEPTED",
        },
      ],
    });

    if (!interest) {
      throw new Error(
        "இந்த வரனுடன் பேச விருப்பக் கோரிக்கை (Interest) ஏற்றுக்கொள்ளப்பட்டிருக்க வேண்டும்.",
      );
    }

    const message = new Message({
      senderProfile: senderProfile._id,
      receiverProfile: receiverProfileId,
      content,
    });

    await message.save();
    return await message.populate(["senderProfile", "receiverProfile"]);
  },

  // 2. குறிப்பிட்ட வரனுடன் ஆன சாட் வரலாற்றைப் பெறுவது
  getMessages: async (userId, otherProfileId) => {
    const senderProfile = await Profile.findOne({ userId });
    if (!senderProfile) return [];

    return await Message.find({
      $or: [
        { senderProfile: senderProfile._id, receiverProfile: otherProfileId },
        { senderProfile: otherProfileId, receiverProfile: senderProfile._id },
      ],
    })
      .populate(["senderProfile", "receiverProfile"])
      .sort({ createdAt: 1 }); // பழையதில் இருந்து புதியது வரை வரிசைப்படுத்துதல்
  },
};
