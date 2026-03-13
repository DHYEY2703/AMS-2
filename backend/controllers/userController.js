import User from "../models/UserModel.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import AuditLog from "../models/AuditLogModel.js";
import { sendOTPEmail } from "../lib/mailService.js";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In-memory OTP store (userId -> { otp, expiresAt })
const otpStore = new Map();

// Controller to update a user's profile
export const updateProfile = async (req, res) => {
  try {
    const { name, profilePic } = req.body;
    const userId = req.user.id;

    // Optional: Only admins or the user themselves can update their profile.
    // AuthMiddleware (protect) already validates user.
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name) user.name = name;
    if (profilePic !== undefined) user.profilePic = profilePic;

    await user.save();

    // send back the populated user
    const updatedUser = await User.findById(userId).populate("classId").select("-password");

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error updating profile:", error);
    // If payload is too large, it might be due to base64 size limit on express
    res.status(500).json({ message: "Server error updating profile" });
  }
};

// Controller to get users with role "teacher"
export const getTeachers = async (req, res) => {
  try {
    const teachers = await User.find({ role: "teacher" }).select("-password");
    res.json(teachers);
  } catch (error) {
    console.error("Error in getTeachers:", error);
    res.status(500).json({ message: "Server error fetching teachers" });
  }
};

// Controller to get users with role "student"
export const getStudents = async (req, res) => {
  try {
    const students = await User.find({ role: "student" }).select("-password").populate("classId");
    res.json(students);
  } catch (error) {
    console.error("Error in getStudents:", error);
    res.status(500).json({ message: "Server error fetching students" });
  }
};

// Controller to get users with role "parent"
export const getParents = async (req, res) => {
  try {
    const parents = await User.find({ role: "parent" }).select("-password").populate("children", "name email");
    res.json(parents);
  } catch (error) {
    console.error("Error in getParents:", error);
    res.status(500).json({ message: "Server error fetching parents" });
  }
};

//Login controller - Step 1: Verify credentials and send OTP
export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).populate("classId");
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

    // Store OTP in memory
    otpStore.set(user._id.toString(), { otp, expiresAt });

    // Save OTP to otp.txt in project root
    const rootDir = path.resolve(__dirname, '../../');
    const otpFilePath = path.join(rootDir, 'otp.txt');
    const otpContent = `[${new Date().toLocaleString()}] OTP for ${user.email} (${user.role}): ${otp}\n`;
    fs.appendFileSync(otpFilePath, otpContent);
    console.log(`OTP for ${user.email}: ${otp} (saved to otp.txt)`);

    // Send OTP via email
    try {
      await sendOTPEmail(user.email, user.name, otp);
    } catch (emailErr) {
      console.error("Failed to send OTP email:", emailErr);
      // Don't fail login if email fails — OTP is in otp.txt
    }

    // Return userId (no token yet — OTP required)
    res.json({
      requireOTP: true,
      userId: user._id,
      email: user.email,
      message: "OTP sent to your email. Check your inbox (and otp.txt).",
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ msg: "Server error during login" });
  }
};

// Login controller - Step 2: Verify OTP and issue token
export const verifyOTP = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
      return res.status(400).json({ msg: "User ID and OTP are required" });
    }

    const stored = otpStore.get(userId);

    if (!stored) {
      return res.status(400).json({ msg: "No OTP found. Please login again." });
    }

    if (Date.now() > stored.expiresAt) {
      otpStore.delete(userId);
      return res.status(400).json({ msg: "OTP has expired. Please login again." });
    }

    if (stored.otp !== otp) {
      return res.status(400).json({ msg: "Invalid OTP. Please try again." });
    }

    // OTP verified! Delete it and issue JWT
    otpStore.delete(userId);

    const user = await User.findById(userId).populate("classId").select("-password");
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({ token, user });
  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({ msg: "Server error during OTP verification" });
  }
};

// Create User Controller (Admin Only)
export const createUser = async (req, res) => {
  try {
    const { name, email, password, role, classId, phoneNumber, children } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ msg: "Please provide all required fields" });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: "User already exists" });
    }

    // Only Admin can access this via route protection, but let's be sure
    if (req.user.role !== "admin") {
      return res.status(403).json({ msg: "Not authorized to create users" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
      classId: role === "student" || role === "teacher" ? classId : undefined,
      phoneNumber: role === "parent" ? phoneNumber : undefined,
      children: role === "parent" ? children : undefined,
    });

    await newUser.save();
    const populatedUser = await User.findById(newUser._id).populate('classId').populate('children', 'name email');

    res.status(201).json(populatedUser);
  } catch (error) {
    console.error("Create user error:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

// Signup Controller (Obsolete / Redirected for Public Use)
export const signupController = async (req, res) => {
  const { name, email, password, role, classId } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({ msg: "Please provide all required fields" });
  }
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ msg: "User already exists" });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({
    name,
    email,
    password: hashedPassword,
    role,
    classId: role === "student" || role === "teacher" ? classId : undefined,
  });
  await newUser.save();

  // Populate classId before sending response
  const populatedUser = await User.findById(newUser._id).populate('classId');

  const token = jwt.sign({ id: populatedUser._id, role: populatedUser.role }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  res.status(201).json({ token, user: populatedUser });
}

//Auth Check
export const authCheck = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ msg: "Not authorized" });
  }
  try {
    const user = await User.findById(req.user.id).populate("classId");
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Error in auth check:", error);
    res.status(500).json({ msg: "Server error" });
  }
}

//Get All Users
export const getUsers = async (req, res) => {
  const users = await User.find().populate("classId");
  res.json(users);
}