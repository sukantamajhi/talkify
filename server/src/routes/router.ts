import express, { Router } from "express";
import UserRouter from "./UserRouter";
import RoomRouter from "./RoomRouter";

const router = Router();

// User router
router.use("/users", UserRouter);

// Room router
router.use("/rooms", RoomRouter);

export default router;
