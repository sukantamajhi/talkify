import { Request } from 'express';
import { IUser } from '../models/UserModel';

// Extend the Request interface to include a user property
export interface IRequest extends Request {
    user?: IUser;
}

export type IUserWithOneFieldRequired =
    | { email: string; username?: never }
    | { username: string; email?: never };
