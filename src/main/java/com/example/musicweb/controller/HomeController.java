package com.example.musicweb.controller;

import java.util.List;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import com.example.musicweb.entity.Album;
import com.example.musicweb.entity.Artist;
import com.example.musicweb.entity.Song;
import com.example.musicweb.entity.User;
import com.example.musicweb.service.AlbumService;
import com.example.musicweb.service.ArtistService;
import com.example.musicweb.service.SongService;

import jakarta.servlet.http.HttpSession;

@Controller
public class HomeController {

    private final SongService songService;
    private final ArtistService artistService;
    private final AlbumService albumService;

    public HomeController(
            SongService songService,
            ArtistService artistService,
            AlbumService albumService
    ) {
        this.songService = songService;
        this.artistService = artistService;
        this.albumService = albumService;
    }

    // =========================================================
    // HOME
    // =========================================================

    @GetMapping("/home")
    public String home(
            HttpSession session,
            Model model
    ) {

        // =====================================================
        // CHECK LOGIN
        // =====================================================

        User user =
                (User) session.getAttribute("user");

        if (user == null) {
            return "redirect:/login";
        }

        model.addAttribute(
                "user",
                user
        );

        // =====================================================
        // ALL SONGS
        // =====================================================

        List<Song> songs =
                songService.getAllSongs();

        model.addAttribute(
                "songs",
                songs
        );

        // =====================================================
        // TRENDING SONGS
        // =====================================================

        List<Song> trendingSongs =
                songService.getTrendingSongs();

        model.addAttribute(
                "trendingSongs",
                trendingSongs
        );

        // =====================================================
        // ARTISTS
        // =====================================================

        List<Artist> artists =
                artistService.getAllArtists();

        model.addAttribute(
                "artists",
                artists
        );

        // =====================================================
        // ALBUMS
        // =====================================================

        List<Album> albums =
                albumService.getAllAlbums();

        model.addAttribute(
                "albums",
                albums
        );

        // =====================================================
        // HOME
        // =====================================================

        return "home";
    }
}