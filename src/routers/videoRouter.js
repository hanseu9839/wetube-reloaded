import express from "express";
import {edit,see,deleteVideo,upload} from "../controllers/videoController";

const videoRouter = express.Router();

videoRouter.get("/upload",upload);
videoRouter.get("/:id(\\d+)",see);
videoRouter.get("/:id(\\d+)/edit",edit);
videoRouter.get("/:id(\\d+)/delete",deleteVideo);
export default videoRouter;