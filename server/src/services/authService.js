import { findByEmail, createUser } from "../repositories/userRepository.js";
import { generateToken } from "../utils/generateToken.js";
import { AppError } from "../utils/AppError.js";

export const registerUser = async ({ name, email, password, role }) => {
  if (!name || !email || !password) throw new AppError("Missing fields", 400);

  const exists = await findByEmail(email);
  if (exists) throw new AppError("Email already used", 409);

  const user = await createUser({ name, email, password, role });
  const token = generateToken(user._id, user.role);
  return {
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  };
};

export const loginUser = async ({ email, password }) => {
  const user = await findByEmail(email);
  if (!user || !(await user.matchPassword(password))) {
    throw new AppError("Invalid credentials", 401);
  }
  const token = generateToken(user._id, user.role);
  return {
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  };
};