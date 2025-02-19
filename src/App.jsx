import "./App.css";
import { useEffect, useRef, useState } from "react";
import ReactSkinview3d from "react-skinview3d";
import { WalkingAnimation } from "skinview3d";
import ImagePreview from "./ImagePreview.jsx";

function App() {
	const defaultOption = {
		background: "#ff0000",
	};

	const viewerRef = useRef(null);
	const [skinUrl, setSkinUrl] = useState("/steve.png");

	const [errorMessage, setErrorMessage] = useState("");
	const [background, setBackground] = useState("#f000ff");

	const [fileHandle, setFileHandle] = useState(null); // 選択したファイルハンドル
	const lastModifiedRef = useRef(0); // 最終更新日時
	const [watching, setWatching] = useState(false); // 監視フラグ

	// `showOpenFilePicker` が利用可能かチェック
	const isFilePickerSupported = typeof window !== "undefined" && window.showOpenFilePicker;

	// 画像を選択する
	const selectImageFile = async () => {
		try {
			if (isFilePickerSupported) {
				// File System Access API を使う
				const [handle] = await window.showOpenFilePicker({
					types: [{ description: "PNG Image", accept: { "image/png": [".png"] } }],
				});

				setFileHandle(handle); // ファイルハンドルを保存
				await loadImageFile(handle); // 画像を読み込む
				setWatching(true); // 監視開始
			} else {
				alert("このブラウザはFile System Access APIをサポートしていません。");
			}
		} catch (err) {
			console.error("ファイル選択に失敗:", err);
		}
	};

	// 画像を読み込んで表示する
	const loadImageFile = async (handle) => {
		try {
			if (!handle) return;

			// 最新のファイルデータを取得
			const file = await handle.getFile();
			lastModifiedRef.current = file.lastModified;

			// 画像URLを更新
			const url = URL.createObjectURL(file);
			setSkinUrl(url);
			console.log("PNG画像を読み込みました:", file.name);
		} catch (err) {
			console.error("画像の読み込みに失敗:", err);
		}
	};

	// 画像の変更を監視（選択後に開始）
	useEffect(() => {
		if (!fileHandle || !watching) return;

		console.log("ファイル変更の監視を開始します...");
		const intervalId = setInterval(async () => {
			try {
				const file = await fileHandle.getFile();
				if (file.lastModified !== lastModifiedRef.current) {
					console.log("ファイルが変更されました！再読み込みします。");
					await loadImageFile(fileHandle);
				}
			} catch (err) {
				console.error("ファイルの変更監視エラー:", err);
			}
		}, 2000);

		return () => {
			console.log("ファイル変更の監視を停止しました。");
			clearInterval(intervalId);
		};
	}, [fileHandle, watching]);

	useEffect(() => {
		if (viewerRef.current) {
			viewerRef.current.background = background;
		}
	}, [background]);

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
				<button onClick={() => changeBackgroundColor("#000000")}>黒</button>
				<button onClick={() => changeBackgroundColor("#00ff00")}>緑</button>
				<button onClick={() => changeBackgroundColor("#0000ff")}>青</button>
			</div>

			<div>
				<label>背景色変更:</label>
				<select onChange={(e) => setBackground(e.target.value)} value={background}>
					<option value="#000000">黒</option>
					<option value="#00ff00">緑</option>
					<option value="#0000ff">青</option>
				</select>
			</div>

			{/* PNGファイル選択 */}
			<button onClick={selectImageFile}>画像を選択</button>

			{skinUrl
				? (
					<div>
						<p>選択された画像:</p>
						<ImagePreview src={skinUrl} />
					</div>
				)
				: <p>画像が選択されていません。</p>}

			{/* エラーメッセージ */}
			{errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
		</>
	);
}

export default App;
