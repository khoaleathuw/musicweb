package com.example.musicweb.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.musicweb.entity.Album;

public interface AlbumRepository extends JpaRepository<Album, Long> {

    List<Album> findAllByOrderByNameAsc();

    List<Album> findByArtistIdOrderByNameAsc(Long artistId);

    boolean existsByNameIgnoreCaseAndArtistId(
            String name,
            Long artistId
    );
}