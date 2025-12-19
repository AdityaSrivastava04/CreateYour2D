import { Router } from "express";
import { generateVideoControllerBase64, testVideoRead } from "../controller/video.controller.js";

const router=Router()

router.route("/").post(generateVideoControllerBase64)
router.route('/test-video-read').get( testVideoRead);

export default router