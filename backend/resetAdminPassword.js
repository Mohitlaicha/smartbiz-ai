require("dotenv").config();

const bcrypt = require("bcryptjs");
const User = require("./models/User");

async function resetPassword() {
  try {
    const email = "mohit@gmail.com";
    const newPassword = "Admin1234";

    const user = await User.findOne({
      where: { email },
    });

    if (!user) {
      console.log("User not found:", email);
      process.exitCode = 1;
      return;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await user.update({
      password: hashedPassword,
      role: "admin",
      status: "active",
    });

    const passwordWorks = await bcrypt.compare(
      newPassword,
      user.password
    );

    console.log("User found:", user.email);
    console.log("Role:", user.role);
    console.log("Status:", user.status);
    console.log("Password reset successful:", passwordWorks);
  } catch (error) {
    console.error("Reset failed:", error);
    process.exitCode = 1;
  } finally {
    await User.sequelize.close();
  }
}

resetPassword();