import React, { useState } from 'react';

const StreamingHeader: React.FC = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  return (
    <header className="bg-black bg-opacity-90 py-4 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-red-600">CineNiche</h1>
            
            {/* Main Navigation */}
            <nav className="hidden md:flex ml-10">
              <ul className="flex space-x-6">
                <li><a href="#" className="text-white hover:text-red-500 transition">Home</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition">Movies</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition">TV Shows</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition">My List</a></li>
              </ul>
            </nav>
          </div>
          
          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              {isSearchOpen ? (
                <div className="flex items-center bg-gray-800 rounded-full overflow-hidden pl-3">
                  <input 
                    type="text" 
                    placeholder="Search titles..." 
                    className="bg-transparent text-white text-sm border-none outline-none py-1 w-40"
                  />
                  <button 
                    onClick={() => setIsSearchOpen(false)}
                    className="p-2 text-gray-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setIsSearchOpen(true)}
                  className="text-gray-300 hover:text-white"
                >
                  🔍
                </button>
              )}
            </div>
            
            {/* User Account */}
            <div className="flex items-center">
              <button className="text-gray-300 hover:text-white">
                <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                  👤
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default StreamingHeader;