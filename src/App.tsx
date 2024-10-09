import React, { useState } from 'react';
import VideoStreamer from './components/VideoStreamer';
import { Camera, StopCircle } from 'lucide-react';

function App() {
  const [isStreaming, setIsStreaming] = useState(false);

  const toggleStreaming = () => {
    setIsStreaming(!isStreaming);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-8">Video Streaming Platform</h1>
      <div className="bg-white p-8 rounded-lg shadow-md">
        <VideoStreamer isStreaming={isStreaming} />
        <button
          onClick={toggleStreaming}
          className={`mt-4 px-6 py-2 rounded-full font-semibold text-white ${
            isStreaming ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          {isStreaming ? (
            <>
              <StopCircle className="inline-block mr-2" />
              Stop Streaming
            </>
          ) : (
            <>
              <Camera className="inline-block mr-2" />
              Start Streaming
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default App;