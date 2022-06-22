import { useNavigate } from "react-router-dom";

export default function Home(props) {
	const navigate = useNavigate();

	const handleJoinRoom = () => {
		navigate("/room");
	};
	return (
		<div>
			<h1>Home Page</h1>
			<button onClick={handleJoinRoom}>join room</button>
		</div>
	);
}
