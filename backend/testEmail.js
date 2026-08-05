require("dotenv").config();

const {
  verifyEmailConnection,
} = require("./utils/emailService");

verifyEmailConnection()
  .then(() => {
    console.log("Email server connection successful");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Email server connection failed:");
    console.error(error);
    process.exit(1);
  });