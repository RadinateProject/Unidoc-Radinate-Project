import React, { useState } from 'react';
import { Sun, Moon } from 'lucide-react'; // Import the icons you want to use

const ToggleDarkMode = () => {
  // Use the useState hook to manage the toggle state (e.g., dark mode enabled or not)
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Function to handle the toggle action
  const handleToggle = () => {
    setIsDarkMode(!isDarkMode); // Toggle the boolean state
  };

  return (
    <button
      onClick={handleToggle}
      className={`p-2 rounded-full transition-colors ${
        isDarkMode ? 'bg-gray-800 text-blue-400' : 'bg-gray-200 text-gray-800'
      }`}
      aria-label="Toggle dark mode"
    >
      {/* Conditionally render the Sun or Moon icon based on the state */}
      {isDarkMode ? (
        <Sun className="h-4 w-4" /> // Icon when toggled ON (dark mode)
      ) : (
        <Moon className="h-4 w-4" /> // Icon when toggled OFF (light mode)
      )}
    </button>
  );
};

export default ToggleDarkMode;
