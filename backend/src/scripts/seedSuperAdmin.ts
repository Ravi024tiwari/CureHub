import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import { User } from "../models/User.model.js";
import { UserRole } from "../constants/index.js";

dotenv.config();

const seedSuperAdminInteractive = async () => {
  const rl = readline.createInterface({ input, output });

  try {
    await connectDB();

    console.log("\n=======================================================");
    console.log("       CUREHEALTH - SUPER ADMIN ONBOARDING CLI         ");
    console.log("=======================================================\n");
    

    const existingSuperAdmin = await User.findOne({
      role: UserRole.SUPER_ADMIN,
    });

    if (existingSuperAdmin) {
      console.log(
        `[Security Notice] A Super Admin already exists in the system.`
      );
      console.log(`Current Super Admin Email: ${existingSuperAdmin.email}`);
      console.log(`Only ONE Super Admin account is permitted.\n`);
      rl.close();
      await mongoose.connection.close();
      process.exit(0);
    }

    // 2. Interactive Terminal Prompts
    console.log("Please enter the initial Super Admin credentials:\n");

    let name = "";
    while (!name.trim()) {
      name = await rl.question(" Enter Super Admin Name: ");
      if (!name.trim()) console.log(" Name cannot be empty.");
    }

    let email = "";
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    while (!email.trim() || !emailRegex.test(email.trim())) {
      email = await rl.question(" Enter Super Admin Email: ");
      if (!emailRegex.test(email.trim())) {
        console.log(" Please enter a valid email address.");
      }
    }

    let password = "";
    while (!password || password.length < 6) {
      password = await rl.question(" Enter Super Admin Password (min 6 characters): ");
      if (password.length < 6) {
        console.log(" Password must be at least 6 characters long.");
      }
    }

    let phoneNumber = "";
    while (!phoneNumber.trim()) {
      phoneNumber = await rl.question(" Enter Super Admin Phone Number: ");
      if (!phoneNumber.trim()) {
        console.log(" Phone number cannot be empty.");
      }
    }

    // 3. Check for conflict with existing users
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPhone = phoneNumber.trim();

    const existingUser = await User.findOne({
      $or: [{ email: normalizedEmail }, { phoneNumber: normalizedPhone }],
    });

    if (existingUser) {
      console.error(
        `\n[Error] An account with email "${normalizedEmail}" or phone "${normalizedPhone}" already exists.`
      );
      rl.close();
      await mongoose.connection.close();
      process.exit(1);
    }

    // 4. Create the Super Admin account
    const superAdmin = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      phoneNumber: normalizedPhone,
      role: UserRole.SUPER_ADMIN,
      isAccountApproved: true,
      isEmailVerified: true,
      isActive: true,
    });

    console.log("\n=======================================================");
    console.log(" Super Admin account registered successfully!");
    console.log(` ID:    ${superAdmin._id}`);
    console.log(` Name:  ${superAdmin.name}`);
    console.log(` Email: ${superAdmin.email}`);
    console.log(` Role:  ${superAdmin.role}`);
    console.log("=======================================================");
    console.log("You can now log in using /api/auth/login and update your profile.\n");

    rl.close();
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("\n[Error] Failed to register Super Admin:", error);
    rl.close();
    await mongoose.connection.close();
    process.exit(1);
  }
};

seedSuperAdminInteractive();
