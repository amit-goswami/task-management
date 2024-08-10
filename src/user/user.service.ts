import { BusinessLogicError } from "../error/error";
import { loginUserDTO, signupUserDTO, USER_ERRORS } from "./user.dto";
import UserModel from "./user.model";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import emailService from "../mail/email.service";
class UserService {
  loginUser = async ({ email, password }: loginUserDTO) => {
    const existingUser = await this.getUserByEmail(email);

    if (!existingUser) {
      throw new BusinessLogicError(
        USER_ERRORS.USER_NOT_FOUND,
        "Invalid Credentails"
      );
    }

    const isValidPassword = await existingUser.comparePassword(password);
    if (!isValidPassword) {
      throw new BusinessLogicError(
        USER_ERRORS.USER_INVALID_DATA,
        "Invalid credentials"
      );
    }

    dotenv.config();
    const JWT_KEY = process.env.JWT_KEY;

    if (!JWT_KEY) {
      throw new BusinessLogicError(
        USER_ERRORS.USER_INVALID_DATA,
        "jwt env is missing"
      );
    }

    const token = jwt.sign(
      {
        id: existingUser._id,
        role: existingUser.role,
        email: existingUser.email,
      },
      JWT_KEY,
      { expiresIn: "3h" }
    );

    return {
      token,
      id: existingUser._id,
    };
  };

  signupUser = async ({ email, password, username }: signupUserDTO) => {
    const [existingUserByEmail, existingUserByUsername] = await Promise.all([
      this.getUserByEmail(email),
      this.getUserByUsername(username),
    ]);

    if (existingUserByEmail) {
      throw new BusinessLogicError(
        USER_ERRORS.USER_ALREADY_EXISTS,
        "User with this email already exists"
      );
    }

    if (existingUserByUsername) {
      throw new BusinessLogicError(
        USER_ERRORS.USER_ALREADY_EXISTS,
        "User with this username already exists"
      );
    }

    const user = new UserModel({
      email,
      hashedPassword: password,
      username,
    });

    const saveUser = await user.save();

    await emailService.sendSignupEmail(email, username);

    return {
      id: saveUser._id,
      message: "User created successfully",
    };
  };

  private getUserByEmail = async (email: string) => {
    const user = await UserModel.findOne({ email: email.toLowerCase() });
    return user;
  };

  private getUserByUsername = async (username: string) => {
    const user = await UserModel.findOne({ username });
    return user;
  };

  getUserById = async (userId: string) => {
    const user = await UserModel.findById(userId);
    return user;
  };
}

export default UserService;
