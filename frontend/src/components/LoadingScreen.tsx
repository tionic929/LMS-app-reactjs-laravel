// src/components/LoadingScreen.tsx (New file)
import React from 'react';

const LoadingScreen: React.FC = () => {
    return (
        // Fixed overlay to cover the entire screen
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/10 backdrop-blur-sm transition-opacity duration-500 ease-in-out">
            <div className="text-white text-xl font-semibold p-4 bg-black/40 rounded-lg shadow-2xl animate-pulse">
                Loading User Data...
            </div>
            {/* The backdrop-blur-sm class is key here. 
            The transition-opacity ensures a smooth fade if you manage its visibility 
            via state (though we'll use conditional rendering in ProtectedRoute).
            */}
        </div>
    );
};

export default LoadingScreen;