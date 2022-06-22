import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { Peer } from "peerjs";

export default function Room() {
	const [socket, setSocket] = useState(null);
	const [peer, setPeer] = useState(null);
	const [peerId, setPeerId] = useState(null);
	const [peerIds, setPeerIds] = useState([]);
	const myVideo = useRef();
	const partnerVideo = useRef();

	useEffect(() => {
		// init socket
		const _socket = io("http://localhost:3001");
		setSocket(_socket);

		// init peer
		const _peer = new Peer({
			config: {
				iceServers: [
					{ url: "stun:stun.l.google.com:19302" },
					{
						url: "turn:numb.viagenie.ca",
						credential: "muazkh",
						username: "webrtc@live.com",
					},
				],
			},
		});
		setPeer(_peer);
	}, []);

	useEffect(() => {
		if (socket) {
			socket.on("joinRoom", (id) => {
				const _peerIds = peerIds.concat(id);
				console.log(
					"🚀 ~ file: Room.js ~ line 39 ~ socket.on ~ _peerIds",
					_peerIds
				);
				setPeerIds(_peerIds);
			});
		}
		// eslint-disable-next-line
	}, [socket]);

	// join room
	useEffect(() => {
		if (socket && peerId) {
			socket.emit("joinRoom", {
				peerId,
			});
		}
	}, [socket, peerId]);

	// generate peer id
	useEffect(() => {
		if (peer) {
			peer.on("open", (id) => {
				setPeerId(id);
			});
		}
		// eslint-disable-next-line
	}, [peer]);

	// do call
	useEffect(() => {
		if (peer !== null && peerIds.length > 0 && peerIds[0] !== peerId) {
			navigator.mediaDevices
				.getUserMedia({ video: true, audio: true })
				.then((stream) => {
					myVideo.current.srcObject = stream;
					const call = peer.call(peerIds[0], stream);
					call.on("stream", (remoteStream) => {
						partnerVideo.current.srcObject = remoteStream;
					});
				})
				.catch((err) => {
					console.log("🚀 ~ file: Room.js ~ line 72 ~ useEffect ~ err", err);
				});
		}
		// eslint-disable-next-line
	}, [peerIds]);

	// answer call
	useEffect(() => {
		if (peer) {
			peer.on("call", (call) => {
				navigator.mediaDevices
					.getUserMedia({ video: true })
					.then((stream) => {
						myVideo.current.srcObject = stream;
						call.answer(stream); // Answer the call with an A/V stream.
						call.on("stream", (remoteStream) => {
							partnerVideo.current.srcObject = remoteStream;
						});
						call.on("close", () => {
							partnerVideo.current.srcObject = null;
						});
					})
					.catch((err) => {
						console.log("🚀 ~ file: Room.js ~ line 91 ~ peer.on ~ err", err);
					});
			});
		}
	}, [peer]);

	return (
		<div>
			<h1>Room Page</h1>
			<h2>Peer Id: {peerId}</h2>
			<pre>Peer Ids: {JSON.stringify(peerIds, null, 2)}</pre>
			<video
				style={{
					width: "300px",
					height: "300px",
					backgroundColor: "red",
				}}
				playsInline
				ref={myVideo}
				autoPlay
			/>
			<video
				style={{
					width: "300px",
					height: "300px",
					backgroundColor: "yellow",
				}}
				playsInline
				ref={partnerVideo}
				autoPlay
			/>
		</div>
	);
}
