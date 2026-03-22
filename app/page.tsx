import AgenticLoaderGallery from "./components/AgenticLoaderGallery";

export default function Home() {
  return (
    <div
      className="gallery-page"
      style={{
        minHeight: "100vh",
        width: "100%",
        maxWidth: "100%",
        boxSizing: "border-box",
        backgroundColor: "#000000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px 120px",
      }}
    >
      <AgenticLoaderGallery />
    </div>
  );
}
