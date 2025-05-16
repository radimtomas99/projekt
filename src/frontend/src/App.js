import React, { useState, useEffect } from 'react';
// Removed router imports
// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'; 
import Register from './components/Register';
// Removed NotesPage import
// import NotesPage from './components/NotesPage'; 
import Login from './components/Login';
import SchedulePage from './components/SchedulePage';
import FileSystemPage from './components/FileSystemPage'; // Import FileSystemPage
import NavbarComponent from './components/NavbarComponent';
import './App.css';

// Removed ProtectedRoute component

function App() {
    // Use userId state instead of authToken
    const [currentUserId, setCurrentUserId] = useState(null); 
    // Set default view for logged in users to 'filesystem'
    const [currentView, setCurrentView] = useState('login'); 

    // Check localStorage on initial load and set initial view
    useEffect(() => {
        // Check for userId in localStorage
        const storedUserId = localStorage.getItem('currentUserId'); 
        if (storedUserId) {
            setCurrentUserId(parseInt(storedUserId, 10)); // Parse userId back to integer
            // Set default logged-in view
            setCurrentView('filesystem'); 
        } else {
            setCurrentView('login'); 
        }
    }, []);

    const handleLoginSuccess = (userId) => {
        // Store userId in localStorage
        localStorage.setItem('currentUserId', userId); 
        setCurrentUserId(userId);
        // Navigate to file system after login
        setCurrentView('filesystem'); 
    };

    const handleRegistrationSuccess = () => {
        alert('Registration successful! Please log in.');
        setCurrentView('login'); 
    };

    const handleLogout = () => {
        // Remove userId from localStorage
        localStorage.removeItem('currentUserId'); 
        setCurrentUserId(null);
        setCurrentView('login'); 
    };

    // Renamed navigateToNotes to navigateToFilesystem
    const navigateToFilesystem = () => setCurrentView('filesystem');
    const navigateToSchedule = () => setCurrentView('schedule');
    const navigateToLogin = () => setCurrentView('login');
    const navigateToRegister = () => setCurrentView('register');

    // Render logic based on currentView
    const renderView = () => {
        // Check currentUserId for authentication
        if (!currentUserId) { 
            switch (currentView) {
                case 'register':
                    return <Register onSuccess={handleRegistrationSuccess} />;
                case 'login':
                default:
                    return <Login onSuccess={handleLoginSuccess} />;
            }
        }

        // Render FileSystemPage or SchedulePage when logged in
        switch (currentView) {
            case 'schedule':
                return <SchedulePage userId={currentUserId} />;
            case 'filesystem': // Changed from 'notes'
            default: 
                // Pass userId to FileSystemPage
                return <FileSystemPage userId={currentUserId} />; 
        }
    };

    return (
        // Removed Router wrapper
        <>
            <NavbarComponent 
                isLoggedIn={!!currentUserId} // Update isLoggedIn check
                currentView={currentView}
                onLogout={handleLogout}
                onNavigateToFilesystem={navigateToFilesystem} // Pass renamed handler
                onNavigateToSchedule={navigateToSchedule}
                onNavigateToLogin={navigateToLogin}
                onNavigateToRegister={navigateToRegister}
            />
            <div className="App">
                {renderView()} 
            </div>
        </>
        // Removed Router closing tag
    );
}

export default App;
