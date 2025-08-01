import { useState, useEffect } from 'react';

export default function Home() {
  const [status, setStatus] = useState('Idle');
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [hasSpeech, setHasSpeech] = useState(true);
  let recognition;

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setStatus('Listening...');
      };

      recognition.onresult = (event) => {
        const result = event.results[0][0].transcript;
        setTranscript(result);
        setStatus(`Command received: "${result}"`);
        if (result.toLowerCase().includes('forward')) setStatus('🚗 Moving Forward');
        else if (result.toLowerCase().includes('reverse')) setStatus('🔁 Reversing');
        else if (result.toLowerCase().includes('stop')) setStatus('⛔ Stopping');
        else setStatus(`Command: "${result}"`);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setStatus('❌ Voice recognition failed');
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };
    } else {
      setHasSpeech(false);
    }
  }, []);

  const startVoiceCommand = () => {
    if (!hasSpeech) {
      setStatus('Speech recognition not supported');
      return;
    }
    try {
      recognition.start();
    } catch {
      setStatus('Already listening');
    }
  };

  const sendUiPathSignal = (signal) => {
    setStatus(`Sending signal: ${signal}`);
    setTimeout(() => setStatus(`Signal "${signal}" executed`), 800);
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-blue-50 p-6">
      <h1 className="text-3xl font-bold text-blue-700 mb-2">🚗 PiBuddy Controller</h1>
      <p className="text-gray-700 mb-6 text-center">Voice & UI Controlled RC Car (ROS2)</p>

      <div className="w-full max-w-sm space-y-4">
        <button
          onClick={startVoiceCommand}
          disabled={isListening}
          className={`w-full py-3 rounded-xl text-white shadow-lg ${
            isListening ? 'bg-yellow-500' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          🎙️ {isListening ? 'Listening...' : 'Start Voice Command'}
        </button>

        <button
          onClick={() => sendUiPathSignal('start_path')}
          className="w-full py-3 bg-green-600 text-white rounded-xl shadow-lg hover:bg-green-700"
        >
          🔁 Start UI Path
        </button>

        <button
          onClick={() => sendUiPathSignal('stop')}
          className="w-full py-3 bg-red-600 text-white rounded-xl shadow-lg hover:bg-red-700"
        >
          ⛔ Stop
        </button>

        <div className="mt-4 text-sm text-gray-700 text-center">
          <p>Status: <span className="font-semibold">{status}</span></p>
          {transcript && <p>📝 Transcript: "{transcript}"</p>}
        </div>
      </div>
    </main>
  );
}
