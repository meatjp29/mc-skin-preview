import { useEffect, useRef, useState } from "react";

function App() {
	const [imageUrl, setImageUrl] = useState(null); // 画像のURL
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
			setImageUrl(url);
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

	return (
		<div style={{ textAlign: "center", padding: "20px" }}>
			<h2>PNG画像のリアルタイム監視</h2>
			<button onClick={selectImageFile}>画像を選択</button>

			{imageUrl
				? (
					<div>
						<p>選択された画像:</p>
						<img src={imageUrl} alt="Selected PNG" width="300" />
					</div>
				)
				: <p>画像が選択されていません。</p>}
		</div>
	);
}

export default App;
