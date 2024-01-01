import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config({ path: "/server" });

export function generateAccessToken(username: string) {
  return jwt.sign({ username }, process.env.ACCESS_TOKEN_SECRET!, {
    expiresIn: "3600s",
  });
}

export function generateRefreshToken(username: string) {
  return jwt.sign({ username }, process.env.REFRESH_TOKEN_SECRET!);
}
