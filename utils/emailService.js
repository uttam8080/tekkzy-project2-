const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // Create transporter
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });

    // Define email options
    const mailOptions = {
        from: `${process.env.FROM_NAME || 'FoodHub'} <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
        to: options.email,
        subject: options.subject,
        html: options.message
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);

    console.log(`Message sent: ${info.messageId}`);
};

module.exports = sendEmail;
