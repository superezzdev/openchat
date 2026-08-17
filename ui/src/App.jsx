import { useState, useEffect, Suspense, lazy } from "react";
import Home from "./components/Home";
const VideoChat = lazy(() => import("./components/VideoChat"));

function App() {
  const [isChatting, setIsChatting] = useState(false);
  const [interests, setInterests] = useState([]);
  const [mode, setMode] = useState('video');
  const [question, setQuestion] = useState("");
  const [onlineCount, setOnlineCount] = useState(0);

  useEffect(() => {
    if (isChatting) return;

    const wsUrl = import.meta.env.VITE_WS_URL || `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'userCount') {
          setOnlineCount(data.count);
        }
      } catch (e) {
        console.error("Error parsing websocket message", e);
      }
    };

    return () => {
      ws.close();
    };
  }, [isChatting]);

  const handleStart = ({ interests: tags, mode: selectedMode, question: userQuestion = "" }) => {
    setInterests(tags);
    setMode(selectedMode);
    setQuestion(userQuestion);
    setIsChatting(true);
  };

  return (
    <div className="w-full min-h-screen bg-xblack font-sans">
      {isChatting ? (
        <Suspense fallback={<div className="w-full min-h-screen flex items-center justify-center text-white bg-xblack">Loading...</div>}>
          <VideoChat interests={interests} mode={mode} question={question} onQuit={() => setIsChatting(false)} />
        </Suspense>
      ) : (
        <Home onlineCount={onlineCount} onStart={handleStart} />
      )}
    </div>
  );
}

export default App;
