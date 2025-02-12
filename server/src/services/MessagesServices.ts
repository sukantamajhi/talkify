const MessagesServices = (socket: any, io: any) => {
	socket.on("joinRoom", (data: any) => {
		socket.join(data.room);
	});

	socket.on("sendMessage", (data: any) => {
		io.to(data.room).emit("message", data);
	});

	socket.on("disconnect", () => {
		console.log("User disconnected");
	});
};

export default MessagesServices;
