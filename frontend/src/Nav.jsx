import React, { useState } from 'react';
import { ShoppingCart, User, Sun, Moon, ChevronDown } from 'lucide-react';
import img from "./Photos/logo.png";

function Nav() {
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState("English");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleDarkMode = () => setDarkMode(!darkMode);
  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  return (
    <nav className={`p-4 shadow-lg ${darkMode ? "bg-gray-900 text-white" : "bg-white text-black"}`}>
      <div className="container mx-auto flex justify-between items-center">
        
        <div className="flex items-center space-x-2">
          <img src={img} alt="farm2bag logo" className="h-12" />
          <span className="text-xl font-extrabold">farm2bag</span>
        </div>

        <div className="flex-1 mx-4">
          <input
            type="text"
            placeholder="What are you looking..."
            className="w-11/12  px-4 py-2 border focus:outline-black rounded-lg text-black"
          />
        </div>

        <div className="flex items-center space-x-12">
          
          
          <div className="relative cursor-pointer">
            <ShoppingCart size={24} className="text-gray-700 dark:text-black" />
            <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-1 rounded-full">0</span>
          </div>

          <div className="relative">
            <button onClick={toggleDropdown} className="flex items-center space-x-2 border p-2 rounded-lg">
              <span>{language}</span>
              <ChevronDown size={16} />
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-32 bg-white text-black border rounded-lg shadow-lg">
                {["Tamil", "Hindi", "Telugu"].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => { setLanguage(lang); setDropdownOpen(false); }}
                    className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                  >
                    {lang}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button onClick={toggleDarkMode} className="p-2 border rounded-lg">
            {darkMode ? <Sun size={24} className="text-yellow-400" /> : <Moon size={24} className="text-gray-700" />}
          </button>

          <button className="flex items-center space-x-2 border px-4 py-2 rounded-lg hover:bg-gray-100 ">
            <User size={24} />
            <span>Sign In</span>
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Nav;
