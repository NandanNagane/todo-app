// Filename: utils/sendWelcomeEmail.js
import transporter from "../config/nodeMailer.js";

// A small helper to capitalize the provider name (e.g., "google" -> "Google")
const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

export const sendWelcomeEmail = async (user) => {
  if (!user || !user.email || user.isEmailPlaceholder) {
    console.log(`Skipping welcome email for user: ${user.userName}`);
    return;
  }

  let subject, html, text, callToActionLink, callToActionText;

  // 1. Check the user's authProvider to customize the content
  if (user.authProvider === "local") {
    // --- Content for Local (Email/Password) Signups ---
    subject = "Welcome to Todo-app!";
    callToActionText = "Log In Now";
    callToActionLink = `${process.env.UI_URL}/login`;
    text = `Welcome to the Todo-app website! Your account has been created. Please log in to get started.`;
    html = `
      <div style="font-family: Arial, sans-serif; font-size: 16px;">
        <h1>Welcome to Todo-app! ✅</h1>
        <p>Hello, <strong>${user.userName}</strong>,</p>
        <p>We're excited to have you on board. Your account has been successfully created.</p>
        <p>Click the button below to log in with the password you just set.</p>
      </div>
    `;
  } else {
    // --- Content for Social (Google, Twitter, etc.) Signups ---
    const providerName = capitalize(user.authProvider);
    subject = `You're all set with Todo-app!`;
    callToActionText = "Go to Your Dashboard";
    callToActionLink = `${process.env.UI_URL}/dashboard`; // Link to dashboard, not login!
    text = `Welcome to the Todo-app website! Your account was created using your ${providerName} profile. You're already logged in!`;
    html = `
      <div style="font-family: Arial, sans-serif; font-size: 16px;">
        <h1>You're all set! 🚀</h1>
        <p>Hello, <strong>${user.userName}</strong>,</p>
        <p>Welcome to Todo-app! Your account was created instantly using your <strong>${providerName}</strong> profile.</p>
        <p>You're logged in, so you can get started right away.</p>
      </div>
    `;
  }

  // 2. Construct the email with the customized content
  const mailOptions = {
    from: process.env.SENDER_EMAIL_ADDRESS,
    to: user.email,
    subject: subject,
    text: text,
    html: `
      ${html}
      <a 
        href="${callToActionLink}" 
        style="background-color: #4CAF50; color: white; padding: 14px 25px; text-align: center; text-decoration: none; display: inline-block; margin-top: 20px;"
      >
        ${callToActionText}
      </a>
      <p style="margin-top: 30px;">Thanks,<br/>The Todo-app Team</p>
    `,
  };

  // 3. Send the email
  try {
    await transporter.sendMail(mailOptions);
    console.log(`Welcome email sent to ${user.email} (Provider: ${user.authProvider})`);
  } catch (error) {
    console.error(`Error sending welcome email to ${user.email}:`, error);
  }
};