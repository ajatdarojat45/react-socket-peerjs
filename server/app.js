const express = require("express");
const app = express();
const httpServer = require("http").createServer(app);
const io = require("socket.io")(httpServer, {
	cors: {
		origin: "*",
	},
});

app.get("/", (req, res) => {
	res.status(200).json({
		msg: `server is running on port ${process.env.PORT}`,
	});
});

io.on("connection", (socket) => {
	socket.on("joinRoom", (payload) => {
		socket.join(payload.roomName);
		socket.to(payload.roomName).emit("joinRoom", payload.peerId);
	});

	socket.on("leaveRoom", (payload) => {
		socket.leave(payload.roomName);
		socket.to(payload.roomName).emit("leaveRoom", payload.peerId);
	});
});

httpServer.listen(process.env.PORT || 3001, (socket) => {
	console.log(
		"🚀 ~ file: app.js ~ line 9 ~ httpServer.listen",
		process.env.PORT || 3001
	);
});
