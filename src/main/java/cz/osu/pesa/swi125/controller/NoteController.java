package cz.osu.pesa.swi125.controller;

import cz.osu.pesa.swi125.model.entity.AppUser;
import cz.osu.pesa.swi125.model.entity.Note;
import cz.osu.pesa.swi125.model.repository.AppUserRepository;
import cz.osu.pesa.swi125.service.NoteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/notes")
public class NoteController {

    private final NoteService noteService;
    private final AppUserRepository appUserRepository;

    @Autowired
    public NoteController(NoteService noteService, AppUserRepository appUserRepository) {
        this.noteService = noteService;
        this.appUserRepository = appUserRepository;
    }

    @PostMapping("/add")
    public ResponseEntity<Note> addNote(@RequestBody Note note, Principal principal) {
        String username = principal.getName();
        AppUser user = appUserRepository.findByUsername(username);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        note.setUser(user);
        Note savedNote = noteService.addNote(note);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedNote);
    }

    @GetMapping
    public ResponseEntity<List<Note>> getUserNotes(Principal principal) {
        String username = principal.getName();
        AppUser user = appUserRepository.findByUsername(username);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        List<Note> notes = noteService.getNotesByUser(user);
        return ResponseEntity.ok(notes);
    }
}


/*package cz.osu.pesa.swi125.controller;

import cz.osu.pesa.swi125.model.entity.Note;
import cz.osu.pesa.swi125.service.NoteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notes")
public class NoteController {

    private final NoteService noteService;

    @Autowired
    public NoteController(NoteService noteService) {
        this.noteService = noteService;
    }

    // Endpoint pro přidání poznámky
    @PostMapping("/add")
    public ResponseEntity<Note> addNote(@RequestBody Note note) {
        // Předpokládáme, že poznámka obsahuje pouze text, přičemž uživatel je přiřazen k poznámce
        Note savedNote = noteService.addNote(note);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedNote);
    }

    // Endpoint pro získání poznámek uživatele (můžeš přidat autentifikaci, pokud to bude potřeba)
    @GetMapping
    public ResponseEntity<List<Note>> getAllNotes() {
        List<Note> notes = noteService.getAllNotes();
        return ResponseEntity.ok(notes);
    }
}
*/
