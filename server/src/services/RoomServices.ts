import logger from "../../logger";
import RoomModel, { IRoom } from "../models/RoomModel";
import { ERRORS } from "../utils/messages";

export default {
	createRoom: (roomData: IRoom) => {
		return new Promise(async (resolve, reject) => {
			try {
				// Check either the room already exists or not
				const room = await RoomModel.findOne({
					name: roomData.name,
					isActive: true,
				});
				if (room) {
					return reject(ERRORS.ROOM_ALREADY_EXISTS);
				}
				// Create a new room
				const newRoom = new RoomModel(roomData);
				const savedRoom = await newRoom.save();
				return resolve(savedRoom);
			} catch (error: any) {
				return reject(ERRORS.INTERNAL_SERVER_ERROR);
			}
		});
	},
	getRooms: () => {
		return new Promise(async (resolve, reject) => {
			try {
				const rooms = await RoomModel.find({ isActive: true });
				return resolve(rooms);
			} catch (error: any) {
				return reject(ERRORS.INTERNAL_SERVER_ERROR);
			}
		});
	},
	getRoomById: (roomId: string) => {
		return new Promise(async (resolve, reject) => {
			try {
				const room = await RoomModel.findById(roomId);
				if (!room || !room.isActive) {
					return reject(ERRORS.ROOM_NOT_FOUND);
				}
				return resolve(room);
			} catch (error: any) {
				return reject(ERRORS.INTERNAL_SERVER_ERROR);
			}
		});
	},
	getRoomByName: (roomName: string) => {
		return new Promise(async (resolve, reject) => {
			try {
				logger.info(roomName, "<<-- roomName");
				const room = await RoomModel.findOne({
					name: roomName,
					isActive: true,
				});
				console.log(room, "<<-- room info");
				if (!room) {
					return reject(ERRORS.ROOM_NOT_FOUND);
				}
				return resolve(room);
			} catch (error: any) {
				logger.error(error, "<<-- Error in getting room by name");
				return reject(ERRORS.INTERNAL_SERVER_ERROR);
			}
		});
	},
	updateRoom: (roomId: string, updateData: Partial<IRoom>) => {
		return new Promise(async (resolve, reject) => {
			try {
				const updatedRoom = await RoomModel.findByIdAndUpdate(
					roomId,
					updateData,
					{ new: true }
				);
				if (!updatedRoom || !updatedRoom.isActive) {
					return reject(ERRORS.ROOM_NOT_FOUND);
				}
				return resolve(updatedRoom);
			} catch (error: any) {
				return reject(ERRORS.INTERNAL_SERVER_ERROR);
			}
		});
	},
	deleteRoom: (roomId: string) => {
		return new Promise(async (resolve, reject) => {
			try {
				const deletedRoom = await RoomModel.findByIdAndUpdate(
					roomId,
					{ isActive: false },
					{ new: true }
				);
				if (!deletedRoom) {
					return reject(ERRORS.ROOM_NOT_FOUND);
				}
				return resolve(deletedRoom);
			} catch (error: any) {
				return reject(ERRORS.INTERNAL_SERVER_ERROR);
			}
		});
	},
};
