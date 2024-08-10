const nodemailer = require("nodemailer");
import dotenv from "dotenv";
import { ServiceError } from "../error/error.interface";
import { BusinessLogicError } from "../error/error";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: 587,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export enum EMAIL_ERROR_NAME {
  EMAIL_SENDING_FAILED = "EMAIL_SENDING_FAILED",
}

export const EMAIL_ERRORS: { [key in EMAIL_ERROR_NAME]: ServiceError } = {
  [EMAIL_ERROR_NAME.EMAIL_SENDING_FAILED]: {
    name: EMAIL_ERROR_NAME.EMAIL_SENDING_FAILED,
    statusCode: 500,
  },
};

class EmailService {
  async sendSignupEmail(to: string, username: string) {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject: "Welcome to Our Service!",
      text: `Hello ${username},\n\nThank you for signing up for our service. We're glad to have you!`,
      html: `<p>Hello <b>${username}</b>,</p><p>Thank you for signing up for our service. We're glad to have you!</p>`,
    };

    try {
      const resonse = await transporter.sendMail(mailOptions);
      console.log("Email sent successfully", resonse);
    } catch (error) {
      throw new BusinessLogicError(
        EMAIL_ERRORS.EMAIL_SENDING_FAILED,
        "Failed to send signup email."
      );
    }
  }
}

export default new EmailService();
