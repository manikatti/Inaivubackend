import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail", // Gmail அல்லது உங்கள் SMTP
  auth: {
    user: process.env.EMAIL_USER || "manikatti90@gmail.com",
    pass: process.env.EMAIL_PASS || "kcjx beod nohi mgsx",
  },
});

export const sendOtpEmail = async (email, otp) => {
  const mailOptions = {
    from: '"Matrimony App" <noreply@matrimony.com>',
    to: email,
    subject: "உங்கள் பதிவுக்கான OTP சரிபார்ப்பு எண்",
    html: `
      <h2>மேட்ரிமோனி ஆப்பிற்கு வரவேற்கிறோம்!</h2>
      <p>உங்கள் கணக்கை உறுதிப்படுத்த கீழே உள்ள OTP எண்ணைப் பயன்படுத்தவும்:</p>
      <h1 style="color: #4CAF50; letter-spacing: 2px;">${otp}</h1>
      <p>இந்த OTP 10 நிமிடங்களுக்கு மட்டுமே செல்லுபடியாகும்.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};
