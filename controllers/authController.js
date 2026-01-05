const User = require("../models/User");
const Customer = require("../models/Customer");
const Distributor = require("../models/Distributor");
const Admin = require("../models/Admin");

const fs = require("fs");
const path = require("path");

// ======================
// Helper Validation
// ======================
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone) {
  return /^[0-9]{10,15}$/.test(phone);
}

class AuthController {
  // ============================
  // REGISTER (Frontend)
  // ============================
  static async register(req, res) {
    try {
      const {
        name,
        username,
        email,
        password,
        confirmPassword,
        phone,
        first_name,
        last_name,
        address,
        role_id = 1,
      } = req.body;

      if (password !== confirmPassword)
        return res
          .status(400)
          .json({ success: false, message: "Password mismatch" });

      if (await User.findByEmail(email))
        return res
          .status(400)
          .json({ success: false, message: "Email already registered" });

      if (await User.findByUsername(username))
        return res
          .status(400)
          .json({ success: false, message: "Username already taken" });

      const newUser = await User.create({
        name,
        username,
        email,
        password,
        phone,
        first_name,
        last_name,
        address,
        role_id,
      });

      if (role_id === 1) await Customer.create(newUser.id);
      if (role_id === 2) await Distributor.create(newUser.id);
      if (role_id === 3) await Admin.create(newUser.id);

      req.session.userId = newUser.id;
      req.session.role_id = newUser.role_id;

      await new Promise((resolve, reject) => {
        req.session.save((err) => {
          if (err) {
            console.error('Session save error (register):', err);
            return reject(err);
          }
          console.log('Session saved (register):', req.sessionID);
          resolve();
        });
      });

      res.status(201).json({ success: true, message: "User registered", data: newUser });
    } catch (error) {
      console.error("Register error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }

  // ============================
  // LOGIN
  // ============================
  static async login(req, res) {
    try {
      const { username, password } = req.body;

      let user = await User.findByUsername(username);
      if (!user) user = await User.findByEmail(username);

      if (!user)
        return res
          .status(400)
          .json({ success: false, message: "Invalid credentials" });

      const valid = await User.comparePassword(password, user.password);
      if (!valid)
        return res
          .status(400)
          .json({ success: false, message: "Invalid credentials" });

      req.session.userId = user.id;
      req.session.role_id = user.role_id;

      await new Promise((resolve, reject) => {
        req.session.save((err) => {
          if (err) {
            console.error('Session save error (login):', err);
            return reject(err);
          }
          console.log('Session saved (login):', req.sessionID);
          resolve();
        });
      });

      const fullData = await User.findById(user.id);

      res.json({
        success: true,
        message: "Login successful",
        data: {
          user: fullData,
          session: { userId: user.id, role_id: user.role_id },
        },
      });
    } catch (err) {
      console.error("Login error:", err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }

  // ============================
  // GET PROFILE
  // ============================
  static async getProfile(req, res) {
    try {
      const user = await User.findById(req.session.userId);
      if (!user)
        return res
          .status(404)
          .json({ success: false, message: "User not found" });

      res.json({ success: true, data: { user } });
    } catch (error) {
      console.error("Get profile error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }

  // ============================
  // UPDATE PROFILE (Frontend)
  // ============================
  static async updateProfile(req, res) {
    try {
      const { name, email, phone, first_name, last_name, address } = req.body;

      if (email && !isValidEmail(email))
        return res
          .status(400)
          .json({ success: false, message: "Invalid email format" });

      let updateData = { name, email, phone, first_name, last_name, address };

      if (req.file) {
        const user = await User.findById(req.session.userId);

        if (user.profile_image) {
          const oldPath = path.join(__dirname, "..", user.profile_image);
          if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }

        updateData.profile_image = req.file.path;
      }

      Object.keys(updateData).forEach(
        (key) => !updateData[key] && delete updateData[key]
      );

      await User.updateProfile(req.session.userId, updateData);

      const updated = await User.findById(req.session.userId);

      res.json({ success: true, message: "Profile updated", data: updated });
    } catch (error) {
      console.error("Update profile error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }

  // ============================
  // GET ALL MITRA
  // ============================
  static async getAllMitra(req, res) {
    try {
      const mitra = await User.findByRoleId(2);
      res.json({ success: true, data: mitra });
    } catch (error) {
      console.error("GetAllMitra error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }

  // ============================
  // GET ALL USER
  // ============================
  static async getAllUser(req, res) {
    try {
      const users = await User.findByRoleId(1);
      res.json({ success: true, data: users });
    } catch (error) {
      console.error("GetAllUser error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }

  // ============================
  // GET MITRA BY ID
  // ============================
  static async getMitraById(req, res) {
    try {
      const user = await User.findById(req.params.id);

      if (!user || user.role_id !== 2)
        return res
          .status(404)
          .json({ success: false, message: "Mitra tidak ditemukan" });

      res.json({ success: true, data: user });
    } catch (error) {
      console.error("GetMitraById error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }

  // ============================
  // GET USER BY ID
  // ============================
  static async getUserById(req, res) {
    try {
      const user = await User.findById(req.params.id);

      if (!user || user.role_id !== 1)
        return res
          .status(404)
          .json({ success: false, message: "User tidak ditemukan" });

      res.json({ success: true, data: user });
    } catch (error) {
      console.error("GetUserById error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }

  // ============================
  // ADD MITRA
  // ============================
  static async addMitra(req, res) {
    try {
      const { name, email, phone, password, confirmPassword } = req.body;

      if (!name || !email || !phone || !password || !confirmPassword)
        return res
          .status(400)
          .json({ success: false, message: "Semua field wajib diisi" });

      if (!isValidEmail(email))
        return res
          .status(400)
          .json({ success: false, message: "Email tidak valid" });

      if (!isValidPhone(phone))
        return res
          .status(400)
          .json({ success: false, message: "Nomor handphone tidak valid" });

      if (password !== confirmPassword)
        return res
          .status(400)
          .json({ success: false, message: "Password tidak cocok" });

      const username = email.split("@")[0];

      const newUser = await User.create({
        name: name.trim(),
        username: username.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
        first_name: null,
        last_name: null,
        address: null,
        role_id: 2,
      });

      await Distributor.create(newUser.id);

      res.json({
        success: true,
        message: "Mitra berhasil ditambahkan",
        data: newUser,
      });
    } catch (error) {
      console.error("addMitra error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }

  // ============================
  // ADD USER
  // ============================
  static async addUser(req, res) {
    try {
      const { name, email, phone, password, confirmPassword, address } =
        req.body;

      if (!name || !email || !phone || !password || !confirmPassword)
        return res
          .status(400)
          .json({ success: false, message: "Semua field wajib diisi" });

      if (!isValidEmail(email))
        return res
          .status(400)
          .json({ success: false, message: "Email tidak valid" });

      if (!isValidPhone(phone))
        return res
          .status(400)
          .json({ success: false, message: "Nomor handphone tidak valid" });

      if (password !== confirmPassword)
        return res
          .status(400)
          .json({ success: false, message: "Password tidak cocok" });

      const username = email.split("@")[0];

      const newUser = await User.create({
        name: name.trim(),
        username: username.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
        first_name: null,
        last_name: null,
        address: address ? address.trim() : null,
        role_id: 1,
      });

      await Customer.create(newUser.id);

      res.json({
        success: true,
        message: "User berhasil ditambahkan",
        data: newUser,
      });
    } catch (error) {
      console.error("addUser error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }

  // ============================
  // UPDATE MITRA
  // ============================
  static async updateMitraById(req, res) {
    try {
      const { id } = req.params;
      const { name, email, phone, password } = req.body;

      const user = await User.findById(id);
      if (!user || user.role_id !== 2)
        return res
          .status(404)
          .json({ success: false, message: "Mitra tidak ditemukan" });

      const updateData = { name, email, phone };

      if (password && password.length >= 6) updateData.password = password;

      await User.updateProfile(id, updateData);

      const updated = await User.findById(id);

      res.json({ success: true, message: "Mitra updated", data: updated });
    } catch (error) {
      console.error("updateMitra error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }

  // ============================
  // UPDATE USER
  // ============================
  static async updateUserById(req, res) {
    try {
      const { id } = req.params;
      const { name, email, phone, password } = req.body;

      const user = await User.findById(id);
      if (!user)
        return res
          .status(404)
          .json({ success: false, message: "User tidak ditemukan" });

      const updateData = { name, email, phone };

      if (password && password.length >= 6) updateData.password = password;

      await User.updateProfile(id, updateData);

      const updated = await User.findById(id);

      res.json({ success: true, message: "User updated", data: updated });
    } catch (error) {
      console.error("updateUser error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }

  // ============================
  // DELETE USER / MITRA
  // ============================
  static async deleteUserById(req, res) {
    try {
      const { id } = req.params;

      const user = await User.findById(id);
      if (!user)
        return res
          .status(404)
          .json({ success: false, message: "User tidak ditemukan" });

      await User.deleteById(id);

      if (user.role_id === 1) await Customer.deleteByUserId(id);
      if (user.role_id === 2) await Distributor.deleteByUserId(id);
      if (user.role_id === 3) await Admin.deleteByUserId(id);

      res.json({ success: true, message: "User deleted" });
    } catch (error) {
      console.error("deleteUser error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
}

module.exports = AuthController;
