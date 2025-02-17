import styles from "./ImagePreview.module.css";

const ImagePreview = ({ src, alt = "Image Preview" }) => {
	return <img className={styles.image} src={src} alt={alt} />;
};

export default ImagePreview;
