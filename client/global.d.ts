interface IRoomDetails {
	_id: string;
	name: string;
	description?: string;
}

export interface IUser {
	_id: string;
	name: string;
	email: string;
	userName: string;
	isActive?: boolean;
	isDeleted?: boolean;
	deletedAt?: Date | null;
	password: string;
	profilePicture?: string;
	lastLogin?: Date | null;
	loginToken?: string | null;
	createdAt?: Date;
	updatedAt?: Date;
}

export interface IMessage {
	_id: string;
	sender: Pick<IUser, "name" | "_id">;
	roomId: string;
	message: string;
	createdAt?: string | Date;
	updatedAt?: string | Date;
}
