import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER || "your-email@gmail.com",
    pass: process.env.EMAIL_PASSWORD || "your-app-password",
  },
});

export async function sendPaymentConfirmation(
  email: string,
  username: string,
  amount: string,
  scrimType: string
) {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER || "noreply@svscrims.com",
      to: email,
      subject: "Payment Received - SV Scrims Registration",
      html: `
        <h2>Payment Confirmed!</h2>
        <p>Hi ${username},</p>
        <p>Your payment of ₹${amount} for ${scrimType} scrim has been received.</p>
        <p>Your registration is being verified. You'll receive another email once approved.</p>
        <p>Best regards,<br>SV Scrims Team</p>
      `,
    });
    console.log(`Payment confirmation sent to ${email}`);
  } catch (error) {
    console.error("Email send failed:", error);
  }
}

export async function sendPaymentApproved(
  email: string,
  username: string,
  scrimType: string,
  roomId: string,
  roomPassword: string,
  matchTime: string
) {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER || "noreply@svscrims.com",
      to: email,
      subject: "Payment Approved - Scrim Room Details",
      html: `
        <h2>You're In!</h2>
        <p>Hi ${username},</p>
        <p>Your payment has been approved for ${scrimType} scrim!</p>
        <p><strong>Room Details (Available 10 minutes before match):</strong></p>
        <p>Room ID: <code>${roomId}</code></p>
        <p>Password: <code>${roomPassword}</code></p>
        <p>Match Time: ${matchTime}</p>
        <p>Get ready to compete!</p>
        <p>Best regards,<br>SV Scrims Team</p>
      `,
    });
    console.log(`Payment approved email sent to ${email}`);
  } catch (error) {
    console.error("Email send failed:", error);
  }
}

export async function sendWalletNotification(
  email: string,
  username: string,
  type: "add" | "withdraw",
  amount: string
) {
  try {
    const message = type === "add" 
      ? `₹${amount} has been added to your wallet`
      : `Withdrawal of ₹${amount} is being processed`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER || "noreply@svscrims.com",
      to: email,
      subject: `Wallet Update - SV Scrims`,
      html: `
        <p>Hi ${username},</p>
        <p>${message}</p>
        <p>Best regards,<br>SV Scrims Team</p>
      `,
    });
  } catch (error) {
    console.error("Email send failed:", error);
  }
}
