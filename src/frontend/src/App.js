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
    const [authToken, setAuthToken] = useState(null); // Keep auth token state
    // Re-introduce currentView state: 'login', 'register', 'notes', 'schedule'
    const [currentView, setCurrentView] = useState('login'); 

    // Check localStorage on initial load and set initial view
    useEffect(() => {
        const storedToken = localStorage.getItem('authToken');
        if (storedToken) {
            setAuthToken(storedToken);
            setCurrentView('notes'); // Start at notes if logged in
        } else {
            setCurrentView('login'); // Start at login if not logged in
        }
    }, []);

    const handleLoginSuccess = (token) => {
        localStorage.setItem('authToken', token);
        setAuthToken(token);
        setCurrentView('notes'); // Go to notes page after login
    };

    const handleRegistrationSuccess = () => {
        alert('Registration successful! Please log in.');
        setCurrentView('login'); // Go to login page after registration
    };

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        setAuthToken(null);
        setCurrentView('login'); // Go to login page after logout
    };

    // Navigation handlers to pass to Navbar
    const navigateToNotes = () => setCurrentView('notes');
    const navigateToSchedule = () => setCurrentView('schedule');
    const navigateToLogin = () => setCurrentView('login');
    const navigateToRegister = () => setCurrentView('register');

    // Render logic based on currentView
    const renderView = () => {
        // If not logged in, only allow login/register views
        if (!authToken) {
            switch (currentView) {
                case 'register':
                    return <Register onSuccess={handleRegistrationSuccess} />;
                case 'login':
                default:
                    return <Login onSuccess={handleLoginSuccess} />;
            }
        }

        // If logged in, allow notes/schedule views
        switch (currentView) {
            case 'schedule':
                return <SchedulePage />;
            case 'notes':
            default: // Default to notes view when logged in
                return <NotesPage />;
        }
    };

    return (
        // Removed Router wrapper
        <>
            <NavbarComponent 
                isLoggedIn={!!authToken} 
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
