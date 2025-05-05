import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    api.post('/auth/login', { username, password })
        .then(response => {
          const token = response.data.token;
          localStorage.setItem('token', token);
          alert('Login successful!');
          navigate('/notes'); // přesměruj na stránku s poznámkami
        })
        .catch(error => {
          console.error('Login failed:', error);
          alert('Přihlášení selhalo. Zkontroluj jméno a heslo.');
        });
  };

  return (
      <div>
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
          />
          <br />
          <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
          />
          <br />
          <button type="submit">Login</button>
        </form>
      </div>
  );
};

export default Login;

// Login.jsx
 /*
import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://localhost:8080/login", {
        username,
        password
      });

      // ULOŽ TOKEN
      localStorage.setItem("token", response.data.token);

      // přesměrování nebo něco dalšího
      navigate("/dashboard");
    } catch (error) {
      console.error("Chyba při přihlášení:", error);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input value={username} onChange={(e) => setUsername(e.target.value)} />
      <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" />
      <button type="submit">Login</button>
    </form>
  );
};

export default Login;
*/