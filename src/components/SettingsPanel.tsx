// components/SettingsPanel.tsx
import React from "react";
import { useSettings } from "../context/SettingsContext";

const SettingsPanel: React.FC = () => {
  const { hueStep, setHueStep } = useSettings();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    console.log("[SettingsPanel] New hueStep:", value);
    setHueStep(value);
  };

  return (
    <div className="absolute left-0 top-0 h-full w-64 bg-gray-900 text-white p-4 shadow-lg z-50">
      <h2 className="text-xl font-semibold mb-4">Paramètres</h2>

      <div className="mb-4">
        <label htmlFor="hueStep" className="block mb-2">
          Hue Step: {hueStep}
        </label>
        <input
          type="range"
          id="hueStep"
          min={1}
          max={100}
          step={1}
          value={hueStep}
          onChange={handleChange}
          className="w-full accent-blue-500"
        />
      </div>
    </div>
  );
};

export default SettingsPanel;
