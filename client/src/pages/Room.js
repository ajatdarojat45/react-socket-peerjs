import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { Peer } from "peerjs";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function Room() {
	const [socket, setSocket] = useState(null);
	const [mediaStream, setMediaStream] = useState(null);
	const [call, setCall] = useState(null);
	const [isAudio, setIsAudio] = useState(true);
	const [isVideo, setIsVideo] = useState(true);
	const [peer, setPeer] = useState(null);
	const [peerId, setPeerId] = useState(null);
	const [peerIds, setPeerIds] = useState([]);
	const myVideo = useRef();
	const partnerVideo = useRef();
	const statusRef = useRef();
	let [searchParams] = useSearchParams();
	const roomName = searchParams.get("roomName");
	const navigate = useNavigate();

	// check room name
	useEffect(() => {
		if (!roomName) {
			navigate("/");
		}
		// eslint-disable-next-line
	}, []);

	// initiate
	useEffect(() => {
		// init socket
		const _socket = io("https://webrtc-react-api.glitch.me");
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

	// listen socket emit
	useEffect(() => {
		if (socket) {
			socket.on("joinRoom", (id) => {
				const _peerIds = peerIds.concat(id);
				setPeerIds(_peerIds);
			});

			socket.on("leaveRoom", (id) => {
				const _peerIds = peerIds.filter((e) => e !== id);
				setPeerIds(_peerIds);
				statusRef.current.innerText = "Call Ended";
				partnerVideo.current.srcObject = null;
			});
		}
		// eslint-disable-next-line
	}, [socket]);

	// get media stream
	useEffect(() => {
		(async () => {
			// create audio and video constraints
			const constraintsVideo = {
				audio: false,
				video: true,
			};
			const constraintsAudio = { audio: true };

			// create audio and video streams separately
			const audioStream = await navigator.mediaDevices.getUserMedia(
				constraintsAudio
			);
			const videoStream = await navigator.mediaDevices.getUserMedia(
				constraintsVideo
			);

			// combine the streams
			const combinedStream = new MediaStream([
				...videoStream.getVideoTracks(),
				...audioStream.getAudioTracks(),
			]);

			setMediaStream(combinedStream);
		})();

		// navigator.mediaDevices
		// 	.getUserMedia({ video: isVideo, audio: isAudio })
		// 	.then((stream) => {
		// 		setMediaStream(stream);
		// 	})
		// 	.catch((err) => {
		// 		console.log("🚀 ~ file: Room.js ~ line 72 ~ useEffect ~ err", err);
		// 	});
		// eslint-disable-next-line
	}, []);

	// show my stream
	useEffect(() => {
		myVideo.current.srcObject = mediaStream;
	}, [mediaStream]);

	// join room
	useEffect(() => {
		if (socket && peerId) {
			socket.emit("joinRoom", {
				peerId,
				roomName,
			});
		}
		// eslint-disable-next-line
	}, [socket, peerId]);

	// generate peer id
	useEffect(() => {
		if (peer) {
			peer.on("open", (id) => {
				setPeerId(id);
				statusRef.current.innerText = "Status: Waiting for connection";
			});

			peer.on("error", (error) => {
				statusRef.current.innerText = error;
			});

			peer.on("connection", (peer) => {
				statusRef.current.innerText = "Status: Connected";
			});
		}
		// eslint-disable-next-line
	}, [peer]);

	// do call
	useEffect(() => {
		if (peer !== null && peerIds.length > 0 && peerIds[0] !== peerId) {
			const _call = peer.call(peerIds[0], mediaStream);
			setCall(_call);
			statusRef.current.innerText = "Call connected";
		}
		// eslint-disable-next-line
	}, [peerIds]);

	// listen peer call
	useEffect(() => {
		if (peer) {
			peer.on("call", (_call) => {
				setCall(_call);
				statusRef.current.innerText = "Call received";
			});
		}
	}, [peer]);

	// answer and stream call
	useEffect(() => {
		if (call) {
			call.on("stream", (remoteStream) => {
				partnerVideo.current.srcObject = remoteStream;
			});
			call.answer(mediaStream);
			statusRef.current.innerText = "Call connected";
		}
		// eslint-disable-next-line
	}, [call]);

	// endcall
	const handleEndCall = () => {
		if (call) {
			call.close();
			statusRef.current.innerText = "Call ended";
			myVideo.current.srcObject = null;
			socket.emit("leaveRoom", {
				peerId,
				roomName,
			});
			mediaStream.getTracks().forEach(function(track) {
				track.stop();
			});
			navigate("/");
		}
	};

	return (
		<div>
			<h1>Room Page</h1>
			<h2>Peer Id: {peerId}</h2>
			<p ref={statusRef}></p>
			<p>Video: {isVideo ? "On" : "Off"}</p>
			<p>Audio: {isAudio ? "On" : "Off"}</p>
			<button onClick={handleEndCall}>End call</button>
			<button
				onClick={() => {
					mediaStream.getAudioTracks()[0].enabled = !mediaStream.getAudioTracks()[0]
						.enabled;
					setIsAudio(!isAudio);
				}}
			>
				{isAudio ? "Audio: Off" : "Audio: On"}
			</button>
			<button
				onClick={() => {
					mediaStream.getVideoTracks()[0].enabled = !mediaStream.getVideoTracks()[0]
						.enabled;
					setIsVideo(!isVideo);
				}}
			>
				{isVideo ? "Video: Off" : "Video: On"}
			</button>
			<br />
			<br />
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
