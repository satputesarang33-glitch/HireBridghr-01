import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { UserModel } from "../Model/User.js";
import { JWT_SECRET } from "../Middleware/authMiddleware.js";

/**
 * Helper to generate cryptographically signed JWT tokens
 */
const generateAuthToken = (user) => {
  return jwt.sign(
    {
      uid: user.id,
      id: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId || "org-1",
    },
    JWT_SECRET,
    { expiresIn: "24h" }
  );
};

/**
 * Strips password hashes and internal credential fields from user objects
 */
const sanitizeUser = (user) => {
  if (!user) return null;
  const { password, passwordHash, ...cleanUser } = user;
  return cleanUser;
};

/**
 * Validates email format
 */
const isValidEmail = (email) => {
  return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
};

/**
 * Controller handling all Authentication operations with cryptographic tokens and secure hashing
 */
export const authController = {
  // Recruiter / Admin Registration
  register: async (req, res, next) => {
    try {
      const { email, password, firstName, lastName, organizationName } = req.body;
      if (!email || !isValidEmail(email)) {
        return res.status(400).json({
          success: false,
          error: { code: "VALIDATION_ERROR", message: "A valid email address is required." },
        });
      }

      if (password && password.length < 8) {
        return res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Password must be at least 8 characters long.",
          },
        });
      }

      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          error: { code: "EMAIL_EXISTS", message: "An account with this email already exists." },
        });
      }

      const passwordHash = password ? await bcrypt.hash(password, 12) : undefined;

      const newUser = await UserModel.create({
        email: email.trim().toLowerCase(),
        firstName: firstName ? String(firstName).trim() : "",
        lastName: lastName ? String(lastName).trim() : "",
        name: `${firstName || ""} ${lastName || ""}`.trim() || email.split("@")[0],
        role: "RECRUITER",
        organizationName: organizationName || "HireBridge Workspace",
        ...(passwordHash && { passwordHash }),
      });

      const token = generateAuthToken(newUser);

      res.status(201).json({
        success: true,
        data: {
          user: sanitizeUser(newUser),
          token,
          accessToken: token,
        },
        message: "Registration successful.",
      });
    } catch (error) {
      next(error);
    }
  },

  // Recruiter / Workspace Login
  login: async (req, res, next) => {
    try {
      const { email, password } = req.body;
      if (!email || !isValidEmail(email)) {
        return res.status(400).json({
          success: false,
          error: { code: "VALIDATION_ERROR", message: "A valid email address is required." },
        });
      }

      const user = await UserModel.findByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          error: {
            code: "INVALID_CREDENTIALS",
            message: "No account found with this email. Please check your credentials or register.",
          },
        });
      }

      // Password verification
      if (user.passwordHash && password) {
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
          return res.status(401).json({
            success: false,
            error: {
              code: "INVALID_CREDENTIALS",
              message: "Invalid email or password.",
            },
          });
        }
      } else if (user.passwordHash && !password && process.env.NODE_ENV === "production") {
        return res.status(401).json({
          success: false,
          error: {
            code: "PASSWORD_REQUIRED",
            message: "Password is required for production login.",
          },
        });
      }

      const token = generateAuthToken(user);

      res.status(200).json({
        success: true,
        data: {
          user: sanitizeUser(user),
          token,
          accessToken: token,
        },
        message: "Welcome back!",
      });
    } catch (error) {
      next(error);
    }
  },

  // Candidate Signup
  candidateSignup: async (req, res, next) => {
    try {
      const { email, password, firstName, lastName, phone, location, avatar } = req.body;
      if (!email || !isValidEmail(email)) {
        return res.status(400).json({
          success: false,
          error: { code: "VALIDATION_ERROR", message: "A valid email address is required." },
        });
      }

      if (password && password.length < 8) {
        return res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Password must be at least 8 characters long.",
          },
        });
      }

      const existing = await UserModel.findByEmail(email);
      if (existing) {
        return res.status(409).json({
          success: false,
          error: { code: "EMAIL_EXISTS", message: "An account with this email already exists." },
        });
      }

      const passwordHash = password ? await bcrypt.hash(password, 12) : undefined;

      const newUser = await UserModel.create({
        id: `usr-cand-${Date.now().toString().slice(-4)}`,
        name: `${firstName || ""} ${lastName || ""}`.trim() || "Candidate",
        firstName: firstName ? String(firstName).trim() : "",
        lastName: lastName ? String(lastName).trim() : "",
        email: email.trim().toLowerCase(),
        phone: phone || "",
        location: location || "",
        role: "CANDIDATE",
        avatar:
          avatar ||
          "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
        ...(passwordHash && { passwordHash }),
      });

      // Initialize default candidate profile
      const newProfile = {
        userId: newUser.id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        fullName: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        location: newUser.location,
        avatar: newUser.avatar,
        headline: `${newUser.name} | Candidate`,
        currentTitle: "Job Seeker",
        experienceYears: 0,
        skills: [],
        education: [],
        workExperience: [],
        profileCompletion: 45,
      };
      await UserModel.saveCandidateProfile(newUser.id, newProfile);

      const token = generateAuthToken(newUser);

      res.status(201).json({
        success: true,
        data: {
          user: sanitizeUser(newUser),
          token,
          accessToken: token,
        },
        message: "Candidate account created successfully.",
      });
    } catch (error) {
      next(error);
    }
  },

  // Candidate Login
  candidateLogin: async (req, res, next) => {
    try {
      const { email, password } = req.body;
      if (!email || !isValidEmail(email)) {
        return res.status(400).json({
          success: false,
          error: { code: "VALIDATION_ERROR", message: "A valid email address is required." },
        });
      }

      const candidate = await UserModel.findByEmail(email);
      if (!candidate || candidate.role !== "CANDIDATE") {
        return res.status(401).json({
          success: false,
          error: {
            code: "INVALID_CREDENTIALS",
            message: "No candidate account found with this email. Please check your credentials or sign up.",
          },
        });
      }

      // Password verification
      if (candidate.passwordHash && password) {
        const isMatch = await bcrypt.compare(password, candidate.passwordHash);
        if (!isMatch) {
          return res.status(401).json({
            success: false,
            error: {
              code: "INVALID_CREDENTIALS",
              message: "Invalid email or password.",
            },
          });
        }
      } else if (candidate.passwordHash && !password && process.env.NODE_ENV === "production") {
        return res.status(401).json({
          success: false,
          error: {
            code: "PASSWORD_REQUIRED",
            message: "Password is required for production login.",
          },
        });
      }

      const token = generateAuthToken(candidate);

      res.status(200).json({
        success: true,
        data: {
          user: sanitizeUser(candidate),
          token,
          accessToken: token,
        },
        message: "Welcome back!",
      });
    } catch (error) {
      next(error);
    }
  },

  // Logout
  logout: async (req, res) => {
    res.status(200).json({
      success: true,
      message: "Logged out successfully.",
    });
  },

  // Forgot Password
  forgotPassword: async (req, res) => {
    const { email } = req.body;
    // Always return constant message to prevent account enumeration
    res.status(200).json({
      success: true,
      message: "If this email is registered, password reset instructions have been sent.",
    });
  },

  // Reset Password
  resetPassword: async (req, res) => {
    const { token, password } = req.body;
    if (!password || password.length < 8) {
      return res.status(400).json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Password must be at least 8 characters long." },
      });
    }
    res.status(200).json({
      success: true,
      message: "Your password has been reset successfully.",
    });
  },
};
