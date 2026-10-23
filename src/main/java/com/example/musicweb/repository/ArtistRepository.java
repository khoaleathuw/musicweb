package com.example.musicweb.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.musicweb.entity.Artist;

public interface ArtistRepository extends JpaRepository<Artist, Long> {

    Optional<Artist> findByNameIgnoreCase(String name);

    boolean existsByNameIgnoreCase(String name);
}