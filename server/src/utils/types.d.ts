import { Request } from "express";
import { DefaultEventsMap, Socket } from "socket.io";
import { IUser } from "../models/UserModel";

// Extend the Request interface to include a user property
export interface IRequest extends Request {
	user?: IUser;
}

export type IUserWithOneFieldRequired =
	| { email: string; username?: never }
	| { username: string; email?: never };

export interface ISocketUser extends Socket {
	user?: IUser;
}

export type genTokenPayload =
	| string
	| Record<string, any>
	| Array<string | any>;
