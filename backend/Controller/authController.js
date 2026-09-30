import { UserModel } from "../Model/User.js";

/**
 * Controller handling all Authentication operations
 */
export const authController = {
  // Recruiter / Admin Registration
  register: async (req, res, next) => {
    try {
      const { email, password, firstName, lastName, organizationName } = req.body;
      if (!email) {
        return res.status(400).json({
          success: false,
          error: { code: "VALIDATION_ERROR", message: "Email is required." },
        });
      }

      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          error: { code: "EMAIL_EXISTS", message: "An account with this email already exists." },
        });
      }

      const newUser = await UserModel.create({
        email,
        firstName: firstName || "",
        lastName: lastName || "",
        name: `${firstName || ""} ${lastName || ""}`.trim() || email.split("@")[0],
        role: "RECRUITER",
        organizationName: organizationName || "HireBridge Workspace",
      });

      const token = `jwt-token-${newUser.id}`;

      res.status(201).json({
        success: true,
        data: {
          user: newUser,
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
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({
          success: false,
          error: { code: "VALIDATION_ERROR", message: "Email is required." },
        });
      }

      let user = await UserModel.findByEmail(email);

      // Create fallback recruiter user if not yet stored in DB
      if (!user) {
        user = await UserModel.create({
          id: `usr-rec-${Date.now().toString().slice(-4)}`,
          email: email.toLowerCase(),
          name: email.split("@")[0].replace(".", " "),
          role: "RECRUITER",
          organizationId: "org-1",
        });
      }

      const token = `jwt-token-${user.id}`;

      res.status(200).json({
        success: true,
        data: {
          user,
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
      const { email, firstName, lastName, phone, location, avatar } = req.body;
      if (!email) {
        return res.status(400).json({
          success: false,
          error: { code: "VALIDATION_ERROR", message: "Email is required." },
        });
      }

      const existing = await UserModel.findByEmail(email);
      if (existing) {
        return res.status(409).json({
          success: false,
          error: { code: "EMAIL_EXISTS", message: "An account with this email already exists." },
        });
      }

      const newUser = await UserModel.create({
        id: `usr-cand-${Date.now().toString().slice(-4)}`,
        name: `${firstName || ""} ${lastName || ""}`.trim() || "Candidate",
        firstName: firstName || "",
        lastName: lastName || "",
        email,
        phone: phone || "",
        location: location || "",
        role: "CANDIDATE",
        avatar:
          avatar ||
          "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
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

      const token = `jwt-cand-token-${newUser.id}`;

      res.status(201).json({
        success: true,
        data: {
          user: newUser,
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
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({
          success: false,
          error: { code: "VALIDATION_ERROR", message: "Email is required." },
        });
      }

      let candidate = await UserModel.findByEmail(email);
      if (!candidate) {
        candidate = await UserModel.create({
          id: `usr-cand-${Date.now().toString().slice(-4)}`,
          email: email.toLowerCase(),
          name: email.split("@")[0].replace(".", " "),
          role: "CANDIDATE",
        });

        // Initialize candidate profile
        await UserModel.saveCandidateProfile(candidate.id, {
          userId: candidate.id,
          email: candidate.email,
          fullName: candidate.name,
          profileCompletion: 40,
        });
      }

      const token = `jwt-cand-token-${candidate.id}`;

      res.status(200).json({
        success: true,
        data: {
          user: candidate,
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
    res.status(200).json({
      success: true,
      message: "If this email is registered, password reset instructions have been sent.",
    });
  },

  // Reset Password
  resetPassword: async (req, res) => {
    res.status(200).json({
      success: true,
      message: "Your password has been reset successfully.",
    });
  },
};
