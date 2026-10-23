package com.example.musicweb.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import com.example.musicweb.entity.Album;
import com.example.musicweb.service.AlbumService;
import com.example.musicweb.service.SongService;

@Controller
public class AlbumController {

    private final AlbumService albumService;
    private final SongService songService;

    public AlbumController(
            AlbumService albumService,
            SongService songService
    ) {
        this.albumService = albumService;
        this.songService = songService;
    }

    @GetMapping("/album/{id}")
    public String album(
            @PathVariable Long id,
            Model model
    ) {

        Album album = albumService.getAlbumById(id);

        if (album == null) {
            return "redirect:/home";
        }

        model.addAttribute("album", album);

        model.addAttribute(
                "songs",
                songService.getSongsByAlbum(id)
        );

        return "album";
    }
}