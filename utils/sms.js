const AfricasTalking = require("africastalking");
const dotenv = require("dotenv");

dotenv.config({ path: "./config.env" });

// AfricasTalking credentials
const credentials = {
  apiKey: process.env.AFRICASTALKING_API,
  username: process.env.AFRICASTALKING_USERNAME,
};

const africasTalking = AfricasTalking(credentials);
const sms = africasTalking.SMS;

// Function to validate phone number format
const isValidPhoneNumber = (phoneNumber) => {
  const phoneRegex = /^\+\d{1,3}\d{3,14}$/; // International format regex
  return phoneRegex.test(phoneNumber);
};

// Function to send SMS
const sendSMS = async (phoneNumber, message, company) => {
  if (!isValidPhoneNumber(phoneNumber)) {
    throw new Error("Invalid phone number format.");
  }
  if (!message || message.trim() === "") {
    throw new Error("Message cannot be blank.");
  }
  if (!company || company.trim() === "") {
    throw new Error("Forgot to add company name .");
  }

  const options = {
    to: [phoneNumber],
    message: message,
    from: company,
  };

  try {
    const response = await sms.send(options);
    return response;
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = sendSMS;
