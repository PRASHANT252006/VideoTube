import { getDashboardStats } from "../controllers/dashboard.controller.js";
import express from "express";
import Router from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
 const router=express.Router();
 router.use(verifyJWT);

 router.route("/:dashboardPersonId").get(getDashboardStats);
export default router;