const httpServer = require("http").createServer();
const io = require("socket.io")(httpServer, {
	cors: {
		origin: "*",
	},
});

io.on("connection", (socket) => {
	socket.on("joinRoom", (payload) => {
		socket.join("myRoom");
		io.to("myRoom").emit("joinRoom", payload.peerId);
	});
});

httpServer.listen(3001, (socket) => {
	console.log("🚀 ~ file: app.js ~ line 9 ~ httpServer.listen", 3001);
});
