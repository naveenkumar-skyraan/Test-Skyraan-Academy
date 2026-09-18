import express from "express";
import nodemailer from "nodemailer";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    const transporter = nodemailer.createTransport({
      service:"smtp",
      host: process.env.SMTP_HOST,          
      port: Number(process.env.SMTP_PORT), 
      secure: process.env.EMAIL_SECURE === "true",
      auth: {
        user: process.env.EMAIL_USER,      
        pass: process.env.EMAIL_PASS,       
      }
    });

    await transporter.verify();

    await transporter.sendMail({
      service:"smtp",
      from: `"Skyraan Academy Website" <${process.env.EMAIL_USER}>`, 
      to: process.env.ADMIN_EMAIL,
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
      service:"smtp",
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