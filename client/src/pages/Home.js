import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
	const navigate = useNavigate();
	const [room, setRoom] = useState("");
	const warningRef = useRef();

	const handleJoinRoom = () => {
		if (room === "") {
			warningRef.current.innerText = "Please input room name";
			return;
		}
		navigate(`/room?roomName=${room}`);
	};

	return (
		<div>
			<h1>Home Page</h1>
			<p ref={warningRef} style={{ color: "red" }}></p>
			<input
				type={"text"}
				value={room}
				onChange={(e) => setRoom(e.target.value)}
			/>
			<button onClick={handleJoinRoom}>join or create room</button>
		</div>
	);
}
