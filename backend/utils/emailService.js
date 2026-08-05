const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT || 587),
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

async function sendPasswordResetEmail({
  recipientEmail,
  recipientName,
  resetUrl,
}) {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: recipientEmail,
    subject: "Reset your SmartBiz AI password",
    text: `
Hello ${recipientName || "User"},

We received a request to reset your SmartBiz AI password.

Open this link to create a new password:

${resetUrl}

This link expires in 15 minutes.

If you did not request this reset, you can ignore this email.
    `.trim(),

    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px;">
        <h2>Reset your SmartBiz AI password</h2>

        <p>Hello ${recipientName || "User"},</p>

        <p>
          We received a request to reset your SmartBiz AI password.
        </p>

        <p style="margin:28px 0;">
          <a
            href="${resetUrl}"
            style="
              background:#4f66e8;
              color:#ffffff;
              text-decoration:none;
              padding:12px 20px;
              border-radius:8px;
              display:inline-block;
            "
          >
            Reset password
          </a>
        </p>

        <p>This link expires in 15 minutes.</p>

        <p>
          If you did not request this reset, you can safely ignore this email.
        </p>
      </div>
    `,
  });
}

async function verifyEmailConnection() {
  return transporter.verify();
}

module.exports = {
  sendPasswordResetEmail,
  verifyEmailConnection,
};