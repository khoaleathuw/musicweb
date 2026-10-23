package com.example.musicweb.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.musicweb.entity.Artist;
import com.example.musicweb.repository.ArtistRepository;

@Service
public class ArtistService {

    private final ArtistRepository artistRepository;

    public ArtistService(
            ArtistRepository artistRepository
    ) {
        this.artistRepository = artistRepository;
    }

    // =========================================================
    // GET ALL
    // =========================================================

    public List<Artist> getAllArtists() {

        return artistRepository.findAll();
    }

    // =========================================================
    // GET BY ID
    // =========================================================

    public Artist getArtistById(Long id) {

        if (id == null) {
            return null;
        }

        return artistRepository
                .findById(id)
                .orElse(null);
    }

    // =========================================================
    // GET BY NAME
    // =========================================================

    public Artist getArtistByName(String name) {

        if (name == null || name.trim().isEmpty()) {
            return null;
        }

        return artistRepository
                .findByNameIgnoreCase(name.trim())
                .orElse(null);
    }

    // =========================================================
    // SAVE
    // =========================================================

    public Artist saveArtist(Artist artist) {

        return artistRepository.save(artist);
    }

    // =========================================================
    // DELETE
    // =========================================================

    public void deleteArtist(Long id) {

        artistRepository.deleteById(id);
    }

    // =========================================================
    // EXISTS
    // =========================================================

    public boolean existsByName(String name) {

        if (name == null || name.trim().isEmpty()) {
            return false;
        }

        return artistRepository
                .existsByNameIgnoreCase(name.trim());
    }
}