import "./App.css";
import { useEffect, useRef, useState } from "react";
import ReactSkinview3d from "react-skinview3d";
import { WalkingAnimation } from "skinview3d";

function App() {
	const defaultOption = {
		background: "#ff0000",
	};
	const viewerRef = useRef(null);
	const [skinUrl, setSkinUrl] = useState("/steve.png");
	const [errorMessage, setErrorMessage] = useState("");
	const [background, setBackground] = useState("#f000ff");
	const [socket, setSocket] = useState(null);

	useEffect(() => {
		if (viewerRef.current) {
			viewerRef.current.background = background;
		}
	}, [background]);

	// ファイル選択時の処理
	const handleFileChange = (event) => {
		const file = event.target.files[0];
		if (file) {
			if (file.type !== "image/png") {
				setErrorMessage("選択されたファイルはPNG形式ではありません。");
				return;
			}

			const img = new Image();
			img.onload = () => {
				if ((img.width === 64 && img.height === 64) || (img.width === 64 && img.height === 32)) {
					const url = URL.createObjectURL(file);
					setSkinUrl(url);
					setErrorMessage("");

					console.log(JSON.stringify({ type: "skin_update", skinUrl: url }));

					// WebSocketでサーバーへ送信
					if (socket && socket.readyState === WebSocket.OPEN) {
						socket.send(JSON.stringify({ type: "skin_update", skinUrl: url }));
					}
				} else {
					setErrorMessage("Minecraftのスキンは64x64または64x32のサイズである必要があります。");
				}
			};
			img.onerror = () => {
				setErrorMessage("画像の読み込みに失敗しました。");
			};
			img.src = URL.createObjectURL(file);
		}
	};

	function changeBackgroundColor(color) {
		setBackground(color);
	}

	return (
		<>
			<ReactSkinview3d
				skinUrl={skinUrl}
				height="500"
				width="500"
				onReady={({ viewer }) => {
					viewer.animation = new WalkingAnimation();
					viewer.autoRotate = true;
					viewer.background = background;
					viewerRef.current = viewer;
				}}
			/>

			<div>
				<button onClick={() => changeBackgroundColor("#ff0000")}>赤</button>
				<button onClick={() => changeBackgroundColor("#00ff00")}>緑</button>
				<button onClick={() => changeBackgroundColor("#0000ff")}>青</button>
			</div>

			{/* PNGファイル選択 */}
			<input type="file" accept="image/png" onChange={handleFileChange} />

			{/* エラーメッセージ */}
			{errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
		</>
	);
}

export default App;
