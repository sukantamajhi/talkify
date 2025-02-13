const MessagesServices = (socket: any, io: any) => {
	socket.on("joinRoom", (data: any) => {
		console.log(data, "<<-- daya pata lagao");
		socket.join(data.room);
	});

	socket.on("sendMessage", (data: any) => {
		console.log(data, "<<-- data");
		io.to(data.room).emit("message", data);
	});

	socket.on("disconnect", () => {
		console.log("User disconnected");
	});
};

export default MessagesServices;
