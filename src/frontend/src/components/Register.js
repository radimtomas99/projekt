import React, { useState } from 'react';
import { Container, Form, Button, Card, Row, Col, Alert } from 'react-bootstrap';

const Register = ({ onSuccess }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleRegister = async () => {
        setError('');

        if (username.length < 4) {
            setError('Username must be at least 4 characters long.');
            return;
        }
        if (password.length < 4) {
            setError('Password must be at least 4 characters long.');
            return;
        }

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `HTTP error! status: ${response.status}`);
            }

            console.log('Backend registration successful:', data.message);
            onSuccess();

        } catch (err) {
            console.error("Registration fetch error:", err);
            setError(err.message || 'Registration failed. Please try again later.');
        }
    };

    return (
        <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: "100vh" }}>
            <Row className="justify-content-center w-100">
                <Col xs={12} md={6} lg={4}>
                    <Card className="shadow-sm">
                        <Card.Body>
                            <h2 className="text-center mb-4">Create Account</h2>
                            {error && <Alert variant="danger">{error}</Alert>}
                            <Form onSubmit={(e) => { e.preventDefault(); handleRegister(); }}>
                                <Form.Group className="mb-3" controlId="registerUsername">
                                    <Form.Label>Username</Form.Label>
                                    <Form.Control 
                                        type="text" 
                                        placeholder="Enter username (min 4 chars)"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required 
                                        isInvalid={!!error && error.includes('Username')}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="registerPassword">
                                    <Form.Label>Password</Form.Label>
                                    <Form.Control 
                                        type="password" 
                                        placeholder="Password (min 4 chars)"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required 
                                        isInvalid={!!error && error.includes('Password')}
                                    />
                                </Form.Group>
                                <Button variant="primary" type="submit" className="w-100 mt-3">
                                    Register
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Register;
