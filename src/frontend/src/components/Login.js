import React, { useState } from 'react';
import { Container, Form, Button, Card, Row, Col, Alert } from 'react-bootstrap';

const Login = ({ onSuccess }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async () => {
        setError(''); // Clear previous errors
        // Basic validation
        if (!username || !password) {
            setError('Please enter both username and password.');
            return;
        }

        // --- Actual API Call --- 
        try {
            const response = await fetch('/api/auth/login', { // Use relative path or full URL
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json', // Send JSON
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json(); // Attempt to parse JSON regardless of status

            if (!response.ok) {
                // Use message from backend if available, otherwise generic based on status
                let errorMessage = data?.message || 'Login failed. Please check credentials.';
                if (response.status === 401) { // Unauthorized
                   errorMessage = data?.message || 'Invalid username or password.';
                } else if (response.status >= 500) {
                   errorMessage = 'Server error during login. Please try again later.';
                }
                throw new Error(errorMessage);
            }

            // Extract userId from the response data
            const userId = data.userId; 
            
            if (!userId) {
                throw new Error('Login successful, but no userId received from server.');
            }

            console.log('Backend login successful, userId:', userId);
            onSuccess(userId); // Pass userId back to App.js

        } catch (err) {
            console.error("Login fetch error:", err);
            // Display the error message caught from the fetch block
            setError(err.message || 'An unexpected error occurred during login.');
        }
        // --- End Actual API Call ---
    };

    return (
        <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: "100vh" }}>
            <Row className="justify-content-center w-100">
                <Col xs={12} md={6} lg={4}>
                    <Card className="shadow-sm">
                        <Card.Body>
                            <h2 className="text-center mb-4">Login</h2>
                            {error && <Alert variant="danger">{error}</Alert>}
                            <Form onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
                                <Form.Group className="mb-3" controlId="loginUsername">
                                    <Form.Label>Username</Form.Label>
                                    <Form.Control 
                                        type="text" 
                                        placeholder="Enter username" 
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required 
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="loginPassword">
                                    <Form.Label>Password</Form.Label>
                                    <Form.Control 
                                        type="password" 
                                        placeholder="Password" 
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required 
                                    />
                                </Form.Group>
                                
                                <Button variant="primary" type="submit" className="w-100 mt-3">
                                    Login
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Login; 