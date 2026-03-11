// 700x700 black artboard container centered on screen, hosting the Agentic loader library.

import AgenticLoaderGallery from "./components/AgenticLoaderGallery";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-slate-100">
      <div className="w-[700px] h-[700px] bg-black flex items-center justify-center">
        <AgenticLoaderGallery />
      </div>
    </div>
  );
}

