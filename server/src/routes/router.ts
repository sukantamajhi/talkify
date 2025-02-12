import express, { Router } from "express";
import AuthRouter from "./AuthRouter";

const router = Router();

// Auth router
router.use("/auth", AuthRouter);

export default router;
