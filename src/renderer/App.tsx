import { MemoryRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";

function Hello() {
  return (
    <>
      <header>
        <h1> Kour-AI</h1>
        <input id="path-input" type="text" placeholder="Enter root directory" />

        <div style={{ paddingLeft: "10px", display: "flex" }}>
          <button id="settings-button" title="Restart Session">
            restart
          </button>
          <button id="settings-button" title="Settings">
            settings
          </button>
        </div>
      </header>

      <div id="chat-container"></div>

      <div id="input-container">
        <textarea id="message-input" placeholder="Type a message..."></textarea>
        <button id="send-button">Send</button>
      </div>
    </  >
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Hello />} />
      </Routes>
    </Router>
  );
}
