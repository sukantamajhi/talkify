import { Request, Response } from "express";
import { IRoom } from "../models/RoomModel";
import RoomServices from "../services/RoomServices";
import { RoomMessages } from "../utils/messages";
import { IRequest } from "../utils/types";

export default {
	createRoom: async (
		req: IRequest,
		res: Response,
		next: Function
	): Promise<any> => {
		try {
			const room = await RoomServices.createRoom(req.body);
			return res.status(201).send({
				error: false,
				code: "ROOM_CREATED",
				message: RoomMessages.ROOM_CREATED,
				data: room,
			});
		} catch (error: any) {
			next(error);
		}
	},
	getRooms: async (
		req: Request,
		res: Response,
		next: Function
	): Promise<any> => {
		try {
			const rooms = await RoomServices.getRooms();
			return res.status(200).json({
				error: false,
				code: "ROOMS_FETCHED",
				message: RoomMessages.ROOMS_FETCHED,
				data: rooms,
			});
		} catch (error: any) {
			next(error);
		}
	},
	getRoomById: async (
		req: Request,
		res: Response,
		next: Function
	): Promise<any> => {
		try {
			const room = await RoomServices.getRoomById(req.params.id);
			return res.status(200).json({
				error: false,
				code: "ROOM_FETCHED",
				message: RoomMessages.ROOM_FETCHED,
				data: room,
			});
		} catch (error: any) {
			next(error);
		}
	},

	getRoomByName: async (
		req: Request,
		res: Response,
		next: Function
	): Promise<any> => {
		try {
			const room = await RoomServices.getRoomByName(req.params.roomname);
			return res.status(200).json({
				error: false,
				code: "ROOM_FETCHED",
				message: RoomMessages.ROOM_FETCHED,
				data: room,
			});
		} catch (error: any) {
			next(error);
		}
	},
	updateRoom: async (
		req: Request,
		res: Response,
		next: Function
	): Promise<any> => {
		try {
			const room = await RoomServices.updateRoom(req.params.id, req.body);
			return res.status(200).json({
				error: false,
				code: "ROOM_UPDATED",
				message: RoomMessages.ROOM_UPDATED,
				data: room,
			});
		} catch (error: any) {
			next(error);
		}
	},
	deleteRoom: async (
		req: Request,
		res: Response,
		next: Function
	): Promise<any> => {
		try {
			const room = await RoomServices.deleteRoom(req.params.id);
			return res.status(200).json({
				error: false,
				code: "ROOM_DELETED",
				message: RoomMessages.ROOM_DELETED,
				data: room,
			});
		} catch (error: any) {
			next(error);
		}
	},
};
