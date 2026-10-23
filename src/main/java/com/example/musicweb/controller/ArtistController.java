package com.example.musicweb.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import com.example.musicweb.entity.Artist;
import com.example.musicweb.service.ArtistService;
import com.example.musicweb.service.SongService;

@Controller
public class ArtistController {

    private final ArtistService artistService;
    private final SongService songService;

    public ArtistController(
            ArtistService artistService,
            SongService songService
    ) {
        this.artistService = artistService;
        this.songService = songService;
    }

    @GetMapping("/artist/{id}")
    public String artist(
            @PathVariable Long id,
            Model model
    ) {

        Artist artist = artistService.getArtistById(id);

        if (artist == null) {
            return "redirect:/home";
        }

        model.addAttribute("artist", artist);

        model.addAttribute(
                "songs",
                songService.getSongsByArtist(id)
        );

        return "artist";
    }
}