import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';

// Added navigation handlers (e.g., onNavigateToNotes) as props
const NavbarComponent = ({ 
    isLoggedIn, 
    currentView, // To disable link for current view
    onLogout, 
    onNavigateToFilesystem, // Renamed prop
    onNavigateToSchedule, 
    onNavigateToLogin, 
    onNavigateToRegister
}) => {

    const handleLogoutClick = () => {
        onLogout(); // Logout logic is handled in App.js
        // No navigation needed here, App.js will change view
    };

    return (
        <Navbar bg="light" expand="lg" className="mb-4 shadow-sm">
            <Container>
                <Navbar.Brand 
                    onClick={isLoggedIn ? onNavigateToFilesystem : onNavigateToLogin}
                    style={{ cursor: 'pointer' }} // Make brand clickable
                >
                    Note Keeper
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        {isLoggedIn && (
                            <>
                                <Nav.Link 
                                    onClick={onNavigateToFilesystem} // Use renamed prop
                                    disabled={currentView === 'filesystem'} // Check against 'filesystem'
                                >
                                    My Files
                                </Nav.Link>
                                <Nav.Link 
                                    onClick={onNavigateToSchedule} 
                                    disabled={currentView === 'schedule'} // Disable if already on schedule
                                >
                                    Schedule
                                </Nav.Link>
                            </>
                        )}
                    </Nav>
                    <Nav>
                        {isLoggedIn ? (
                            <Button variant="outline-secondary" onClick={handleLogoutClick}>
                                Logout
                            </Button>
                        ) : (
                            <>
                                {currentView !== 'login' && 
                                    <Nav.Link onClick={onNavigateToLogin}>Login</Nav.Link>
                                }
                                {currentView !== 'register' && 
                                    <Nav.Link onClick={onNavigateToRegister}>Register</Nav.Link>
                                }
                            </>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default NavbarComponent; 