window.addEventListener("error", (event) => {
	if (event.error?.message?.includes("Extension context invalidated")) {
		event.preventDefault(); // Empêcher l'erreur d'apparaître dans la console
	}
});
import "./index.css";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")).render(
	<React.StrictMode>
		<App />
	</React.StrictMode>,
);
