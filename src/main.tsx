import React from "react"; // uses with react.StrictMode
import ReactDOM from "react-dom/client";
import "reflect-metadata"

import App from "./App";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Impossible de trouver l’élément root dans index.html");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  //<React.StrictMode>
    <App />
  //</React.StrictMode>
);