import React, { useState, useEffect } from 'react';
import GameCanvas from './components/GameCanvas';
import Overlay from './components/Overlay';
import { GameStatus, ActivePowerUp } from './types';
import { generateSantaVerdict } from './services/geminiService';

const App: React.FC = () => {
  const [status, setStatus] = useState<GameStatus>(GameStatus.START);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [stamina, setStamina] = useState(100);
  const [powerUps, setPowerUps] = useState<ActivePowerUp[]>([]);
  const [santaVerdict, setSantaVerdict] = useState<string>("");
  const [isGeneratingVerdict, setIsGeneratingVerdict] = useState(false);
  // Game ID to force remount on restart
  const [gameId, setGameId] = useState(0);

  // Load high score
  useEffect(() => {
    const saved = localStorage.getItem('northernLights_highscore');
    if (saved) setHighScore(parseInt(saved));
  }, []);

  const handleStart = () => {
    // Increment ID to force full remount of Canvas
    setGameId(prev => prev + 1);
    setStatus(GameStatus.PLAYING);
    setScore(0);
    setStamina(100);
    setPowerUps([]);
    setSantaVerdict("");
  };

  const handleGameOver = async (finalScore: number, presentsCollected: number) => {
    setStatus(GameStatus.GAME_OVER);
    if (finalScore > highScore) {
      setHighScore(finalScore);
      localStorage.setItem('northernLights_highscore', finalScore.toString());
    }

    setIsGeneratingVerdict(true);
    const verdict = await generateSantaVerdict(finalScore, presentsCollected);
    setSantaVerdict(verdict);
    setIsGeneratingVerdict(false);
  };

  const handleScoreUpdate = (newScore: number) => {
    setScore(newScore);
  };

  const handleStaminaUpdate = (val: number) => {
    setStamina(val);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-slate-900">
      <GameCanvas 
        key={gameId}
        status={status} 
        onGameOver={handleGameOver}
        onScoreUpdate={handleScoreUpdate}
        onStaminaUpdate={handleStaminaUpdate}
        setPowerUps={setPowerUps}
      />
      <Overlay 
        status={status}
        score={score}
        highScore={highScore}
        stamina={stamina}
        powerUps={powerUps}
        santaVerdict={santaVerdict}
        isGeneratingVerdict={isGeneratingVerdict}
        onStart={handleStart}
        onRestart={handleStart}
      />
    </div>
  );
};

export default App;