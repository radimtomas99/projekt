import React, { useEffect, useState } from 'react';
import api from '../services/api'; // místo axios

const NoteList = ({ userId }) => {
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    api.get(`/notes?userId=${userId}`)
      .then(response => setNotes(response.data))
      .catch(error => console.error('Error fetching notes:', error));
  }, [userId]);

  return (
    <div>
      <h2>My Notes</h2>
      <ul>
        {notes.map(note => (
          <li key={note.id}>
            <h3>{note.title}</h3>
            <p>{note.content}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NoteList;
