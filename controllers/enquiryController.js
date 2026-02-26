import nodemailer from "nodemailer";
import db from "../db.js";

/* ================= CREATE ENQUIRY ================= */
export const sendEnquiry = async (req, res) => {
  try {
    const { name, email, message, course_name, type } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be filled",
      });
    }

    /* ================= SAVE TO DATABASE ================= */
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

    /* ================= NODEMAILER SETUP ================= */
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_PORT == 465,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.verify();

    /* ================= ADMIN EMAIL ================= */
    await transporter.sendMail({
      from: `"Skyraan Academy Website" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      replyTo: email,
      subject: `New ${
        type === "course" ? "Course Enquiry" : "Contact Message"
      } from ${name}`,
      html: `
        <div style="font-family:Arial,sans-serif;padding:20px;">
          <h2 style="color:#1e3a8a;">New Website Enquiry</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          ${
            course_name
              ? `<p><strong>Course:</strong> ${course_name}</p>`
              : ""
          }
          <p><strong>Message:</strong></p>
          <div style="background:#f3f4f6;padding:15px;border-radius:8px;">
            ${message.replace(/\n/g, "<br/>")}
          </div>
        </div>
      `,
    });

    /* ================= AUTO REPLY ================= */
    await transporter.sendMail({
      from: `"Skyraan Academy" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "We received your enquiry",
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

/* ================= GET ALL ENQUIRIES ================= */
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

/* ================= MARK AS VIEWED ================= */
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

/* ================= SOFT DELETE ================= */
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