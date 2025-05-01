import React, {useEffect, useState} from 'react';
import NoteList from './components/NoteList';
import AddNote from './components/AddNote';


function App() {
  const [userId, setUserId] = useState(1); // Například hardcodovaná ID uživatele, později to může být z autentifikace




  return (
    <div className="App">
      <h1>Note Keeper</h1>
        {users}
      <AddNote userId={userId} />
      <NoteList userId={userId} />
    </div>
  );
}

export default App;
