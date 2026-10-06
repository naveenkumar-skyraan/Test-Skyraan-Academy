import express from "express";
import nodemailer from "nodemailer";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { name, phone, email, message } = req.body;

    if (!name || !phone || !email || !message) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    const cleanPhone = String(phone).replace(/\D/g, "");

    const phoneRules = [
      { code: "91", min: 10, max: 10 },
      { code: "1", min: 10, max: 10 },
      { code: "44", min: 10, max: 10 },
      { code: "971", min: 9, max: 9 },
      { code: "61", min: 9, max: 9 },
      { code: "65", min: 8, max: 8 },
      { code: "60", min: 9, max: 10 },
      { code: "49", min: 5, max: 11 },
      { code: "33", min: 9, max: 9 },
    ];

    const matchedRule = phoneRules.find((rule) =>
      cleanPhone.startsWith(rule.code),
    );

    if (!matchedRule) {
      return res.status(400).json({
        success: false,
        message: "Unsupported phone country code",
      });
    }

    const nationalNumber = cleanPhone.slice(matchedRule.code.length);

    if (
      nationalNumber.length < matchedRule.min ||
      nationalNumber.length > matchedRule.max
    ) {
      return res.status(400).json({
        success: false,
        message:
          matchedRule.min === matchedRule.max
            ? `Phone number must be ${matchedRule.min} digits`
            : `Phone number must be between ${matchedRule.min} and ${matchedRule.max} digits`,
      });
    }

    const smtpPort = Number(process.env.SMTP_PORT) || 587;

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: smtpPort,
      secure:
        process.env.EMAIL_SECURE !== undefined
          ? process.env.EMAIL_SECURE === "true"
          : smtpPort === 465,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.verify();

    await transporter.sendMail({
      from: `"Skyraan Academy Website" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      replyTo: email,
      subject: `New Contact Message from ${name}`,
      html: `
        <div style="font-family:Arial,sans-serif;padding:20px;">
          <h2 style="color:#1e3a8a;">New Contact Message</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Message:</strong></p>
          <div style="background:#f3f4f6;padding:15px;border-radius:8px;">
            ${message.replace(/\n/g, "<br/>")}
          </div>
        </div>
      `,
    });

    await transporter.sendMail({
      from: `"Skyraan Academy" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "We received your message – Skyraan Academy",
      html: `
        <div style="font-family:Arial,sans-serif;padding:20px;">
          <h2 style="color:#1e3a8a;">Hello ${name},</h2>
          <p>Thank you for reaching out to <strong>Skyraan Academy</strong>.</p>
          <p>We have received your message and our team will get back to you shortly.</p>
          <br/>
          <p>Best Regards,<br/>Skyraan Academy Team</p>
        </div>
      `,
    });

    res.status(200).json({ success: true, message: "Email sent successfully" });
  } catch (error) {
    console.error("Contact route error:", error);
    res.status(500).json({ success: false, message: "Failed to send email" });
  }
});

export default router;
