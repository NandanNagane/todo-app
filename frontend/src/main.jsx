import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

// Disable the error overlay
window.addEventListener('vite:preloadError', (event) => {
  event.preventDefault();
});


createRoot(document.getElementById("root")).render(<App />);
