const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

dotenv.config({ path: "../config.env" });

const sendMail = async function (options) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 456,
    secure: true,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  // define the email option
  const mailOptions = {
    from: {
      name: "Apple-ScaB Classifier",
      address: process.env.GMAIL_USER,
    },
    to: options.email,
    subject: options.subject,
    html: options.message,
  };

  transporter.sendMail(mailOptions, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      console.log("Email sent to :" + result);
    }
  });
};

module.exports = sendMail;
