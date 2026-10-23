package com.example.musicweb.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.example.musicweb.entity.Song;

public interface SongRepository
        extends JpaRepository<Song, Long> {

    // =========================================================
    // ALL SONGS
    // =========================================================

    List<Song> findAllByOrderByCreatedAtDesc();

    // =========================================================
    // TRENDING
    // =========================================================

    List<Song> findTop10ByOrderByPlayCountDesc();

    // =========================================================
    // SONGS BY ARTIST
    // =========================================================

    List<Song> findByArtistIdOrderByCreatedAtDesc(
            Long artistId
    );

    // =========================================================
    // SONGS BY ALBUM
    // =========================================================

    List<Song> findByAlbumIdOrderByCreatedAtAsc(
            Long albumId
    );

    // =========================================================
    // SEARCH
    // =========================================================

    @Query("""
        SELECT s
        FROM Song s
        LEFT JOIN s.artist a
        LEFT JOIN s.album al
        WHERE LOWER(s.title) LIKE LOWER(CONCAT('%', :keyword, '%'))
           OR LOWER(a.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
           OR LOWER(al.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
        ORDER BY s.createdAt DESC
    """)
    List<Song> searchSongs(String keyword);
}