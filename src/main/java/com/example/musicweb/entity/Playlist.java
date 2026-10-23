package com.example.musicweb.entity;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "playlists")
public class Playlist {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "user_id",
            nullable = false
    )
    private User user;


    // =====================================================
    // SONGS IN PLAYLIST
    // =====================================================

    @OneToMany(
            mappedBy = "playlist",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<PlaylistSong> songs = new ArrayList<>();


    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public Playlist() {
    }


    public Playlist(
            String name,
            User user
    ) {
        this.name = name;
        this.user = user;
    }


    // =====================================================
    // GETTERS / SETTERS
    // =====================================================

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }


    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }


    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }


    public List<PlaylistSong> getSongs() {
        return songs;
    }

    public void setSongs(
            List<PlaylistSong> songs
    ) {
        this.songs = songs;
    }
}