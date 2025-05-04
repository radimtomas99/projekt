import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Register = ({ onSuccess }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleRegister = async () => {
        try {
            const response = await fetch('http://localhost:8081/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password })
            });

            if (response.ok) {
                const data = await response.json();
                onSuccess(data.userId);
                navigate('/notes');
            } else {
                throw new Error('Registrace selhala');
            }
        } catch (error) {
            console.error("Chyba při registraci:", error);
            alert("Registrace neproběhla úspěšně. Zkuste to znovu.");
        }
    };


    return (
        <div>
            <h2>Register</h2>
            <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <button onClick={handleRegister}>Register</button>
        </div>
    );
};

export default Register;
