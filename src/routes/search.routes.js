import { search } from "../controllers/search.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { Router } from "express";
import mongoose from "mongoose";
const router = Router();


router.use(verifyJWT); 

router.route("/").get(search);

export default router;