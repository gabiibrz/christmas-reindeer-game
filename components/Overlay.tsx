import React from 'react';
import { GameStatus, ActivePowerUp } from '../types';
import { STAMINA_MAX } from '../constants';
import { Zap, Magnet, Wind, Star } from 'lucide-react';

interface OverlayProps {
  status: GameStatus;
  score: number;
  highScore: number;
  stamina: number;
  powerUps: ActivePowerUp[];
  santaVerdict: string;
  isGeneratingVerdict: boolean;
  onStart: () => void;
  onRestart: () => void;
}

const Overlay: React.FC<OverlayProps> = ({ 
  status, score, highScore, stamina, powerUps, santaVerdict, isGeneratingVerdict, onStart, onRestart 
}) => {
  const isPlaying = status === GameStatus.PLAYING;
  
  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6">
      
      {/* HUD */}
      <div className="flex justify-between items-start pointer-events-auto">
        <div className="flex flex-col gap-2">
            <div className="bg-slate-900/50 p-4 rounded-xl backdrop-blur-sm border border-slate-700 text-white">
                <p className="text-sm font-bold text-slate-400">SCORE</p>
                <p className="text-3xl font-mono font-bold text-yellow-400 drop-shadow-lg">{Math.floor(score)}</p>
                <p className="text-xs text-slate-500 mt-1">BEST: {Math.floor(highScore)}</p>
            </div>
            
            {/* PowerUps Display */}
            <div className="flex gap-2 mt-2">
                {powerUps.map((p, i) => {
                    let Icon = Zap;
                    let color = 'text-yellow-400';
                    let bg = 'bg-yellow-400/20';
                    if (p.type === 'MAGNET') { Icon = Magnet; color = 'text-red-400'; bg = 'bg-red-400/20'; }
                    if (p.type === 'SPEED') { Icon = Wind; color = 'text-blue-400'; bg = 'bg-blue-400/20'; }
                    if (p.type === 'FLOAT') { Icon = Zap; color = 'text-purple-400'; bg = 'bg-purple-400/20'; }
                    if (p.type === 'SCORE_MULTIPLIER') { Icon = Star; color = 'text-amber-400'; bg = 'bg-amber-400/20'; }
                    
                    return (
                        <div key={i} className={`p-2 rounded-full ${bg} border border-white/10 animate-pulse`}>
                            <Icon className={`w-5 h-5 ${color}`} />
                        </div>
                    );
                })}
            </div>
        </div>

        {isPlaying && (
            <div className="w-48 bg-slate-900/50 p-3 rounded-xl backdrop-blur-sm border border-slate-700">
                <div className="flex justify-between text-xs text-white mb-1 font-bold">
                    <span>MAGIC DUST</span>
                    <span>{Math.floor(stamina)}%</span>
                </div>
                <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-gradient-to-r from-blue-400 to-purple-500 transition-all duration-200"
                        style={{ width: `${(stamina / STAMINA_MAX) * 100}%` }}
                    />
                </div>
            </div>
        )}
      </div>

      {/* Start Screen */}
      {status === GameStatus.START && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-auto bg-black/40 backdrop-blur-sm">
          <div className="bg-slate-900/90 p-8 rounded-3xl border-2 border-slate-600 text-center max-w-md shadow-2xl">
            <h1 className="text-6xl text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-green-500 font-bold mb-4 drop-shadow-[0_2px_2px_rgba(255,255,255,0.3)] festive-font">
                Northern Lights Dash
            </h1>
            <p className="text-slate-300 mb-8 text-lg">
                Hold <span className="text-yellow-400 font-bold">SPACE</span> or <span className="text-yellow-400 font-bold">TAP</span> to fly.
                <br/>
                Avoid falling. Collect presents!
            </p>
            <button 
                onClick={onStart}
                className="px-8 py-4 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-bold text-xl rounded-full transition-transform hover:scale-105 shadow-lg shadow-red-900/50"
            >
                START FLIGHT
            </button>
          </div>
        </div>
      )}

      {/* Game Over Screen */}
      {status === GameStatus.GAME_OVER && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-auto bg-black/60 backdrop-blur-md">
           <div className="bg-slate-900/95 p-8 rounded-3xl border-2 border-red-900/50 text-center max-w-lg shadow-2xl animate-in fade-in zoom-in duration-300">
            <h2 className="text-5xl text-red-500 font-bold mb-2 festive-font">Run Ended</h2>
            <div className="text-3xl font-mono text-white font-bold mb-6">{Math.floor(score)} pts</div>
            
            <div className="bg-slate-800/50 p-4 rounded-xl mb-6 text-left">
                <p className="text-xs text-slate-400 uppercase tracking-widest mb-2 font-bold">Santa's Verdict</p>
                {isGeneratingVerdict ? (
                    <div className="flex items-center gap-2 text-slate-300 animate-pulse">
                        <Star className="w-4 h-4 text-yellow-500" /> Checking the list...
                    </div>
                ) : (
                    <p className="text-slate-200 italic font-serif leading-relaxed">"{santaVerdict}"</p>
                )}
            </div>

            <button 
                onClick={onRestart}
                className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-bold text-lg rounded-full transition-transform hover:scale-105 shadow-lg shadow-green-900/50"
            >
                TRY AGAIN
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Overlay;
