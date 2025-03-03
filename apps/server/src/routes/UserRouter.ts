import express from "express";
import verifyToken from "../middleware/VerifyToken";
import UserController from "../controllers/UserController";

const router = express.Router();

router.get("/", verifyToken, UserController.getUser);

export default router;
