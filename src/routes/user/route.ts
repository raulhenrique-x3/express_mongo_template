import { Router } from "express";
import User from "../../controllers/user/User";
import { uploadImage } from "../../middleware/file/FirebaseUpload";
import multer, { memoryStorage } from "multer";

const userRoutes = Router();

const Multer = multer({
  storage: memoryStorage(),
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
});

userRoutes.post("/login", User.login).bind(User);
userRoutes.post("/register", User.register).bind(User);
userRoutes
  .put("/edit/:id", Multer.single("picture"), uploadImage, User.editUser)
  .bind(User);
userRoutes.get("/get/:id", User.getUser).bind(User);
userRoutes.post("/delete-account/:id", User.deleteUser).bind(User);

export default userRoutes;
