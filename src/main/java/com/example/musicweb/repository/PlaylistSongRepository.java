package com.example.musicweb.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.musicweb.entity.PlaylistSong;

public interface PlaylistSongRepository
        extends JpaRepository<PlaylistSong, Long> {

    List<PlaylistSong> findByPlaylistIdOrderByPositionAsc(
            Long playlistId
    );

    Optional<PlaylistSong> findByPlaylistIdAndSongId(
            Long playlistId,
            Long songId
    );

    boolean existsByPlaylistIdAndSongId(
            Long playlistId,
            Long songId
    );

    void deleteByPlaylistIdAndSongId(
            Long playlistId,
            Long songId
    );
}