package cz.osu.pesa.swi125.service;

import org.springframework.beans.factory.annotation.Autowired;
import cz.osu.pesa.swi125.model.entity.Note;
import cz.osu.pesa.swi125.model.repository.NoteRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NoteService {

    private final NoteRepository noteRepository;

    @Autowired
    public NoteService(NoteRepository noteRepository) {
        this.noteRepository = noteRepository;
    }

    // Přidání poznámky
    public Note addNote(Note note) {
        return noteRepository.save(note);
    }

    // Získání všech poznámek
    public List<Note> getAllNotes() {
        return noteRepository.findAll();
    }
}

