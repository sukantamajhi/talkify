import { Router } from "express";
import RoomController from "../controllers/RoomController";
import verifyToken from "../middleware/VerifyToken";

const router = Router();

// Route to create a new room
router.post("/", verifyToken, RoomController.createRoom);

// Route to get all rooms
router.get("/", verifyToken, RoomController.getRooms);

// Route to get a room by ID
router.get("/:id", verifyToken, RoomController.getRoomById);

// Route to get a room by roomname
router.get("/room-name/:roomname", verifyToken, RoomController.getRoomByName);

// Route to update a room by ID
router.put("/:id", verifyToken, RoomController.updateRoom);

// Route to delete a room by ID
router.delete("/:id", verifyToken, RoomController.deleteRoom);

export default router;
