package com.example.musicweb.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.musicweb.entity.Playlist;

public interface PlaylistRepository
        extends JpaRepository<Playlist, Long> {

    List<Playlist> findByUserIdOrderByNameAsc(Long userId);

    boolean existsByNameIgnoreCaseAndUserId(
            String name,
            Long userId
    );
}