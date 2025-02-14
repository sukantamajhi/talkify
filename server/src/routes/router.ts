import express, { Router } from "express";
import AuthRouter from "./AuthRouter";
import RoomRouter from "./RoomRouter";

const router = Router();

// Auth router
router.use("/auth", AuthRouter);

// Room router
router.use("/rooms", RoomRouter);

export default router;
