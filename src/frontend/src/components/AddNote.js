import React, { useState } from 'react';
import api from '../services/api'; // místo axios

const AddNote = ({ userId, setUser }) => {
  const [content, setContent] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();

        const newNote = {
            userId,
            content,
        };

        api.post('/notes', newNote) // token bude automaticky přidán
            .then(response => {
                alert('Note added!');
                console.log(response); // Log odpovědi pro debug
                setContent('');
            })
            .catch(error => {
                console.error('Error adding note:', error);
                alert('Chyba při přidávání poznámky.');
            });
    };

    return (
    <div>
      <h2>Add a New Note</h2>
      <form onSubmit={handleSubmit}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Enter note content"
        />
        <button type="submit">Add Note</button>
      </form>
    </div>
  );
};

export default AddNote;
