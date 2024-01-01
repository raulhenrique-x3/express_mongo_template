import { IUser } from "../types/user";
import mongoose, { Schema } from "mongoose";

const UserSchema: Schema<IUser> = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, lowercase: true, unique: true },
  password: { type: String, required: true },
  picture: { type: String },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model<IUser>("User", UserSchema);
