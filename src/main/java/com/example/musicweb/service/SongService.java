package com.example.musicweb.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.musicweb.entity.Song;
import com.example.musicweb.repository.SongRepository;

@Service
public class SongService {

    private final SongRepository songRepository;

    public SongService(
            SongRepository songRepository
    ) {
        this.songRepository = songRepository;
    }

    // =========================================================
    // GET ALL SONGS
    // =========================================================

    public List<Song> getAllSongs() {

        return songRepository
                .findAllByOrderByCreatedAtDesc();
    }

    // =========================================================
    // TRENDING
    // =========================================================

    public List<Song> getTrendingSongs() {

        return songRepository
                .findTop10ByOrderByPlayCountDesc();
    }

    // =========================================================
    // GET SONG
    // =========================================================

    public Song getSong(Long id) {

        return songRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Không tìm thấy bài hát"
                        )
                );
    }

    // =========================================================
    // SAVE
    // =========================================================

    public Song saveSong(Song song) {

        return songRepository.save(song);
    }

    // =========================================================
    // DELETE
    // =========================================================

    public void deleteSong(Long id) {

        songRepository.deleteById(id);
    }

    // =========================================================
    // INCREASE PLAY COUNT
    // =========================================================

    public void increasePlayCount(Long id) {

        Song song = getSong(id);

        Long current =
                song.getPlayCount();

        if (current == null) {
            current = 0L;
        }

        song.setPlayCount(
                current + 1
        );

        songRepository.save(song);
    }

    // =========================================================
    // GET SONGS BY ARTIST
    // =========================================================

    public List<Song> getSongsByArtist(
            Long artistId
    ) {

        return songRepository
                .findByArtistIdOrderByCreatedAtDesc(
                        artistId
                );
    }

    // =========================================================
    // GET SONGS BY ALBUM
    // =========================================================

    public List<Song> getSongsByAlbum(
            Long albumId
    ) {

        return songRepository
                .findByAlbumIdOrderByCreatedAtAsc(
                        albumId
                );
    }

    // =========================================================
    // SEARCH
    // =========================================================

    public List<Song> searchSongs(
            String keyword
    ) {

        if (keyword == null
                || keyword.trim().isEmpty()) {

            return getAllSongs();
        }

        return songRepository
                .searchSongs(
                        keyword.trim()
                );
    }
}