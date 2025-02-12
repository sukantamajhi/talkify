import { Router } from "express";
import RoomController from "../controllers/RoomController";
import verifyToken from "../middleware/VerifyToken";

const router = Router();

// Route to create a new room
router.post("/rooms", verifyToken, RoomController.createRoom);

// Route to get all rooms
router.get("/rooms", verifyToken, RoomController.getRooms);

// Route to get a room by ID
router.get("/rooms/:id", verifyToken, RoomController.getRoomById);

// Route to update a room by ID
router.put("/rooms/:id", verifyToken, RoomController.updateRoom);

// Route to delete a room by ID
router.delete("/rooms/:id", verifyToken, RoomController.deleteRoom);

export default router;
