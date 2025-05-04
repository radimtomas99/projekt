import React, {use, useState} from 'react';
import { useNavigate } from 'react-router-dom';

const Register = ({ onSuccess }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleRegister = async () => {
        const params = new URLSearchParams();
        params.append('username', username);
        params.append('password', password);

        try {
            const response = await fetch('http://localhost:8081/register', {
                method: 'POST',
                body: params
            });

            if (!response.ok) throw new Error('Registrace selhala');
            
            const message = await response.text();
            console.log("Server says:", message);

            onSuccess();
            navigate('/notes');
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
