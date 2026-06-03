const nodemailer = require("nodemailer");

async function testSmtp() {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: "olayodea93@gmail.com",
      pass: "tdoy zsyx mpfq iudk",
    },
  });

  try {
    console.log("Verifying connection...");
    await transporter.verify();
    console.log("SMTP Connection successful!");
    
    // Attempt to send a test email
    await transporter.sendMail({
      from: "olayodea93@gmail.com",
      to: "olayodea93@gmail.com", // send to self
      subject: "Test SMTP Connection",
      text: "If you are reading this, your SMTP settings are perfectly fine."
    });
    console.log("Test email sent to olayodea93@gmail.com.");
    
  } catch (error) {
    console.error("SMTP Error:", error.message);
  }
}

testSmtp();
