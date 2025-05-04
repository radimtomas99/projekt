import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import NoteList from './components/NoteList';
import AddNote from './components/AddNote';
import Register from './components/Register';  // Import registrace

function App() {
    const [userId, setUserId] = useState(null); // Uživatel není přihlášen
    const [isRegistered, setIsRegistered] = useState(false); // Stav pro registraci

    // Funkce pro zpracování úspěšné registrace
    const handleRegistrationSuccess = (id) => {
        setUserId(id);  // Nastavení ID uživatele po registraci
        setIsRegistered(true); // Oznámení, že uživatel je registrován
    };

    return (
        <Router>
            <div className="App">
                <h1>Note Keeper</h1>

                <Routes>
                    <Route path="/" element={<Register onSuccess={handleRegistrationSuccess} />} />
                    <Route path="/notes" element={isRegistered ? (
                        <>
                            <AddNote userId={userId} />
                            <NoteList userId={userId} />
                        </>
                    ) : (
                        <Register onSuccess={handleRegistrationSuccess} />
                    )} />
                </Routes>
            </div>
        </Router>
    );

}

export default App;
