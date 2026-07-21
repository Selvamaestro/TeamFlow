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

async function getById(userId) {
  return User.findById(userId).select("+salary");
}

module.exports = { login, getById, InvalidCredentialsError };
