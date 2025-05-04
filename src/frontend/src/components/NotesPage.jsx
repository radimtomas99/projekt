import { useState, useEffect } from 'react';

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
