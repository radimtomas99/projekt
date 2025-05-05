import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; // Import default calendar styles
import { Container, Row, Col, Card, Form, Button, Alert, ListGroup } from 'react-bootstrap';

const SchedulePage = () => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [eventName, setEventName] = useState('');
    const [eventColor, setEventColor] = useState('blue'); // Default color
    const [events, setEvents] = useState([]); // Store events for the selected month
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    // Function to format date to YYYY-MM-DD for API
    const formatDateForAPI = (date) => {
        return date.toISOString().split('T')[0];
    }

    // Fetch events when the component mounts or the selected month/year changes
    useEffect(() => {
        fetchEventsForMonth(selectedDate.getFullYear(), selectedDate.getMonth() + 1);
    }, [selectedDate]); // Re-fetch when selectedDate changes

    const fetchEventsForMonth = async (year, month) => {
        setLoading(true);
        setError(null);
        const userId = localStorage.getItem('currentUserId'); // Get userId
        
        if (!userId) { // Check if userId exists
             setError('User ID not found. Please log in again.');
             setLoading(false);
             return;
        }

        try {
            // Add userId as query parameter
            const response = await fetch(`/api/schedule/events?year=${year}&month=${month}&userId=${userId}`, { 
                headers: {
                    // No Authorization header needed anymore
                    'Accept': 'application/json'
                }
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch events');
            }
            setEvents(data);
        } catch (err) {
            console.error("Error fetching events:", err);
            setError(err.message || 'Could not load events.');
            setEvents([]); // Clear events on error
        } finally {
            setLoading(false);
        }
    };

    const handleDateChange = (newDate) => {
        setSelectedDate(newDate);
        // Fetching logic is now handled by useEffect
    };

    const handleAddEvent = async (e) => {
        e.preventDefault();
        setError(null);
        if (!eventName.trim()) {
            setError('Event name cannot be empty.');
            return;
        }

        const userId = localStorage.getItem('currentUserId'); // Get userId
        if (!userId) {
            setError('Authentication error: User ID not found. Please log in again.');
            return; 
        }
        
        const eventData = {
            userId: parseInt(userId, 10), // Include parsed userId
            eventName: eventName,
            eventDate: formatDateForAPI(selectedDate),
            eventColor: eventColor
        };

        try {
            const response = await fetch('/api/schedule/events', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                    // No Authorization header needed anymore
                },
                body: JSON.stringify(eventData) // Send object including userId
            });
            
            // Check if response is JSON before parsing
            const contentType = response.headers.get("content-type");
            let data;
            if (contentType && contentType.indexOf("application/json") !== -1) {
                data = await response.json();
            } else {
                // Handle non-JSON responses (like plain text errors from proxy/server)
                const textData = await response.text();
                throw new Error(textData || `Received non-JSON response with status: ${response.status}`);
            }

            if (!response.ok) {
                 // Use message from parsed JSON data
                throw new Error(data.message || `Failed to add event with status: ${response.status}`);
            }
            
            fetchEventsForMonth(selectedDate.getFullYear(), selectedDate.getMonth() + 1);
            setEventName(''); 
        } catch (err) {
            console.error("Error adding event:", err);
            setError(err.message || 'Could not add event.');
        }
    };
    
    // Function to render content within each calendar tile (day cell)
    const tileContentFunc = ({ date, view }) => {
        // Only add indicators on the month view
        if (view === 'month') {
            const dateStr = formatDateForAPI(date);
            const eventsOnThisDay = events.filter(event => event.eventDate === dateStr);
            
            if (eventsOnThisDay.length > 0) {
                // Use the color of the *first* event for the dot, or a default
                const dotColor = eventsOnThisDay[0].eventColor || '#dc3545'; 
                return (
                    <div className="event-indicator">
                        <span className="event-dot" style={{ backgroundColor: dotColor }}></span>
                        <span className="event-count">{eventsOnThisDay.length}</span>
                    </div>
                );
            }
        }
        return null; // Return null if no events or not in month view
    };
    
    // Filter events for the currently selected single date for display below calendar
    const eventsForSelectedDate = events.filter(event => 
        event.eventDate === formatDateForAPI(selectedDate)
    );

    return (
        <Container className="py-4 mt-3"> 
            <Row className="justify-content-center">
                <Col xs={12} md={10} lg={8}>
                    <h2 className="text-center mb-4">Schedule</h2>
                    {error && <Alert variant="danger">{error}</Alert>}
                    
                    {/* Calendar Card */}
                    <Card className="shadow-sm border mb-4">
                        <Card.Body className="d-flex justify-content-center">
                            <Calendar 
                                onChange={handleDateChange} 
                                value={selectedDate} 
                                tileContent={tileContentFunc} // Pass the function here
                            />
                        </Card.Body>
                    </Card>

                    {/* Add Event Form Card */}
                    <Card className="shadow-sm border mb-4">
                        <Card.Header>Add Event for {selectedDate.toLocaleDateString()}</Card.Header>
                        <Card.Body>
                            <Form onSubmit={handleAddEvent}>
                                <Form.Group className="mb-3" controlId="eventName">
                                    <Form.Label>Event Name</Form.Label>
                                    <Form.Control 
                                        type="text" 
                                        placeholder="Enter event name"
                                        value={eventName}
                                        onChange={(e) => setEventName(e.target.value)}
                                        required
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="eventColor">
                                    <Form.Label>Color</Form.Label>
                                    <Form.Select 
                                        value={eventColor} 
                                        onChange={(e) => setEventColor(e.target.value)}>
                                        <option value="blue">Blue</option>
                                        <option value="green">Green</option>
                                        <option value="red">Red</option>
                                        <option value="yellow">Yellow</option>
                                    </Form.Select>
                                </Form.Group>

                                <Button variant="primary" type="submit">Add Event</Button>
                            </Form>
                        </Card.Body>
                    </Card>

                    {/* Display Events for Selected Date */}
                     <Card className="shadow-sm border">
                         <Card.Header>Events for {selectedDate.toLocaleDateString()}</Card.Header>
                         {loading ? (
                             <Card.Body>Loading...</Card.Body>
                         ) : eventsForSelectedDate.length > 0 ? (
                             <ListGroup variant="flush">
                                 {eventsForSelectedDate.map(event => (
                                     <ListGroup.Item key={event.eventId} style={{ borderLeft: `5px solid ${event.eventColor}` }}>
                                         {event.eventName}
                                     </ListGroup.Item>
                                 ))}
                             </ListGroup>
                         ) : (
                            <Card.Body className="text-muted">No events for this date.</Card.Body>
                         )}
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default SchedulePage; 