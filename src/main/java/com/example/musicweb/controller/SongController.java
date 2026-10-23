package com.example.musicweb.controller;

import com.example.musicweb.entity.Song;
import com.example.musicweb.service.SongService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/songs")
public class SongController {

    private final SongService songService;

    public SongController(SongService songService) {
        this.songService = songService;
    }

    // =========================
    // GET ALL SONGS
    // =========================

    @GetMapping
    public ResponseEntity<List<Song>> getAllSongs() {

        return ResponseEntity.ok(
                songService.getAllSongs()
        );
    }

    // =========================
    // GET TRENDING
    // =========================

    @GetMapping("/trending")
    public ResponseEntity<List<Song>> getTrendingSongs() {

        return ResponseEntity.ok(
                songService.getTrendingSongs()
        );
    }

    // =========================
    // GET SONG BY ID
    // =========================

    @GetMapping("/{id}")
    public ResponseEntity<Song> getSong(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                songService.getSong(id)
        );
    }

    // =========================
    // PLAY SONG
    // =========================

    @PostMapping("/{id}/play")
    public ResponseEntity<Void> playSong(
            @PathVariable Long id) {

        songService.increasePlayCount(id);

        return ResponseEntity.ok().build();
    }

    // =========================
    // DELETE SONG
    // =========================

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSong(
            @PathVariable Long id) {

        songService.deleteSong(id);

        return ResponseEntity.noContent().build();
    }
}