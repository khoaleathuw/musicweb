package com.example.musicweb.controller;

import java.util.List;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import com.example.musicweb.entity.Playlist;
import com.example.musicweb.entity.PlaylistSong;
import com.example.musicweb.entity.Song;
import com.example.musicweb.entity.User;
import com.example.musicweb.service.PlaylistService;
import com.example.musicweb.service.SongService;

import jakarta.servlet.http.HttpSession;

@Controller
public class PlaylistController {

    private final PlaylistService playlistService;
    private final SongService songService;

    public PlaylistController(
            PlaylistService playlistService,
            SongService songService
    ) {
        this.playlistService = playlistService;
        this.songService = songService;
    }


    // =====================================================
    // DANH SÁCH PLAYLIST CỦA USER
    // =====================================================

    @GetMapping("/playlists")
    public String playlists(
            HttpSession session,
            Model model
    ) {

        User user = getCurrentUser(session);

        if (user == null) {
            return "redirect:/login";
        }


        List<Playlist> playlists =
                playlistService.getUserPlaylists(
                        user.getId()
                );


        model.addAttribute(
                "user",
                user
        );

        model.addAttribute(
                "playlists",
                playlists
        );


        return "playlists";
    }


    // =====================================================
    // XEM CHI TIẾT PLAYLIST
    // =====================================================

    @GetMapping("/playlist/{id}")
    public String playlistDetail(
            @PathVariable Long id,
            HttpSession session,
            Model model,
            RedirectAttributes redirectAttributes
    ) {

        User user = getCurrentUser(session);

        if (user == null) {
            return "redirect:/login";
        }


        try {

            Playlist playlist =
                    playlistService.getPlaylist(id);


            if (playlist == null) {

                redirectAttributes.addFlashAttribute(
                        "error",
                        "Không tìm thấy playlist"
                );

                return "redirect:/playlists";
            }


            /*
             * Lấy các bài hát đang nằm trong playlist.
             *
             * Hàm này đồng thời kiểm tra:
             * playlist có thuộc user hiện tại hay không.
             */

            List<PlaylistSong> songs =
                    playlistService.getPlaylistSongs(
                            id,
                            user
                    );


            /*
             * Lấy toàn bộ bài hát trong hệ thống.
             *
             * Dùng cho modal:
             * "＋ Thêm bài hát"
             */

            List<Song> allSongs =
                    songService.getAllSongs();


            model.addAttribute(
                    "user",
                    user
            );

            model.addAttribute(
                    "playlist",
                    playlist
            );

            model.addAttribute(
                    "songs",
                    songs
            );

            model.addAttribute(
                    "allSongs",
                    allSongs
            );


            return "playlist-detail";


        } catch (IllegalArgumentException e) {

            redirectAttributes.addFlashAttribute(
                    "error",
                    e.getMessage()
            );

            return "redirect:/playlists";
        }
    }


    // =====================================================
    // TẠO PLAYLIST
    // =====================================================

    @PostMapping("/playlist/create")
    public String createPlaylist(
            @RequestParam("name") String name,
            HttpSession session,
            RedirectAttributes redirectAttributes
    ) {

        User user = getCurrentUser(session);

        if (user == null) {
            return "redirect:/login";
        }


        try {

            playlistService.createPlaylist(
                    name,
                    user
            );


            redirectAttributes.addFlashAttribute(
                    "success",
                    "Đã tạo playlist"
            );


        } catch (IllegalArgumentException e) {

            redirectAttributes.addFlashAttribute(
                    "error",
                    e.getMessage()
            );
        }


        return "redirect:/playlists";
    }


    // =====================================================
    // XÓA PLAYLIST
    // =====================================================

    @PostMapping("/playlist/{id}/delete")
    public String deletePlaylist(
            @PathVariable Long id,
            HttpSession session,
            RedirectAttributes redirectAttributes
    ) {

        User user = getCurrentUser(session);

        if (user == null) {
            return "redirect:/login";
        }


        try {

            playlistService.deletePlaylist(
                    id,
                    user
            );


            redirectAttributes.addFlashAttribute(
                    "success",
                    "Đã xóa playlist"
            );


        } catch (IllegalArgumentException e) {

            redirectAttributes.addFlashAttribute(
                    "error",
                    e.getMessage()
            );
        }


        return "redirect:/playlists";
    }


    // =====================================================
    // THÊM BÀI HÁT VÀO PLAYLIST
    // =====================================================

    @PostMapping("/playlist/{playlistId}/add-song")
    public String addSong(
            @PathVariable Long playlistId,
            @RequestParam("songId") Long songId,
            HttpSession session,
            RedirectAttributes redirectAttributes
    ) {

        User user = getCurrentUser(session);

        if (user == null) {
            return "redirect:/login";
        }


        try {

            playlistService.addSongToPlaylist(
                    playlistId,
                    songId,
                    user
            );


            redirectAttributes.addFlashAttribute(
                    "success",
                    "Đã thêm bài hát vào playlist"
            );


        } catch (IllegalArgumentException e) {

            redirectAttributes.addFlashAttribute(
                    "error",
                    e.getMessage()
            );
        }


        return "redirect:/playlist/" + playlistId;
    }


    // =====================================================
    // XÓA BÀI HÁT KHỎI PLAYLIST
    // =====================================================

    @PostMapping("/playlist/{playlistId}/remove-song")
    public String removeSong(
            @PathVariable Long playlistId,
            @RequestParam("songId") Long songId,
            HttpSession session,
            RedirectAttributes redirectAttributes
    ) {

        User user = getCurrentUser(session);

        if (user == null) {
            return "redirect:/login";
        }


        try {

            playlistService.removeSongFromPlaylist(
                    playlistId,
                    songId,
                    user
            );


            redirectAttributes.addFlashAttribute(
                    "success",
                    "Đã xóa bài hát khỏi playlist"
            );


        } catch (IllegalArgumentException e) {

            redirectAttributes.addFlashAttribute(
                    "error",
                    e.getMessage()
            );
        }


        return "redirect:/playlist/" + playlistId;
    }


    // =====================================================
    // LẤY USER ĐANG ĐĂNG NHẬP
    // =====================================================

    private User getCurrentUser(
            HttpSession session
    ) {

        return (User) session.getAttribute("user");
    }
}