const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { signToken } = require("../utils/jwt");

class InvalidCredentialsError extends Error {
  constructor() {
    super("Invalid credentials");
    this.status = 401;
  }
}

// Verifies email/password and issues a JWT. Throws InvalidCredentialsError on failure.
async function login(email, password) {
  const user = await User.findOne({ email: email.toLowerCase() }).select("+salary");
  if (!user || user.status !== "active") {
    throw new InvalidCredentialsError();
  }

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) {
    throw new InvalidCredentialsError();
  }

  const token = signToken({ userId: user._id.toString(), role: user.role });
  return { token, user };
}
async function updateProfile(userId, data) {

    const user = await User.findById(userId);

    if (!user) {
        throw new Error("User not found");
    }
    if (data.email && data.email !== user.email) {

    const existing = await User.findOne({
        email: data.email.toLowerCase(),
        _id: { $ne: userId },
    });

    if (existing) {
        throw new Error("Email already exists");
    }

}

    if (data.name !== undefined)
        user.name = data.name;

    if (data.phone !== undefined)
        user.phone = data.phone;

    if (data.email !== undefined)
        user.email = data.email.toLowerCase();

    await user.save();

    return user;

}
async function changePassword(userId, currentPassword, newPassword) {

    const user = await User.findById(userId);

    if (!user) {
        throw new Error("User not found");
    }

    const isMatch = await bcrypt.compare(
        currentPassword,
        user.passwordHash
    );

    if (!isMatch) {
        throw new Error("Current password is incorrect");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.passwordHash = hashedPassword;

    await user.save();

    return user;
}
async function getById(userId) {
  return User.findById(userId).select("+salary");
}
async function uploadAvatar(userId, filename) {

    const user = await User.findById(userId);

    if (!user)
        throw new Error("User not found");

    user.avatarUrl = `/uploads/${filename}`;

    await user.save();

    return user;

}

module.exports = {
    login,
    getById,
    updateProfile,
    changePassword,
    uploadAvatar,
    InvalidCredentialsError,
};