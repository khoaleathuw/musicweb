package com.example.musicweb.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.musicweb.entity.Album;
import com.example.musicweb.repository.AlbumRepository;

@Service
public class AlbumService {

    private final AlbumRepository albumRepository;

    public AlbumService(AlbumRepository albumRepository) {
        this.albumRepository = albumRepository;
    }

    // =========================================================
    // GET ALL ALBUMS
    // =========================================================

    public List<Album> getAllAlbums() {

        return albumRepository
                .findAllByOrderByNameAsc();
    }

    // =========================================================
    // GET ALBUM BY ID
    // =========================================================

    public Album getAlbumById(Long id) {

        if (id == null) {
            return null;
        }

        return albumRepository
                .findById(id)
                .orElse(null);
    }

    // =========================================================
    // GET ALBUMS BY ARTIST
    // =========================================================

    public List<Album> getAlbumsByArtist(Long artistId) {

        if (artistId == null) {
            return List.of();
        }

        return albumRepository
                .findByArtistIdOrderByNameAsc(artistId);
    }

    // =========================================================
    // SAVE ALBUM
    // =========================================================

    public Album saveAlbum(Album album) {

        return albumRepository.save(album);
    }

    // =========================================================
    // DELETE ALBUM
    // =========================================================

    public void deleteAlbum(Long id) {

        if (id == null) {
            return;
        }

        albumRepository.deleteById(id);
    }

    // =========================================================
    // CHECK ALBUM EXISTS
    // =========================================================

    public boolean existsByNameAndArtist(
            String name,
            Long artistId
    ) {

        if (name == null
                || name.trim().isEmpty()
                || artistId == null) {

            return false;
        }

        return albumRepository
                .existsByNameIgnoreCaseAndArtistId(
                        name.trim(),
                        artistId
                );
    }
}