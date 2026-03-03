import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Firebase migrated successfully
createRoot(document.getElementById("root")!).render(<App />);
