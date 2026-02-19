import nodemailer from "nodemailer";
import db from "../db.js";

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
            `INSERT INTO enquiries (name, email, message, course_name, type)
       VALUES (?, ?, ?, ?, ?)`,
            [name, email, message, course_name || null, type || "contact"]
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
        console.log("SMTP Connected Successfully");

        /* ================= ADMIN EMAIL ================= */
        await transporter.sendMail({
            from: `"Skyraan Academy Website" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER,
            replyTo: email,
            subject: `New ${type === "course" ? "Course Enquiry" : "Contact Message"} from ${name}`,
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

        /* ================= AUTO REPLY TO USER ================= */
        await transporter.sendMail({
            from: `"Skyraan Academy" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "We received your enquiry",
            html: `
        <div style="font-family:Arial,sans-serif;padding:20px;">
          <h2 style="color:#1e3a8a;">Hello ${name},</h2>
          <p>Thank you for contacting <strong>Skyraan Academy</strong>.</p>
          ${course_name
                    ? `<p>We have received your enquiry regarding <strong>${course_name}</strong>.</p>`
                    : `<p>We have received your message.</p>`
                }
          <p>Our team will get back to you shortly.</p>
          <br/>
          <p>Best Regards,<br/>Skyraan Academy Team</p>
        </div>
      `,
        });

        res.status(200).json({
            success: true,
            message: "Enquiry submitted successfully",
        });

    } catch (error) {
        console.error("Enquiry Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to process enquiry",
        });
    }
};
