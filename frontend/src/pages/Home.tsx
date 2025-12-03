import React, { useState } from 'react';
import { Menu, X, BookOpen, LogIn, UserPlus, GraduationCap } from 'lucide-react';
import backgroundImg from '../assets/background.jpg'
import { Link } from 'react-router-dom';

// Mock Navigation Links

// Main App Component (named Home as per your original file)
const Home = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Toggle mobile menu visibility
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="min-h-screen font-sans bg-gray-50" id="home">
      
      {/* 1. Navigation Bar (Fixed Top) */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo */}
            <a href="#home" className="flex items-center space-x-2 text-2xl font-bold text-blue-700">
              <GraduationCap className="w-8 h-8 text-indigo-500" />
              <span>LearnFlow</span>
            </a>
            
            {/* Desktop Links */}
            <div className="hidden md:flex md:space-x-8 items-center">              
              {/* Auth Buttons */}
              <div className="flex space-x-4 ml-6">
                {/* <button className="flex items-center px-4 py-2 text-sm font-semibold text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition duration-150">
                  Login
                </button>
                <button className="flex items-center px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg shadow-lg hover:bg-indigo-700 transition duration-150">
                  Sign Up
                </button> */}
                <Link
                    to="/login"
                    className="flex items-center px-4 py-2 text-sm font-semibold text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition duration-150"
                >
                    <LogIn className="w-4 h-4 mr-1" />
                    Login
                </Link>
                <Link
                    to="/register"
                    className="flex items-center px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg shadow-lg hover:bg-indigo-700 transition duration-150"
                >
                    <UserPlus className="w-4 h-4 mr-1" />
                    Sign up
                </Link>
              </div>
            </div>
            
            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button 
                onClick={toggleMenu} 
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
            
          </div>
        </div>
        
        {/* Mobile Menu Panel */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
              <div className="pt-4 border-t border-gray-100 space-y-2">
                <button className="w-full text-left flex items-center px-3 py-2 rounded-md text-base font-medium text-indigo-600 hover:bg-indigo-50">
                    <LogIn className="w-5 h-5 mr-2" /> Login
                </button>
                <button className="w-full text-left flex items-center px-3 py-2 rounded-md text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700">
                    <UserPlus className="w-5 h-5 mr-2" /> Sign Up
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* 2. Hero Section (Full Height with Background Image) */}
      <header className="relative w-full min-h-screen flex items-center justify-center">
        
        {/* Background Image Container */}
        <div className="absolute inset-0 z-0">
          <img
            // Use a high-quality, relevant image URL
            src={backgroundImg}
            alt="modern background image"
            className="w-full h-full object-cover"
          />
          {/* Dark Overlay for Text Readability (UX best practice) */}
          <div className="absolute inset-0 bg-gray-900 opacity-60"></div>
        </div>

        {/* Hero Content (Z-10 to be above the overlay) */}
        <div className="relative z-10 text-center max-w-3xl px-4">
          <GraduationCap className="mx-auto w-12 h-12 text-yellow-400 mb-4" />
          
          <h1 className="text-5xl sm:text-6xl font-extrabold text-white leading-tight mb-4">
            Master New Skills, Achieve Your Dreams
          </h1>
          
          <p className="text-xl sm:text-2xl text-indigo-200 font-light mb-8 max-w-xl mx-auto">
            Access thousands of courses from top experts anytime, anywhere. Your professional development starts now.
          </p>
          
          {/* Primary Call to Action */}
          <button className="flex items-center justify-center mx-auto px-10 py-4 text-lg font-bold text-white bg-indigo-500 rounded-xl shadow-2xl hover:bg-indigo-600 transition duration-300 transform hover:scale-105">
            <BookOpen className="w-6 h-6 mr-3" />
            
            <Link
                    to="/register"
                    className="flex items-center px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg shadow-lg hover:bg-indigo-700 transition duration-150"
                >
                    <UserPlus className="w-4 h-4 mr-1" />
                    Start learning for free!
                </Link>
          </button>
        </div>
      </header>

      {/* 3. Footer (Simple Placeholder) */}
      <footer className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm shadow-md p-2">
        <div className="text-center">LMS Platform | Designed with Modern UI/UX Principles | © 2025</div>
      </footer>
    </div>
  );
};

export default Home;