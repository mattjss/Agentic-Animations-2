import AgenticLoaderGallery from "./components/AgenticLoaderGallery";

export default function Home() {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#000000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <AgenticLoaderGallery />
    </div>
  );
}
