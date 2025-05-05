import React, { useState, useEffect } from 'react';
// Removed router imports
// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'; 
import Register from './components/Register';
import NotesPage from './components/NotesPage';
import Login from './components/Login';
import SchedulePage from './components/SchedulePage';
import NavbarComponent from './components/NavbarComponent';
import './App.css';

// Removed ProtectedRoute component

function App() {
    // Use userId state instead of authToken
    const [currentUserId, setCurrentUserId] = useState(null); 
    // Re-introduce currentView state: 'login', 'register', 'notes', 'schedule'
    const [currentView, setCurrentView] = useState('login'); 

    // Check localStorage on initial load and set initial view
    useEffect(() => {
        // Check for userId in localStorage
        const storedUserId = localStorage.getItem('currentUserId'); 
        if (storedUserId) {
            setCurrentUserId(parseInt(storedUserId, 10)); // Parse userId back to integer
            setCurrentView('notes'); 
        } else {
            setCurrentView('login'); 
        }
    }, []);

    const handleLoginSuccess = (userId) => {
        // Store userId in localStorage
        localStorage.setItem('currentUserId', userId); 
        setCurrentUserId(userId);
        setCurrentView('notes'); 
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

    // Navigation handlers to pass to Navbar
    const navigateToNotes = () => setCurrentView('notes');
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

        // Pass currentUserId if needed by child components
        switch (currentView) {
            case 'schedule':
                return <SchedulePage /* userId={currentUserId} */ />; // Pass userId if needed
            case 'notes':
            default: 
                return <NotesPage /* userId={currentUserId} */ />; // Pass userId if needed
        }
    };

    return (
        // Removed Router wrapper
        <>
            <NavbarComponent 
                isLoggedIn={!!currentUserId} // Update isLoggedIn check
                currentView={currentView}
                onLogout={handleLogout}
                onNavigateToNotes={navigateToNotes}
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
