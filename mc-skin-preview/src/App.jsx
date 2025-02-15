import "./App.css";
import { useState,useEffect } from "react";
import reactLogo from "./assets/react.svg";
import ReactSkinview3d from "react-skinview3d";
import { WalkingAnimation } from "skinview3d"; // WalkingAnimationをインポート

function App() {

  const defaultOption = {
    background: "#ff0000",  // 初期背景色
  }

  const [count, setCount] = useState(0);
  const [skinUrl, setSkinUrl] = useState("/steve.png");
  const [errorMessage, setErrorMessage] = useState("");
  const [options, setOptions] = useState(defaultOption);
  const [background, setBackground] = useState("#ff0000");

useEffect(() => {
  setOptions((prevOptions) => ({
    ...prevOptions,
    background,
  }));
}, [background]);

  // ファイル選択時に呼び出される関数
  const handleFileChange = (event) => {
    const file = event.target.files[0]; // 選択されたファイル
    if (file) {
      // PNG形式かどうかをチェック
      if (file.type !== "image/png") {
        setErrorMessage("選択されたファイルはPNG形式ではありません。");
        return;
      }

      // 画像のサイズをチェック
      const img = new Image();
      img.onload = () => {
        if ((img.width === 64 && img.height === 64) || (img.width === 64 && img.height === 32)) {
          const url = URL.createObjectURL(file); // ローカルURLを作成
          setSkinUrl(url); // スキンURLを更新
          setErrorMessage(""); // エラーメッセージをクリア
        } else {
          setErrorMessage("Minecraftのスキンは64x64または64x32のサイズである必要があります。");
        }
      };
      img.onerror = () => {
        setErrorMessage("画像の読み込みに失敗しました。");
      };
      img.src = URL.createObjectURL(file); // 画像を読み込む
    }
  };

  // 背景色を変更する関数
const changeBackgroundColor = (color) => {
  setBackground(color);
  console.log("背景色変更:", color); // デバッグ用
};

  return (
    <>
      {/* 3Dスキン表示コンポーネント */}
      <ReactSkinview3d 
        skinUrl={skinUrl} 
        height="500" 
        width="500" 
        options={options}
        onReady={({ viewer }) => {
          viewer.animation = new WalkingAnimation();
          viewer.autoRotate = true;
        }}
      />

      {/* 背景色変更ボタン */}
      <div>
        <button onClick={() => changeBackgroundColor("#ff0000")}>赤</button>
        <button onClick={() => changeBackgroundColor("#00ff00")}>緑</button>
        <button onClick={() => changeBackgroundColor("#0000ff")}>青</button>
      </div>

      {/* PNGファイル選択ボタン */}
      <input type="file" accept="image/png" onChange={handleFileChange} />

      {/* エラーメッセージの表示 */}
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
    </>
  );
}

export default App;
