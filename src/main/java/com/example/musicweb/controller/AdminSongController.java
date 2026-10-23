package com.example.musicweb.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

import com.example.musicweb.entity.Album;
import com.example.musicweb.entity.Artist;
import com.example.musicweb.entity.Song;
import com.example.musicweb.service.AlbumService;
import com.example.musicweb.service.ArtistService;
import com.example.musicweb.service.SongService;

@Controller
@RequestMapping("/admin/songs")
public class AdminSongController {

    private final SongService songService;
    private final ArtistService artistService;
    private final AlbumService albumService;

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    public AdminSongController(
            SongService songService,
            ArtistService artistService,
            AlbumService albumService
    ) {
        this.songService = songService;
        this.artistService = artistService;
        this.albumService = albumService;
    }

    // =========================================================
    // ADD SONG PAGE
    // =========================================================

    @GetMapping
    public String songPage() {
        return "admin/song";
    }

    // =========================================================
    // UPLOAD SONG
    // =========================================================

    @PostMapping("/upload")
    public String uploadSong(

            @RequestParam("title")
            String title,

            @RequestParam("artist")
            String artistName,

            @RequestParam(value = "album", required = false)
            String albumName,

            @RequestParam(value = "genre", required = false)
            String genre,

            @RequestParam("cover")
            MultipartFile cover,

            @RequestParam("audio")
            MultipartFile audio,

            Model model
    ) {

        try {

            // =====================================================
            // VALIDATE TITLE
            // =====================================================

            if (title == null || title.trim().isEmpty()) {

                return error(
                        model,
                        "Vui lòng nhập tên bài hát."
                );
            }


            // =====================================================
            // VALIDATE ARTIST
            // =====================================================

            if (artistName == null
                    || artistName.trim().isEmpty()) {

                return error(
                        model,
                        "Vui lòng nhập tên nghệ sĩ."
                );
            }

            String cleanArtistName = artistName.trim();


            // =====================================================
            // VALIDATE COVER
            // =====================================================

            if (cover == null || cover.isEmpty()) {

                return error(
                        model,
                        "Vui lòng chọn poster."
                );
            }

            String coverOriginalName =
                    cover.getOriginalFilename();

            if (coverOriginalName == null
                    || coverOriginalName.trim().isEmpty()) {

                return error(
                        model,
                        "Tên file poster không hợp lệ."
                );
            }

            String coverExtension =
                    getExtension(coverOriginalName);

            if (!isValidImageExtension(coverExtension)) {

                return error(
                        model,
                        "Poster chỉ hỗ trợ JPG, JPEG, PNG hoặc WEBP."
                );
            }


            // =====================================================
            // VALIDATE AUDIO
            // =====================================================

            if (audio == null || audio.isEmpty()) {

                return error(
                        model,
                        "Vui lòng chọn file MP3."
                );
            }

            String audioOriginalName =
                    audio.getOriginalFilename();

            if (audioOriginalName == null
                    || audioOriginalName.trim().isEmpty()) {

                return error(
                        model,
                        "Tên file audio không hợp lệ."
                );
            }

            String audioExtension =
                    getExtension(audioOriginalName);

            if (!audioExtension.equalsIgnoreCase("mp3")) {

                return error(
                        model,
                        "Chỉ hỗ trợ file MP3."
                );
            }


            // =====================================================
            // UPLOAD DIRECTORIES
            // =====================================================

            Path uploadPath =
                    Paths.get(uploadDir)
                            .toAbsolutePath()
                            .normalize();

            Path coversPath =
                    uploadPath
                            .resolve("covers")
                            .normalize();

            Path musicPath =
                    uploadPath
                            .resolve("music")
                            .normalize();

            Files.createDirectories(coversPath);
            Files.createDirectories(musicPath);


            // =====================================================
            // FILE NAMES
            // =====================================================

            String coverFileName =
                    UUID.randomUUID()
                            + "."
                            + coverExtension.toLowerCase();

            String audioFileName =
                    UUID.randomUUID()
                            + ".mp3";


            // =====================================================
            // SAVE COVER
            // =====================================================

            Path coverTarget =
                    coversPath
                            .resolve(coverFileName)
                            .normalize();

            if (!coverTarget.startsWith(coversPath)) {

                throw new IOException(
                        "Invalid cover file path."
                );
            }

            Files.copy(
                    cover.getInputStream(),
                    coverTarget,
                    StandardCopyOption.REPLACE_EXISTING
            );


            // =====================================================
            // SAVE AUDIO
            // =====================================================

            Path audioTarget =
                    musicPath
                            .resolve(audioFileName)
                            .normalize();

            if (!audioTarget.startsWith(musicPath)) {

                throw new IOException(
                        "Invalid audio file path."
                );
            }

            Files.copy(
                    audio.getInputStream(),
                    audioTarget,
                    StandardCopyOption.REPLACE_EXISTING
            );


            // =====================================================
            // URL CỦA COVER
            // =====================================================

            String coverUrl =
                    "/uploads/covers/" + coverFileName;

            String audioUrl =
                    "/uploads/music/" + audioFileName;


            // =====================================================
            // FIND OR CREATE ARTIST
            // =====================================================

            Artist artist =
                    artistService.getArtistByName(
                            cleanArtistName
                    );

            if (artist == null) {

                artist = new Artist();

                artist.setName(
                        cleanArtistName
                );

                /*
                 * Artist mới sẽ lấy cover
                 * của bài hát đầu tiên làm ảnh.
                 */
                artist.setImageUrl(
                        coverUrl
                );

                artist =
                        artistService.saveArtist(
                                artist
                        );

            } else {

                /*
                 * Artist đã tồn tại nhưng chưa có ảnh
                 * → lấy cover bài hát hiện tại.
                 */
                if (artist.getImageUrl() == null
                        || artist.getImageUrl().isBlank()) {

                    artist.setImageUrl(
                            coverUrl
                    );

                    artist =
                            artistService.saveArtist(
                                    artist
                            );
                }
            }


            // =====================================================
            // FIND OR CREATE ALBUM
            // =====================================================

            Album album = null;

            if (albumName != null
                    && !albumName.trim().isEmpty()) {

                String cleanAlbumName =
                        albumName.trim();

                List<Album> albums =
                        albumService.getAlbumsByArtist(
                                artist.getId()
                        );

                /*
                 * Tìm album cùng tên
                 * của đúng Artist.
                 */
                for (Album existingAlbum : albums) {

                    if (existingAlbum.getName() == null) {
                        continue;
                    }

                    if (!existingAlbum
                            .getName()
                            .equalsIgnoreCase(cleanAlbumName)) {

                        continue;
                    }

                    album = existingAlbum;
                    break;
                }


                // =================================================
                // ALBUM CHƯA TỒN TẠI → CREATE
                // =================================================

                if (album == null) {

                    album = new Album();

                    album.setName(
                            cleanAlbumName
                    );

                    album.setArtist(
                            artist
                    );

                    /*
                     * Album lấy cover của bài hát
                     * đầu tiên.
                     */
                    album.setCoverUrl(
                            coverUrl
                    );

                    album =
                            albumService.saveAlbum(
                                    album
                            );

                } else {

                    /*
                     * Album đã tồn tại nhưng chưa có cover.
                     */
                    if (album.getCoverUrl() == null
                            || album.getCoverUrl().isBlank()) {

                        album.setCoverUrl(
                                coverUrl
                        );

                        album =
                                albumService.saveAlbum(
                                        album
                                );
                    }
                }
            }


            // =====================================================
            // CREATE SONG
            // =====================================================

            Song song = new Song();

            song.setTitle(
                    title.trim()
            );

            song.setArtist(
                    artist
            );

            song.setAlbum(
                    album
            );

            song.setGenre(
                    genre != null
                            && !genre.trim().isEmpty()
                            ? genre.trim()
                            : null
            );

            song.setCoverUrl(
                    coverUrl
            );

            song.setAudioUrl(
                    audioUrl
            );

            song.setDuration(null);

            song.setPlayCount(0L);


            // =====================================================
            // SAVE SONG
            // =====================================================

            songService.saveSong(
                    song
            );


            // =====================================================
            // SUCCESS
            // =====================================================

            model.addAttribute(
                    "success",
                    "Upload bài hát thành công!"
            );

            return "admin/song";


        } catch (Exception e) {

            e.printStackTrace();

            model.addAttribute(
                    "error",
                    "Upload thất bại: "
                            + e.getMessage()
            );

            return "admin/song";
        }
    }


    // =========================================================
    // ERROR
    // =========================================================

    private String error(
            Model model,
            String message
    ) {

        model.addAttribute(
                "error",
                message
        );

        return "admin/song";
    }


    // =========================================================
    // GET EXTENSION
    // =========================================================

    private String getExtension(
            String fileName
    ) {

        int lastDot =
                fileName.lastIndexOf('.');

        if (lastDot == -1) {
            return "";
        }

        return fileName
                .substring(lastDot + 1)
                .toLowerCase();
    }


    // =========================================================
    // VALIDATE IMAGE
    // =========================================================

    private boolean isValidImageExtension(
            String extension
    ) {

        return extension.equalsIgnoreCase("jpg")
                || extension.equalsIgnoreCase("jpeg")
                || extension.equalsIgnoreCase("png")
                || extension.equalsIgnoreCase("webp");
    }
}