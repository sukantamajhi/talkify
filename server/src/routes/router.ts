import express, { Router } from "express";
import AuthRouter from "./AuthRouter";
import UserRouter from "./UserRouter";
import RoomRouter from "./RoomRouter";

const router = Router();

// Auth router
router.use("/auth", AuthRouter);

// User router
router.use("/users", UserRouter);

// Room router
router.use("/rooms", RoomRouter);

export default router;
