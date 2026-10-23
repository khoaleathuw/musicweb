package com.example.musicweb.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.musicweb.entity.Playlist;
import com.example.musicweb.entity.PlaylistSong;
import com.example.musicweb.entity.Song;
import com.example.musicweb.entity.User;
import com.example.musicweb.repository.PlaylistRepository;
import com.example.musicweb.repository.PlaylistSongRepository;
import com.example.musicweb.repository.SongRepository;

@Service
public class PlaylistService {

    private final PlaylistRepository playlistRepository;
    private final PlaylistSongRepository playlistSongRepository;
    private final SongRepository songRepository;

    public PlaylistService(
            PlaylistRepository playlistRepository,
            PlaylistSongRepository playlistSongRepository,
            SongRepository songRepository
    ) {
        this.playlistRepository = playlistRepository;
        this.playlistSongRepository = playlistSongRepository;
        this.songRepository = songRepository;
    }


    // =====================================================
    // GET PLAYLISTS OF USER
    // =====================================================

    public List<Playlist> getUserPlaylists(Long userId) {

        if (userId == null) {
            return List.of();
        }

        return playlistRepository
                .findByUserIdOrderByNameAsc(userId);
    }


    // =====================================================
    // GET ONE PLAYLIST
    // =====================================================

    public Playlist getPlaylist(Long id) {

        if (id == null) {
            return null;
        }

        return playlistRepository
                .findById(id)
                .orElse(null);
    }


    // =====================================================
    // CREATE PLAYLIST
    // =====================================================

    public Playlist createPlaylist(
            String name,
            User user
    ) {

        if (name == null ||
                name.trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Tên playlist không được để trống"
            );
        }

        if (user == null ||
                user.getId() == null) {

            throw new IllegalArgumentException(
                    "User không hợp lệ"
            );
        }

        String playlistName =
                name.trim();


        // Không cho cùng user tạo
        // 2 playlist cùng tên

        if (
            playlistRepository
                    .existsByNameIgnoreCaseAndUserId(
                            playlistName,
                            user.getId()
                    )
        ) {

            throw new IllegalArgumentException(
                    "Bạn đã có playlist này"
            );
        }


        Playlist playlist =
                new Playlist(
                        playlistName,
                        user
                );


        return playlistRepository.save(
                playlist
        );
    }


    // =====================================================
    // DELETE PLAYLIST
    // =====================================================

    public void deletePlaylist(
            Long playlistId,
            User user
    ) {

        Playlist playlist =
                getPlaylist(playlistId);

        if (playlist == null) {

            throw new IllegalArgumentException(
                    "Không tìm thấy playlist"
            );
        }


        checkOwnership(
                playlist,
                user
        );


        /*
         * Xóa các bài trong playlist trước.
         *
         * Làm vậy để tránh lỗi foreign key
         * nếu database chưa cấu hình cascade.
         */

        List<PlaylistSong> playlistSongs =
                playlistSongRepository
                        .findByPlaylistIdOrderByPositionAsc(
                                playlistId
                        );


        for (PlaylistSong playlistSong : playlistSongs) {

            playlistSongRepository.delete(
                    playlistSong
            );
        }


        playlistRepository.delete(
                playlist
        );
    }


    // =====================================================
    // GET SONGS IN PLAYLIST
    // =====================================================

    public List<PlaylistSong> getPlaylistSongs(
            Long playlistId,
            User user
    ) {

        Playlist playlist =
                getPlaylist(playlistId);

        if (playlist == null) {

            throw new IllegalArgumentException(
                    "Không tìm thấy playlist"
            );
        }


        checkOwnership(
                playlist,
                user
        );


        return playlistSongRepository
                .findByPlaylistIdOrderByPositionAsc(
                        playlistId
                );
    }


    // =====================================================
    // ADD SONG TO PLAYLIST
    // =====================================================

    public PlaylistSong addSongToPlaylist(
            Long playlistId,
            Long songId,
            User user
    ) {

        Playlist playlist =
                getPlaylist(playlistId);

        if (playlist == null) {

            throw new IllegalArgumentException(
                    "Không tìm thấy playlist"
            );
        }


        // Kiểm tra playlist có thuộc user hiện tại không

        checkOwnership(
                playlist,
                user
        );


        // Tìm bài hát

        Song song =
                songRepository
                        .findById(songId)
                        .orElseThrow(
                                () -> new IllegalArgumentException(
                                        "Không tìm thấy bài hát"
                                )
                        );


        // Không cho thêm bài trùng

        if (
            playlistSongRepository
                    .existsByPlaylistIdAndSongId(
                            playlistId,
                            songId
                    )
        ) {

            throw new IllegalArgumentException(
                    "Bài hát đã có trong playlist"
            );
        }


        // Lấy danh sách hiện tại

        List<PlaylistSong> currentSongs =
                playlistSongRepository
                        .findByPlaylistIdOrderByPositionAsc(
                                playlistId
                        );


        int position =
                currentSongs.size() + 1;


        // Tạo quan hệ Playlist -> Song

        PlaylistSong playlistSong =
                new PlaylistSong(
                        playlist,
                        song,
                        position
                );


        return playlistSongRepository.save(
                playlistSong
        );
    }


    // =====================================================
    // REMOVE SONG FROM PLAYLIST
    // =====================================================

    public void removeSongFromPlaylist(
            Long playlistId,
            Long songId,
            User user
    ) {

        Playlist playlist =
                getPlaylist(playlistId);

        if (playlist == null) {

            throw new IllegalArgumentException(
                    "Không tìm thấy playlist"
            );
        }


        // Kiểm tra quyền

        checkOwnership(
                playlist,
                user
        );


        // Kiểm tra bài hát có trong playlist không

        if (
            !playlistSongRepository
                    .existsByPlaylistIdAndSongId(
                            playlistId,
                            songId
                    )
        ) {

            throw new IllegalArgumentException(
                    "Bài hát không có trong playlist"
            );
        }


        playlistSongRepository
                .deleteByPlaylistIdAndSongId(
                        playlistId,
                        songId
                );
    }


    // =====================================================
    // CHECK PLAYLIST OWNERSHIP
    // =====================================================

    private void checkOwnership(
            Playlist playlist,
            User user
    ) {

        if (
            user == null ||
            user.getId() == null
        ) {

            throw new IllegalArgumentException(
                    "User không hợp lệ"
            );
        }


        if (
            playlist.getUser() == null ||
            playlist.getUser().getId() == null ||
            !playlist.getUser()
                    .getId()
                    .equals(user.getId())
        ) {

            throw new IllegalArgumentException(
                    "Bạn không có quyền truy cập playlist này"
            );
        }
    }
}