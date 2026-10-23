document.addEventListener("DOMContentLoaded", function () {

    /* =====================================================
       AUDIO PLAYER
    ===================================================== */

    const audio = document.getElementById("audioPlayer");

    /*
     * Nếu trang hiện tại không có player thì không chạy
     * phần player, nhưng các chức năng UI khác vẫn có thể
     * được xử lý bởi file JS riêng của trang.
     */
    if (!audio) {
        console.warn("K2BT: Không tìm thấy #audioPlayer trên trang này.");
        return;
    }


    /* =====================================================
       PLAYER ELEMENTS
    ===================================================== */

    const playerTitle =
        document.getElementById("playerTitle");

    const playerArtist =
        document.getElementById("playerArtist");

    const playerCover =
        document.getElementById("playerCover");

    const mainPlayButton =
        document.getElementById("mainPlayButton");

    const progressBar =
        document.getElementById("progressBar");

    const currentTime =
        document.getElementById("currentTime");

    const duration =
        document.getElementById("duration");

    const volumeBar =
        document.getElementById("volumeBar");

    const volumeButton =
        document.getElementById("volumeButton");

    const shuffleButton =
        document.getElementById("shuffleButton");

    const repeatButton =
        document.getElementById("repeatButton");

    const previousButton =
        document.getElementById("previousButton");

    const nextButton =
        document.getElementById("nextButton");

    const heroPlayButton =
        document.getElementById("heroPlayButton");

    const heroSongTitle =
        document.getElementById("heroSongTitle");


    /* =====================================================
       PLAYABLE SONG ELEMENTS
       
       CHỈ những element có data-audio mới được xem là Song.
       
       Artist / Album / Playlist card không có data-audio
       nên sẽ KHÔNG bị player bắt.
    ===================================================== */

    const songSelector = [
        ".song-card[data-audio]",
        ".artist-song[data-audio]",
        ".album-song[data-audio]",
        ".playlist-song[data-audio]"
    ].join(",");

    const songs = [
        ...new Set(
            [...document.querySelectorAll(songSelector)]
        )
    ];

    console.log(
        "🎵 K2BT:",
        songs.length,
        "playable songs loaded."
    );


    /* =====================================================
       PLAYER STATE
    ===================================================== */

    let currentCard = null;

    let currentPlaylist = [];

    let shuffle = false;

    let repeat = false;

    let previousVolume = 0.8;


    /* =====================================================
       HERO IMAGE
    ===================================================== */

    const heroImage =
        document.querySelector(".hero-image img");

    let currentHeroArtistImage = null;


    function updateHeroArtistImage(imageUrl) {

        if (!heroImage || !imageUrl) {
            return;
        }

        const finalUrl =
            String(imageUrl).trim();

        if (!finalUrl) {
            return;
        }

        if (
            finalUrl ===
            currentHeroArtistImage
        ) {
            return;
        }

        const newImage =
            new Image();

        newImage.onload = function () {

            currentHeroArtistImage =
                finalUrl;

            heroImage.classList.add(
                "hero-album-changing"
            );

            setTimeout(function () {

                heroImage.src =
                    finalUrl;

                setTimeout(function () {

                    heroImage.classList.remove(
                        "hero-album-changing"
                    );

                }, 50);

            }, 180);
        };

        newImage.onerror = function () {

            console.warn(
                "K2BT: Không load được ảnh Hero:",
                finalUrl
            );
        };

        newImage.src =
            finalUrl;
    }


    /* =====================================================
       FORMAT TIME
    ===================================================== */

    function formatTime(seconds) {

        if (
            !Number.isFinite(seconds) ||
            seconds < 0
        ) {
            return "0:00";
        }

        const minutes =
            Math.floor(seconds / 60);

        const secs =
            Math.floor(seconds % 60);

        return (
            minutes +
            ":" +
            secs.toString().padStart(2, "0")
        );
    }


    /* =====================================================
       ESCAPE HTML
    ===================================================== */

    function escapeHtml(value) {

        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    /* =====================================================
       UPDATE MAIN PLAY BUTTON
    ===================================================== */

    function updatePlayButton(isPlaying) {

        if (!mainPlayButton) {
            return;
        }

        mainPlayButton.textContent =
            isPlaying
                ? "❚❚"
                : "▶";
    }


    /* =====================================================
       UPDATE SONG CARD BUTTONS
    ===================================================== */

    function updateCardButtons() {

        songs.forEach(function (card) {

            const button =
                card.querySelector(".card-play");

            if (!button) {
                return;
            }

            const isCurrent =
                card === currentCard;

            const isPlaying =
                !audio.paused &&
                !audio.ended;

            if (
                isCurrent &&
                isPlaying
            ) {

                button.textContent =
                    "❚❚";

                card.classList.add(
                    "playing"
                );

            } else {

                button.textContent =
                    "▶";

                card.classList.remove(
                    "playing"
                );
            }
        });
    }


    /* =====================================================
       ACTIVE ALL SONG ROW
    ===================================================== */

    function updateAllSongsActive() {

        document
            .querySelectorAll(".all-song-row")
            .forEach(function (row) {

                row.classList.remove(
                    "active"
                );
            });

        if (!currentCard) {
            return;
        }

        const id =
            currentCard.dataset.id;

        if (!id) {
            return;
        }

        const row =
            document.querySelector(
                `.all-song-row[data-id="${CSS.escape(id)}"]`
            );

        if (row) {

            row.classList.add(
                "active"
            );
        }
    }


    /* =====================================================
       UPDATE PLAYLIST SONG ACTIVE
    ===================================================== */

    function updatePlaylistSongActive() {

        document
            .querySelectorAll(
                ".playlist-song"
            )
            .forEach(function (song) {

                song.classList.remove(
                    "playing"
                );

                song.classList.remove(
                    "active"
                );
            });

        if (!currentCard) {
            return;
        }

        const id =
            currentCard.dataset.id;

        if (!id) {
            return;
        }

        const playlistSong =
            document.querySelector(
                `.playlist-song[data-song-id="${CSS.escape(id)}"]`
            );

        if (playlistSong) {

            playlistSong.classList.add(
                "playing"
            );

            playlistSong.classList.add(
                "active"
            );
        }
    }


    /* =====================================================
       UPDATE PLAYER UI
    ===================================================== */

    function updatePlayerUI() {

        updatePlayButton(
            !audio.paused &&
            !audio.ended
        );

        updateCardButtons();

        updateAllSongsActive();

        updatePlaylistSongActive();
    }


    /* =====================================================
       REGISTER PLAY COUNT
    ===================================================== */

    async function registerPlay(songId) {

        if (!songId) {
            return;
        }

        try {

            await fetch(
                `/api/songs/${songId}/play`,
                {
                    method: "POST"
                }
            );

        } catch (error) {

            console.warn(
                "K2BT play count error:",
                error
            );
        }
    }


    /* =====================================================
       GET PLAYABLE SONGS
    ===================================================== */

    function getPlayableSongs() {

        return songs.filter(function (card) {

            return (
                card.dataset.audio &&
                card.dataset.audio.trim() !== ""
            );
        });
    }


    /* =====================================================
       SET PLAYLIST
    ===================================================== */

    function setPlaylist(playlist) {

        if (
            Array.isArray(playlist) &&
            playlist.length > 0
        ) {

            currentPlaylist =
                [...playlist];

        } else {

            currentPlaylist =
                [...getPlayableSongs()];
        }
    }


    /* =====================================================
       PLAY SONG
    ===================================================== */

    function playSong(card) {

        if (!card) {
            return;
        }

        const title =
            card.dataset.title ||
            "Unknown Song";

        const artist =
            card.dataset.artist ||
            "Unknown Artist";

        const image =
            card.dataset.image ||
            card.dataset.cover ||
            "";

        const audioFile =
            card.dataset.audio ||
            "";

        const songId =
            card.dataset.id ||
            card.dataset.songId ||
            "";

        if (!audioFile) {

            alert(
                "Bài hát này chưa có file audio."
            );

            return;
        }


        /* =================================================
           CURRENT CARD
        ================================================= */

        currentCard =
            card;


        /* =================================================
           PLAYLIST
        ================================================= */

        if (
            !currentPlaylist.length ||
            !currentPlaylist.includes(card)
        ) {

            currentPlaylist =
                [...getPlayableSongs()];
        }


        /* =================================================
           PLAYER INFO
        ================================================= */

        if (playerTitle) {

            playerTitle.textContent =
                title;
        }

        if (playerArtist) {

            playerArtist.textContent =
                artist;
        }

        if (
            playerCover &&
            image
        ) {

            playerCover.src =
                image;
        }


        /* =================================================
           HERO IMAGE
        ================================================= */

        if (image) {

            updateHeroArtistImage(
                image
            );
        }


        /* =================================================
           HERO TITLE
        ================================================= */

        if (heroSongTitle) {

            heroSongTitle.textContent =
                title;
        }


        /* =================================================
           RESET PROGRESS
        ================================================= */

        if (progressBar) {

            progressBar.value = 0;

            progressBar.max = 0;
        }

        if (currentTime) {

            currentTime.textContent =
                "0:00";
        }

        if (duration) {

            duration.textContent =
                "0:00";
        }


        /* =================================================
           REMOVE OLD ACTIVE STATES
        ================================================= */

        songs.forEach(function (song) {

            song.classList.remove(
                "playing"
            );

            song.classList.remove(
                "active"
            );
        });


        /* =================================================
           ACTIVE CURRENT
        ================================================= */

        card.classList.add(
            "playing"
        );


        /* =================================================
           AUDIO
        ================================================= */

        audio.pause();

        audio.currentTime = 0;

        audio.src =
            audioFile;

        audio.load();

        console.log(
            "🎧 K2BT loading:",
            audioFile
        );


        audio.play()
            .then(function () {

                updatePlayerUI();

            })
            .catch(function (error) {

                console.error(
                    "K2BT audio play error:",
                    error
                );

                console.error(
                    "Audio URL:",
                    audio.src
                );

                updatePlayerUI();
            });


        /* =================================================
           UPDATE ACTIVE
        ================================================= */

        updateAllSongsActive();

        updatePlaylistSongActive();


        /* =================================================
           PLAY COUNT
        ================================================= */

        registerPlay(songId);
    }


    /* =====================================================
       NORMAL SONG CARDS
       
       CHỈ card có data-audio mới được xử lý.
       
       Artist / Album / Playlist không có data-audio
       => click sẽ để trình duyệt xử lý href bình thường.
    ===================================================== */

    songs.forEach(function (card) {

        const playButton =
            card.querySelector(".card-play");


        /* =================================================
           CARD CLICK
        ================================================= */

        card.addEventListener(
            "click",
            function (event) {

                /*
                 * Không bắt click nút riêng.
                 */
                if (
                    event.target.closest(".card-play")
                ) {
                    return;
                }

                /*
                 * Không bắt click form xóa khỏi playlist.
                 */
                if (
                    event.target.closest(
                        ".remove-song-form"
                    )
                ) {
                    return;
                }

                /*
                 * Nếu đang phát bài này
                 * thì click lần nữa = pause/play.
                 */
                if (
                    currentCard === card
                ) {

                    if (audio.paused) {

                        audio.play()
                            .catch(
                                console.error
                            );

                    } else {

                        audio.pause();
                    }

                    return;
                }


                /*
                 * Nếu là song mới
                 */
                setPlaylist(
                    getPlayableSongs()
                );

                playSong(card);
            }
        );


        /* =================================================
           PLAY BUTTON
        ================================================= */

        if (playButton) {

            playButton.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();

                    event.stopPropagation();


                    if (
                        currentCard === card
                    ) {

                        if (
                            audio.paused
                        ) {

                            audio.play()
                                .catch(
                                    console.error
                                );

                        } else {

                            audio.pause();
                        }

                    } else {

                        setPlaylist(
                            getPlayableSongs()
                        );

                        playSong(card);
                    }
                }
            );
        }
    });


    /* =====================================================
       PLAYLIST DETAIL SONG EVENT
       
       playlist-detail.js có thể dispatch:

       document.dispatchEvent(
           new CustomEvent("playlistSongSelected", {
               detail: {
                   audio,
                   songId,
                   title,
                   artist,
                   cover
               }
           })
       );

       Phần này biến nó thành player thật.
    ===================================================== */

    document.addEventListener(
        "playlistSongSelected",
        function (event) {

            const detail =
                event.detail || {};

            const audioUrl =
                detail.audio || "";

            if (!audioUrl) {
                return;
            }


            /*
             * Tìm song element tương ứng
             */
            let playlistCard =
                document.querySelector(
                    `.playlist-song[data-song-id="${CSS.escape(String(detail.songId || ""))}"]`
                );


            /*
             * Nếu không tìm được element,
             * tạo một card ảo để player vẫn chạy.
             */
            if (!playlistCard) {

                playlistCard =
                    document.createElement(
                        "div"
                    );

                playlistCard.className =
                    "playlist-song virtual-song";

                playlistCard.dataset.audio =
                    audioUrl;

                playlistCard.dataset.songId =
                    detail.songId || "";

                playlistCard.dataset.id =
                    detail.songId || "";

                playlistCard.dataset.title =
                    detail.title ||
                    "Unknown Song";

                playlistCard.dataset.artist =
                    detail.artist ||
                    "Unknown Artist";

                playlistCard.dataset.image =
                    detail.cover ||
                    "";

                songs.push(playlistCard);
            }


            /*
             * Đặt playlist nếu đang ở playlist detail.
             */
            const playlistSongs =
                [
                    ...document.querySelectorAll(
                        ".playlist-song[data-audio]"
                    )
                ];

            if (playlistSongs.length > 0) {

                currentPlaylist =
                    playlistSongs.filter(
                        function (song) {

                            return (
                                song.dataset.audio &&
                                song.dataset.audio.trim() !== ""
                            );
                        }
                    );
            }


            playSong(
                playlistCard
            );
        }
    );


    /* =====================================================
       MAIN PLAY
    ===================================================== */

    if (mainPlayButton) {

        mainPlayButton.addEventListener(
            "click",
            function () {

                if (!currentCard) {

                    const playlist =
                        getPlayableSongs();

                    if (playlist.length) {

                        currentPlaylist =
                            [...playlist];

                        playSong(
                            playlist[0]
                        );
                    }

                    return;
                }


                if (audio.paused) {

                    audio.play()
                        .catch(
                            console.error
                        );

                } else {

                    audio.pause();
                }
            }
        );
    }


    /* =====================================================
       AUDIO PLAY
    ===================================================== */

    audio.addEventListener(
        "play",
        function () {

            updatePlayerUI();
        }
    );


    /* =====================================================
       AUDIO PAUSE
    ===================================================== */

    audio.addEventListener(
        "pause",
        function () {

            updatePlayerUI();
        }
    );


    /* =====================================================
       METADATA
    ===================================================== */

    audio.addEventListener(
        "loadedmetadata",
        function () {

            if (
                !Number.isFinite(
                    audio.duration
                )
            ) {
                return;
            }


            const time =
                formatTime(
                    audio.duration
                );


            if (duration) {

                duration.textContent =
                    time;
            }


            if (progressBar) {

                progressBar.max =
                    audio.duration;
            }


            /* =================================================
               CURRENT SONG DURATION
            ================================================= */

            if (currentCard) {

                const cardDuration =
                    currentCard.querySelector(
                        ".duration"
                    );

                if (cardDuration) {

                    cardDuration.textContent =
                        time;
                }


                /* =============================================
                   ALL SONGS
                ============================================= */

                const id =
                    currentCard.dataset.id ||
                    currentCard.dataset.songId;

                if (id) {

                    const row =
                        document.querySelector(
                            `.all-song-row[data-id="${CSS.escape(String(id))}"]`
                        );

                    if (row) {

                        const rowDuration =
                            row.querySelector(
                                ".all-song-duration"
                            );

                        if (rowDuration) {

                            rowDuration.textContent =
                                time;
                        }
                    }
                }


                /* =============================================
                   PLAYLIST SONG
                ============================================= */

                const playlistSong =
                    document.querySelector(
                        `.playlist-song[data-song-id="${CSS.escape(String(id || ""))}"]`
                    );

                if (playlistSong) {

                    const playlistDuration =
                        playlistSong.querySelector(
                            ".duration"
                        );

                    if (playlistDuration) {

                        playlistDuration.textContent =
                            time;
                    }
                }
            }
        }
    );


    /* =====================================================
       TIME UPDATE
    ===================================================== */

    audio.addEventListener(
        "timeupdate",
        function () {

            if (
                !Number.isFinite(
                    audio.duration
                )
            ) {
                return;
            }


            if (progressBar) {

                progressBar.max =
                    audio.duration;

                progressBar.value =
                    audio.currentTime;
            }


            if (currentTime) {

                currentTime.textContent =
                    formatTime(
                        audio.currentTime
                    );
            }
        }
    );


    /* =====================================================
       PROGRESS BAR
    ===================================================== */

    if (progressBar) {

        progressBar.addEventListener(
            "input",
            function () {

                audio.currentTime =
                    Number(
                        progressBar.value
                    );
            }
        );
    }


    /* =====================================================
       AUDIO ERROR
    ===================================================== */

    audio.addEventListener(
        "error",
        function () {

            console.error(
                "❌ K2BT AUDIO ERROR"
            );

            console.error(
                "Audio URL:",
                audio.src
            );

            if (audio.error) {

                console.error(
                    "Error code:",
                    audio.error.code
                );

                console.error(
                    "Error message:",
                    audio.error.message
                );
            }

            updatePlayButton(false);
        }
    );


    /* =====================================================
       VOLUME
    ===================================================== */

    audio.volume = 0.8;


    if (volumeBar) {

        volumeBar.value = 0.8;


        volumeBar.addEventListener(
            "input",
            function () {

                const value =
                    Number(
                        volumeBar.value
                    );

                audio.volume =
                    value;


                if (value === 0) {

                    if (volumeButton) {

                        volumeButton.textContent =
                            "🔇";
                    }

                } else {

                    if (volumeButton) {

                        volumeButton.textContent =
                            "🔊";
                    }

                    previousVolume =
                        value;
                }
            }
        );
    }


    /* =====================================================
       MUTE
    ===================================================== */

    if (volumeButton) {

        volumeButton.addEventListener(
            "click",
            function () {

                if (
                    audio.volume > 0
                ) {

                    previousVolume =
                        audio.volume;

                    audio.volume =
                        0;


                    if (volumeBar) {

                        volumeBar.value =
                            0;
                    }


                    volumeButton.textContent =
                        "🔇";

                } else {

                    audio.volume =
                        previousVolume ||
                        0.8;


                    if (volumeBar) {

                        volumeBar.value =
                            audio.volume;
                    }


                    volumeButton.textContent =
                        "🔊";
                }
            }
        );
    }


    /* =====================================================
       NEXT SONG
    ===================================================== */

    function nextSong() {

        if (
            !currentPlaylist.length
        ) {

            currentPlaylist =
                [...getPlayableSongs()];
        }


        if (
            !currentPlaylist.length
        ) {

            return;
        }


        let currentIndex =
            currentPlaylist.indexOf(
                currentCard
            );


        if (currentIndex < 0) {

            currentIndex = 0;
        }


        let nextIndex;


        /* =================================================
           SHUFFLE
        ================================================= */

        if (shuffle) {

            if (
                currentPlaylist.length === 1
            ) {

                nextIndex = 0;

            } else {

                do {

                    nextIndex =
                        Math.floor(
                            Math.random() *
                            currentPlaylist.length
                        );

                } while (
                    nextIndex ===
                    currentIndex
                );
            }

        } else {

            nextIndex =
                currentIndex + 1;


            if (
                nextIndex >=
                currentPlaylist.length
            ) {

                nextIndex = 0;
            }
        }


        playSong(
            currentPlaylist[
                nextIndex
            ]
        );
    }


    if (nextButton) {

        nextButton.addEventListener(
            "click",
            nextSong
        );
    }


    /* =====================================================
       PREVIOUS SONG
    ===================================================== */

    function previousSong() {

        if (
            audio.currentTime > 5
        ) {

            audio.currentTime = 0;

            return;
        }


        if (
            !currentPlaylist.length
        ) {

            currentPlaylist =
                [...getPlayableSongs()];
        }


        if (
            !currentPlaylist.length
        ) {

            return;
        }


        let currentIndex =
            currentPlaylist.indexOf(
                currentCard
            );


        if (currentIndex < 0) {

            currentIndex = 0;
        }


        let previousIndex =
            currentIndex - 1;


        if (
            previousIndex < 0
        ) {

            previousIndex =
                currentPlaylist.length - 1;
        }


        playSong(
            currentPlaylist[
                previousIndex
            ]
        );
    }


    if (previousButton) {

        previousButton.addEventListener(
            "click",
            previousSong
        );
    }


    /* =====================================================
       AUTO NEXT
    ===================================================== */

    audio.addEventListener(
        "ended",
        function () {

            if (repeat) {

                audio.currentTime =
                    0;

                audio.play()
                    .catch(
                        console.error
                    );

                return;
            }


            nextSong();
        }
    );


    /* =====================================================
       SHUFFLE
    ===================================================== */

    if (shuffleButton) {

        shuffleButton.addEventListener(
            "click",
            function () {

                shuffle =
                    !shuffle;


                shuffleButton.classList.toggle(
                    "active",
                    shuffle
                );


                console.log(
                    "K2BT Shuffle:",
                    shuffle
                        ? "ON"
                        : "OFF"
                );
            }
        );
    }


    /* =====================================================
       REPEAT
    ===================================================== */

    if (repeatButton) {

        repeatButton.addEventListener(
            "click",
            function () {

                repeat =
                    !repeat;


                repeatButton.classList.toggle(
                    "active",
                    repeat
                );


                console.log(
                    "K2BT Repeat:",
                    repeat
                        ? "ON"
                        : "OFF"
                );
            }
        );
    }


    /* =====================================================
       HERO PLAY
    ===================================================== */

    if (heroPlayButton) {

        heroPlayButton.addEventListener(
            "click",
            function () {

                const playlist =
                    getPlayableSongs();


                if (!playlist.length) {

                    alert(
                        "K2BT chưa có bài hát."
                    );

                    return;
                }


                if (currentCard) {

                    if (audio.paused) {

                        audio.play()
                            .catch(
                                console.error
                            );

                    } else {

                        audio.pause();
                    }

                } else {

                    currentPlaylist =
                        [...playlist];

                    playSong(
                        playlist[0]
                    );
                }
            }
        );
    }


    /* =====================================================
       EXPLORE MUSIC
    ===================================================== */

    const exploreButton =
        document.getElementById(
            "exploreButton"
        );


    if (exploreButton) {

        exploreButton.addEventListener(
            "click",
            function () {

                document
                    .getElementById("trending")
                    ?.scrollIntoView({
                        behavior: "smooth"
                    });
            }
        );
    }


    /* =====================================================
       TRENDING VIEW ALL
    ===================================================== */

    const trendingViewAll =
        document.getElementById(
            "trendingViewAll"
        );


    if (trendingViewAll) {

        trendingViewAll.addEventListener(
            "click",
            function () {

                document
                    .getElementById("trending")
                    ?.scrollIntoView({
                        behavior: "smooth"
                    });
            }
        );
    }


    /* =====================================================
       ALL SONGS
    ===================================================== */

    const allSongsSection =
        document.getElementById(
            "allSongsSection"
        );

    const allSongsList =
        document.getElementById(
            "allSongsList"
        );


    function renderAllSongs() {

        if (!allSongsList) {
            return;
        }


        allSongsList.innerHTML =
            "";


        songs.forEach(
            function (card, index) {

                const id =
                    card.dataset.id ||
                    card.dataset.songId ||
                    "";


                const title =
                    card.dataset.title ||
                    "Unknown Song";


                const artist =
                    card.dataset.artist ||
                    "Unknown Artist";


                const album =
                    card.dataset.album ||
                    "Single";


                const image =
                    card.dataset.image ||
                    card.dataset.cover ||
                    "";


                const row =
                    document.createElement(
                        "div"
                    );


                row.className =
                    "all-song-row";


                row.dataset.id =
                    id;


                row.innerHTML = `
                    <div class="all-song-number">
                        ${String(
                            index + 1
                        ).padStart(2, "0")}
                    </div>

                    <div class="all-song-cover-wrap">

                        <img
                            src="${escapeHtml(image)}"
                            alt="${escapeHtml(title)}"
                            class="all-song-cover"
                            loading="lazy"
                        >

                        <button
                            type="button"
                            class="all-song-play"
                            aria-label="Play song">
                            ▶
                        </button>

                    </div>

                    <div class="all-song-info">

                        <strong>
                            ${escapeHtml(title)}
                        </strong>

                        <span>
                            ${escapeHtml(artist)}
                        </span>

                    </div>

                    <div class="all-song-album">
                        ${escapeHtml(album)}
                    </div>

                    <div class="all-song-duration">
                        —
                    </div>
                `;


                /* =============================================
                   ROW CLICK
                ============================================= */

                row.addEventListener(
                    "click",
                    function () {

                        currentPlaylist =
                            [...getPlayableSongs()];

                        playSong(card);
                    }
                );


                /* =============================================
                   PLAY BUTTON
                ============================================= */

                const playButton =
                    row.querySelector(
                        ".all-song-play"
                    );


                if (playButton) {

                    playButton.addEventListener(
                        "click",
                        function (event) {

                            event.preventDefault();

                            event.stopPropagation();


                            currentPlaylist =
                                [...getPlayableSongs()];


                            playSong(card);
                        }
                    );
                }


                allSongsList.appendChild(
                    row
                );
            }
        );


        updateAllSongsActive();
    }


    /*
     * Render nếu All Songs section tồn tại.
     */
    if (allSongsList) {

        renderAllSongs();
    }


    /* =====================================================
       CLOSE ALL SONGS
    ===================================================== */

    const closeAllSongs =
        document.getElementById(
            "closeAllSongs"
        );


    if (closeAllSongs) {

        closeAllSongs.addEventListener(
            "click",
            function () {

                if (allSongsSection) {

                    allSongsSection.style.display =
                        "none";
                }
            }
        );
    }


    /* =====================================================
       PROFILE DROPDOWN
    ===================================================== */

    const profileMenu =
        document.getElementById(
            "profileMenu"
        );

    const profileDropdown =
        document.getElementById(
            "profileDropdown"
        );


    if (
        profileMenu &&
        profileDropdown
    ) {

        profileMenu.addEventListener(
            "click",
            function (event) {

                event.stopPropagation();

                profileDropdown.classList.toggle(
                    "show"
                );
            }
        );


        document.addEventListener(
            "click",
            function () {

                profileDropdown.classList.remove(
                    "show"
                );
            }
        );
    }


    /* =====================================================
       SEARCH
    ===================================================== */

    const searchButton =
        document.getElementById(
            "searchButton"
        );

    const searchOverlay =
        document.getElementById(
            "searchOverlay"
        );

    const closeSearch =
        document.getElementById(
            "closeSearch"
        );

    const searchInput =
        document.getElementById(
            "searchInput"
        );


    function openSearch() {

        if (!searchOverlay) {
            return;
        }


        searchOverlay.classList.add(
            "show"
        );


        searchInput?.focus();
    }


    function closeSearchOverlay() {

        searchOverlay?.classList.remove(
            "show"
        );


        if (searchInput) {

            searchInput.value = "";

            filterSongs("");
        }
    }


    if (searchButton) {

        searchButton.addEventListener(
            "click",
            openSearch
        );
    }


    if (closeSearch) {

        closeSearch.addEventListener(
            "click",
            closeSearchOverlay
        );
    }


    /* =====================================================
       SEARCH FILTER
    ===================================================== */

    function filterSongs(query) {

        const keyword =
            query
                .toLowerCase()
                .trim();


        songs.forEach(function (card) {

            const title =
                (
                    card.dataset.title ||
                    ""
                ).toLowerCase();


            const artist =
                (
                    card.dataset.artist ||
                    ""
                ).toLowerCase();


            const album =
                (
                    card.dataset.album ||
                    ""
                ).toLowerCase();


            const genre =
                (
                    card.dataset.genre ||
                    ""
                ).toLowerCase();


            const match =
                !keyword ||
                title.includes(keyword) ||
                artist.includes(keyword) ||
                album.includes(keyword) ||
                genre.includes(keyword);


            /*
             * Chỉ filter song card.
             * Không đụng Artist / Album navigation.
             */
            if (
                card.classList.contains("song-card") ||
                card.classList.contains("artist-song") ||
                card.classList.contains("album-song") ||
                card.classList.contains("playlist-song")
            ) {

                card.style.display =
                    match
                        ? ""
                        : "none";
            }
        });
    }


    if (searchInput) {

        searchInput.addEventListener(
            "input",
            function () {

                filterSongs(
                    searchInput.value
                );
            }
        );
    }


    /* =====================================================
       KEYBOARD SHORTCUTS
    ===================================================== */

    document.addEventListener(
        "keydown",
        function (event) {

            const tag =
                event.target.tagName
                    ?.toLowerCase();


            const typing =
                tag === "input" ||
                tag === "textarea" ||
                tag === "select";


            /* =============================================
               ESC
            ============================================= */

            if (
                event.key === "Escape"
            ) {

                closeSearchOverlay();
            }


            /* =============================================
               SPACE
            ============================================= */

            if (
                event.code === "Space" &&
                !typing
            ) {

                event.preventDefault();

                mainPlayButton?.click();
            }


            /* =============================================
               NEXT
            ============================================= */

            if (
                event.code === "ArrowRight" &&
                !typing
            ) {

                nextSong();
            }


            /* =============================================
               PREVIOUS
            ============================================= */

            if (
                event.code === "ArrowLeft" &&
                !typing
            ) {

                previousSong();
            }
        }
    );


    /* =====================================================
       INITIAL
    ===================================================== */

    if (progressBar) {

        progressBar.value = 0;
    }


    if (volumeBar) {

        volumeBar.value = 0.8;
    }


    updatePlayerUI();


    console.log(
        "🎵 K2BT Music Player ready."
    );

});