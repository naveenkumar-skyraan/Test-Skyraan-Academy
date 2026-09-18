import nodemailer from "nodemailer";
import db from "../db.js";

const createTransporter = () => {
  return nodemailer.createTransport({
    service:"smtp",
    host: process.env.SMTP_HOST,          
    port: Number(process.env.SMTP_PORT), 
    secure: process.env.EMAIL_SECURE === "true",
    auth: {
      user: process.env.EMAIL_USER,       
      pass: process.env.EMAIL_PASS,  
    }
  });
};

export const sendEnquiry = async (req, res) => {
  try {
    const { name, email, message, course_name, type } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be filled",
      });
    }

    const emailRegex =
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|in|co|org|edu|net|co\.in)$/i;

    const domain = email.split("@")[1]?.toLowerCase();

    const fakeDomains = [
      "gamil.com",
      "gmial.com",
      "hotmail.co",
      "outlok.com",
      "yaho.com",
    ];

    if (!emailRegex.test(email) || fakeDomains.includes(domain)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    const transporter = createTransporter();

    await transporter.verify();

    await transporter.sendMail({
      service:"smtp",
      from: `"Skyraan Academy Website" <${process.env.ADMIN_EMAIL}>`,
      to: process.env.ADMIN_EMAIL,
      replyTo: email, 
      subject: `New ${
        type === "course" ? "Course Enquiry" : "Contact Message"
      } from ${name}`,
      html: `
        <div style="font-family:Arial,sans-serif;padding:20px;">
          <h2 style="color:#1e3a8a;">New Website Enquiry</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          ${course_name ? `<p><strong>Course:</strong> ${course_name}</p>` : ""}
          <p><strong>Message:</strong></p>
          <div style="background:#f3f4f6;padding:15px;border-radius:8px;">
            ${message.replace(/\n/g, "<br/>")}
          </div>
        </div>
      `,
    });

    try {
      await transporter.sendMail({
        service:"smtp",
        from: `"Skyraan Academy" <${process.env.ADMIN_EMAIL}>`,
        to: email,
        subject: "We received your enquiry – Skyraan Academy",
        html: `
          <div style="font-family:Arial,sans-serif;padding:20px;">
            <h2 style="color:#1e3a8a;">Hello ${name},</h2>
            <p>Thank you for contacting <strong>Skyraan Academy</strong>.</p>
            ${
              course_name
                ? `<p>We have received your enquiry regarding <strong>${course_name}</strong>.</p>`
                : `<p>We have received your message.</p>`
            }
            <p>Our team will get back to you shortly.</p>
            <br/>
            <p>Best Regards,<br/>Skyraan Academy Team</p>
          </div>
        `,
      });
    } catch (mailError) {

      if (mailError.responseCode === 550) {
        return res.status(400).json({
          success: false,
          message: "Please enter a valid email address",
        });
      }
      console.error("Auto-reply failed:", mailError.message);
      return res
        .status(500)
        .json({ success: false, message: "Server error sending auto-reply" });
    }

    await db.query(
      `INSERT INTO enquiries 
       (name, email, message, course_name, type, status) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        name,
        email,
        message,
        course_name || "none",
        type || "contact",
        "new",
      ]
    );

    return res.status(200).json({
      success: true,
      message: "Enquiry submitted successfully",
    });
  } catch (error) {
    console.error("Enquiry Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to process enquiry",
    });
  }
};

export const getAllEnquiries = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT * FROM enquiries 
       WHERE deleted_at IS NULL 
       ORDER BY created_at DESC`
    );

    return res.status(200).json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("Fetch Enquiries Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch enquiries",
    });
  }
};

export const markEnquiryViewed = async (req, res) => {
  try {
    const { id } = req.params;

    await db.query(
      `UPDATE enquiries 
       SET status = 'viewed', updated_at = NOW() 
       WHERE id = ?`,
      [id]
    );

    return res.json({ success: true });
  } catch (error) {
    console.error("Mark Viewed Error:", error);
    return res.status(500).json({ success: false });
  }
};

export const deleteEnquiry = async (req, res) => {
  try {
    const { id } = req.params;

    await db.query(
      `UPDATE enquiries 
       SET deleted_at = NOW(), updated_at = NOW() 
       WHERE id = ?`,
      [id]
    );

    return res.json({ success: true });
  } catch (error) {
    console.error("Delete Error:", error);
    return res.status(500).json({ success: false });
  }
};