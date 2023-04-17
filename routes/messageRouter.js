import Express from "express";
import { protect } from "../middlewares/auth.js";
import { sendMessage,allMessage } from "../controllers/messageControllers.js";
const messageRouter = Express.Router();

messageRouter.route("/").post(protect,sendMessage);
messageRouter.route("/:chatId").get(protect,allMessage);
// messageRouter.route("/").get(protect,allMessage);

export default messageRouter;