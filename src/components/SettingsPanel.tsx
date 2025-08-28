// components/SettingsPanel.tsx
import React, { useState } from "react";
import { useSettings } from "../context/SettingsContext";

const SettingsPanel: React.FC = () => {
  const {
    hueStep,
    setHueStep,
    showLabels,
    setShowLabels,
    linkTypeFilter,
    setLinkTypeFilter,
    availableLinkTypes,
  } = useSettings();

  const [isOpen, setIsOpen] = useState(true);

  const handleHueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    console.log("[SettingsPanel] New hueStep:", value);
    setHueStep(value);
  };

  const handleShowLabelsToggle = () => {
    setShowLabels((prev) => !prev);
    console.log("[SettingsPanel] showLabels:", !showLabels);
  };

  const handleLinkTypeChange = (type: string) => {
    setLinkTypeFilter((prev) => {
      const newFilter = prev.includes(type)
        ? prev.filter((t) => t !== type)
        : [...prev, type];
      console.log("[SettingsPanel] linkTypeFilter:", newFilter);
      return newFilter;
    });
  };

  const togglePanel = () => {
    setIsOpen((prev) => !prev);
    console.log("[SettingsPanel] Panel is now", !isOpen ? "open" : "closed");
  };

  return (
    <>
      {/* Panel avec transition */}
      <div
        className={`absolute top-0 left-0 h-full z-40 bg-gray-900 text-white shadow-lg transition-all duration-300 ${
          isOpen ? "w-64 p-4" : "w-0 p-0 overflow-hidden"
        }`}
      >
        {isOpen && (
          <>
            {/* Bouton toggle à l'intérieur du panel */}
            <button
              onClick={togglePanel}
              className="absolute top-2 right-2 w-6 h-6 bg-gray-700 rounded text-white flex items-center justify-center"
            >
              &lt;
            </button>

            <h2 className="text-xl font-semibold mb-4">Paramètres</h2>

            {/* Hue Step */}
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
                onChange={handleHueChange}
                className="w-full accent-blue-500"
              />
            </div>

            {/* Show labels */}
            <div className="mb-4 flex items-center gap-2">
              <input
                type="checkbox"
                id="showLabels"
                checked={showLabels}
                onChange={handleShowLabelsToggle}
                className="accent-blue-500"
              />
              <label htmlFor="showLabels">Afficher les labels</label>
            </div>

            {/* Filter par type de lien */}
            <div className="mb-4">
              <label className="block mb-2">Types de liens :</label>
              {availableLinkTypes.map((type) => (
                <div key={type} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={linkTypeFilter.includes(type)}
                    onChange={() => handleLinkTypeChange(type)}
                    className="accent-blue-500"
                  />
                  <label>{type}</label>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Bouton toggle flottant lorsque le panel est fermé */}
      {!isOpen && (
        <button
          onClick={togglePanel}
          className="absolute top-4 left-4 z-50 w-8 h-8 bg-gray-700 rounded text-white flex items-center justify-center shadow-lg"
        >
          &gt;
        </button>
      )}
    </>
  );
};

export default SettingsPanel;
