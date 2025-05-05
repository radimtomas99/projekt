import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Card, ListGroup, Row, Col, Alert } from 'react-bootstrap';

const NotesPage = () => {
    const [notes, setNotes] = useState([]);
    const [newNote, setNewNote] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        setError(null);
        const fetchNotes = async () => {
            try {
                const response = await fetch('http://localhost:8081/notes');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setNotes(data);
            } catch (e) {
                console.error("Error fetching notes:", e);
                setError('Failed to load notes. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchNotes();
    }, []);

    const handleAddNote = async () => {
        if (!newNote.trim()) return;
        setError(null);

        try {
            const response = await fetch('http://localhost:8081/notes/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ content: newNote })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const addedNote = await response.json();
            setNotes([...notes, addedNote]);
            setNewNote('');
        } catch (e) {
            console.error("Error adding note:", e);
            setError('Failed to add the note. Please try again.');
        }
    };

    return (
        <Container className="py-4">
            <Row className="justify-content-center">
                <Col xs={12} md={10} lg={8}>
                    {error && <Alert variant="danger">{error}</Alert>}

                    <Card className="mb-4 shadow-sm">
                        <Card.Body>
                            <Form onSubmit={(e) => { e.preventDefault(); handleAddNote(); }}>
                                <Form.Group className="mb-3" controlId="addNoteTextarea">
                                    <Form.Control 
                                        as="textarea" 
                                        rows={3}
                                        placeholder="Write your new note here..."
                                        value={newNote}
                                        onChange={(e) => setNewNote(e.target.value)}
                                        required
                                    />
                                </Form.Group>
                                <Button variant="success" type="submit" className="w-100">
                                    Add Note
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>

                    <Card className="shadow-sm border">
                        <Card.Header as="h5">Notes</Card.Header>
                        {loading ? (
                            <Card.Body className="text-center text-muted">Loading notes...</Card.Body>
                        ) : notes.length > 0 ? (
                            <ListGroup variant="flush">
                                {notes.map(note => (
                                    <ListGroup.Item key={note.id} className="text-break py-3">
                                        {note.content}
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        ) : (
                            <Card.Body className="text-center text-muted">No notes yet. Add one above!</Card.Body>
                        )}
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default NotesPage;


/*import { useState, useEffect } from 'react';

const NotesPage = () => {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');

  useEffect(() => {
    // Načteme existující poznámky
    const fetchNotes = async () => {
      const response = await fetch('http://localhost:8081/notes');
      const data = await response.json();
      setNotes(data);
    };

    fetchNotes();
  }, []);

  const handleAddNote = async () => {
    const response = await fetch('http://localhost:8081/notes/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content: newNote })
    });

    if (response.ok) {
      const addedNote = await response.json();
      setNotes([...notes, addedNote]);
      setNewNote('');
    }
  };

  return (
      <div>
        <h2>Your Notes</h2>
        <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Write your note here..."
        />
        <button onClick={handleAddNote}>Add Note</button>
        <ul>
          {notes.map(note => (
              <li key={note.id}>{note.content}</li>
          ))}
        </ul>
      </div>
  );
}

export default NotesPage;
*/