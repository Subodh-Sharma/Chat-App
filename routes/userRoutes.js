import express from "express";
import { userRegister, userLogin, allUsers } from "../controllers/userControllers.js";
import { protect } from "../middlewares/auth.js";

const userRouter = express.Router();

userRouter.route('/login').post(userLogin);
userRouter.route('/signup').post(userRegister);
userRouter.route("/").get(protect,allUsers);

export default userRouter;