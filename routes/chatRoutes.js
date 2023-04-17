import Express from "express";
import { protect } from "../middlewares/auth.js";
import { accessChat,fetchChats,createGroupChat,renameGroup,removeFromGroup,addToGroup } from "../controllers/chatControllers.js";

const chatRouter = Express.Router();

chatRouter.route("/").post(protect,accessChat);
chatRouter.route("/").get(protect,fetchChats);
chatRouter.route("/group").post(protect,createGroupChat);
chatRouter.route("/rename").put(protect,renameGroup);
chatRouter.route("/groupremove").put(protect,removeFromGroup);
chatRouter.route("/groupadd").put(protect,addToGroup);

export default chatRouter;