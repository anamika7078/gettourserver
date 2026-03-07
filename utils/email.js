
const nodemailer = require("nodemailer");

// Create reusable transporter using SMTP credentials
const createTransporter = () => {
    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host || !port || !user || !pass) {
        console.log("⚠️ SMTP not fully configured. Missing:", {
            host: !host,
            port: !port,
            user: !user,
            pass: !pass
        });
        return null;
    }

    // Remove any spaces from password (common Gmail App Password issue)
    const cleanPass = pass.replace(/\s+/g, '');

    return nodemailer.createTransport({
        host,
        port,
        secure: port === 465, // Use secure connection for port 465
        auth: {
            user,
            pass: cleanPass
        },
        tls: {
            rejectUnauthorized: false // For development only
        }
    });
};

// Send email helper
const sendEmail = async ({ to, subject, text, html }) => {
    const transporter = createTransporter();

    if (!transporter) {
        // Development fallback — logs email details if SMTP not configured
        console.log("⚠️ No SMTP configured — email fallback:");
        console.log({ to, subject, preview: text?.substring(0, 100) });
        return Promise.resolve();
    }

    try {
        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM || `"GetTourGuide" <${process.env.SMTP_USER}>`,
            to,
            subject,
            text,
            html,
        });

        console.log("✅ Email sent successfully to:", to);
        return info;
    } catch (error) {
        console.error("❌ Email send failed:", error.message);
        // Don't throw error - just log it so booking still completes
        return null;
    }
};

// Export functions (CommonJS)
module.exports = { sendEmail };
