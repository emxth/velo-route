import { User } from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";

export const registerUser = async ({ name, email, password, role }) => {
  if (!name || !email || !password) {
    return { status: 400, error: "Missing fields" };
  }

  const exists = await User.findOne({ email });
  if (exists) {
    return { status: 409, error: "Email already used" };
  }

  const user = await User.create({ name, email, password, role });
  const token = generateToken(user._id, user.role);

  return {
    status: 201,
    data: {
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    },
  };
};

export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user || !(await user.matchPassword(password))) {
    return { status: 401, error: "Invalid credentials" };
  }

  const token = generateToken(user._id, user.role);
  return {
    status: 200,
    data: {
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    },
  };
};