import React, { useState, useEffect } from "react";

function VolumeControl({ audioRef }) {
  const [volume, setVolume] = useState(1); // Default volume is 1 (100%)

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume; // Set the audio element's volume
    }
  }, [volume, audioRef]);

  const handleVolumeChange = (event) => {
    setVolume(event.target.value); // Update volume state
  };

  return (
    <div className="volume-control">
      <label htmlFor="volume-slider" className="form-label">
        Volume: {Math.round(volume * 100)}%
      </label>
      <input
        id="volume-slider"
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={volume}
        onChange={handleVolumeChange}
        className="form-range"
      />
    </div>
  );
}

export default VolumeControl;
