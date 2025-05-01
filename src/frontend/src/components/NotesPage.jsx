// NotesPage.jsx
import { useEffect, useState } from "react";
import api from "../services/api"; // Cesta k souboru podle struktury

const NotesPage = () => {
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    api.get("/notes?userId=1")
      .then((res) => setNotes(res.data))
      .catch((err) => console.error("Chyba při načítání poznámek:", err));
  }, []);

  return (
    <div>
      <h1>Moje poznámky</h1>
      {notes.map((note) => (
        <div key={note.id}>{note.title}</div>
      ))}
    </div>
  );
};

export default NotesPage;
