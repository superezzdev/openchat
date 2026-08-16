import { useState } from "react";
import Home from "./components/Home";
import VideoChat from "./components/VideoChat";

function App() {
  const [isChatting, setIsChatting] = useState(false);
  const [interests, setInterests] = useState([]);
  const [mode, setMode] = useState('video');
  const [question, setQuestion] = useState("");

  const handleStart = (tags, selectedMode, userQuestion = "") => {
    setInterests(tags);
    setMode(selectedMode);
    setQuestion(userQuestion);
    setIsChatting(true);
  };

  return (
    <div className="w-full min-h-screen bg-xblack font-sans">
      {isChatting ? (
        <VideoChat interests={interests} mode={mode} question={question} onQuit={() => setIsChatting(false)} />
      ) : (
        <Home onStart={handleStart} />
      )}
    </div>
  );
}

export default App;
