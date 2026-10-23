document.addEventListener("DOMContentLoaded", function () {

    /* =====================================================
       SONGS
    ====================================================== */

    const songs = [
        ...document.querySelectorAll(".playlist-song[data-audio]")
    ];

    const audioPlayer =
        document.getElementById("audioPlayer");

    const playerTitle =
        document.getElementById("playerTitle");

    const playerArtist =
        document.getElementById("playerArtist");

    const playerCover =
        document.getElementById("playerCover");

    const mainPlayButton =
        document.getElementById("mainPlayButton");

    const nextButton =
        document.getElementById("nextButton");

    const previousButton =
        document.getElementById("previousButton");

    const shuffleButton =
        document.getElementById("shuffleButton");

    const repeatButton =
        document.getElementById("repeatButton");

    const progressBar =
        document.getElementById("progressBar");

    const currentTime =
        document.getElementById("currentTime");

    const duration =
        document.getElementById("duration");

    const volumeButton =
        document.getElementById("volumeButton");

    const volumeBar =
        document.getElementById("volumeBar");

    let currentIndex = -1;

    let shuffle = false;

    let repeat = false;

    let previousVolume = 1;


    /* =====================================================
       FORMAT TIME
    ====================================================== */

    function formatTime(seconds) {

        if (!Number.isFinite(seconds)) {
            return "0:00";
        }

        const minutes =
            Math.floor(seconds / 60);

        const secs =
            Math.floor(seconds % 60);

        return minutes + ":" +
            String(secs).padStart(2, "0");
    }


    /* =====================================================
       UPDATE VOLUME ICON
    ====================================================== */

    function updateVolumeIcon() {

        if (!volumeButton || !audioPlayer) {
            return;
        }

        if (
            audioPlayer.muted ||
            audioPlayer.volume === 0
        ) {

            volumeButton.textContent = "🔇";

        } else if (audioPlayer.volume < 0.5) {

            volumeButton.textContent = "🔉";

        } else {

            volumeButton.textContent = "🔊";

        }

    }


    /* =====================================================
       UPDATE PROGRESS
    ====================================================== */

    function updateProgress() {

        if (
            !audioPlayer ||
            !progressBar ||
            !audioPlayer.duration
        ) {
            return;
        }

        const percent =
            (
                audioPlayer.currentTime /
                audioPlayer.duration
            ) * 100;

        progressBar.value = percent;

        progressBar.style.setProperty(
            "--progress",
            percent + "%"
        );

        if (currentTime) {

            currentTime.textContent =
                formatTime(
                    audioPlayer.currentTime
                );

        }

    }


    /* =====================================================
       RESET SONG STATES
    ====================================================== */

    function resetSongStates() {

        songs.forEach(function (song) {

            song.classList.remove("playing");

            const icon =
                song.querySelector(".play-icon");

            if (icon) {
                icon.textContent = "▶";
            }

        });

    }


    /* =====================================================
       UPDATE CURRENT SONG ICON
    ====================================================== */

    function updateCurrentSongIcon() {

        resetSongStates();

        if (
            currentIndex < 0 ||
            currentIndex >= songs.length
        ) {
            return;
        }

        const song =
            songs[currentIndex];

        song.classList.add("playing");

        const icon =
            song.querySelector(".play-icon");

        if (!icon) {
            return;
        }

        icon.textContent =
            audioPlayer.paused
                ? "▶"
                : "❚❚";

    }


    /* =====================================================
       PLAY SONG
    ====================================================== */

    function playSong(index) {

        if (
            !audioPlayer ||
            index < 0 ||
            index >= songs.length
        ) {
            return;
        }

        const song =
            songs[index];

        const audio =
            song.dataset.audio;

        if (!audio) {
            console.error(
                "Không tìm thấy audio:",
                song
            );

            return;
        }

        currentIndex = index;


        /* ==========================
           PLAYER INFO
        ========================== */

        if (playerTitle) {

            playerTitle.textContent =
                song.dataset.title ||
                "Unknown Song";

        }

        if (playerArtist) {

            playerArtist.textContent =
                song.dataset.artist ||
                "Unknown Artist";

        }

        if (
            playerCover &&
            song.dataset.cover
        ) {

            playerCover.src =
                song.dataset.cover;

        }


        /* ==========================
           RESET PROGRESS
        ========================== */

        if (progressBar) {

            progressBar.value = 0;

            progressBar.style.setProperty(
                "--progress",
                "0%"
            );

        }

        if (currentTime) {
            currentTime.textContent =
                "0:00";
        }

        if (duration) {
            duration.textContent =
                "0:00";
        }


        /* ==========================
           LOAD AUDIO
        ========================== */

        audioPlayer.pause();

        audioPlayer.src = audio;

        audioPlayer.load();


        /* ==========================
           PLAY
        ========================== */

        audioPlayer.play()
            .then(function () {

                if (mainPlayButton) {
                    mainPlayButton.textContent =
                        "❚❚";
                }

                updateCurrentSongIcon();

            })
            .catch(function (error) {

                console.error(
                    "Không thể phát nhạc:",
                    error
                );

                if (mainPlayButton) {
                    mainPlayButton.textContent =
                        "▶";
                }

                updateCurrentSongIcon();

            });

    }


    /* =====================================================
       CLICK SONG
    ====================================================== */

    songs.forEach(function (song, index) {

        song.addEventListener(
            "click",
            function (event) {

                /*
                 * Không phát khi click nút xóa
                 */

                if (
                    event.target.closest(
                        ".remove-song-form"
                    )
                ) {
                    return;
                }


                /*
                 * Nếu click đúng bài đang phát
                 * thì toggle play/pause
                 */

                if (
                    currentIndex === index &&
                    audioPlayer.src
                ) {

                    if (audioPlayer.paused) {

                        audioPlayer.play();

                    } else {

                        audioPlayer.pause();

                    }

                    return;
                }


                playSong(index);

            }
        );

    });


    /* =====================================================
       MAIN PLAY / PAUSE
    ====================================================== */

    if (mainPlayButton) {

        mainPlayButton.addEventListener(
            "click",
            function () {

                /*
                 * Chưa có bài nào
                 */

                if (!audioPlayer.src) {

                    if (songs.length > 0) {
                        playSong(0);
                    }

                    return;
                }


                /*
                 * Đang pause
                 */

                if (audioPlayer.paused) {

                    audioPlayer.play()
                        .catch(function (error) {

                            console.error(
                                "Không thể tiếp tục phát:",
                                error
                            );

                        });

                }

                /*
                 * Đang phát
                 */

                else {

                    audioPlayer.pause();

                }

            }
        );

    }


    /* =====================================================
       NEXT SONG
    ====================================================== */

    if (nextButton) {

        nextButton.addEventListener(
            "click",
            function () {

                if (!songs.length) {
                    return;
                }


                /*
                 * SHUFFLE
                 */

                if (shuffle) {

                    if (songs.length === 1) {

                        playSong(0);

                        return;
                    }

                    let nextIndex;

                    do {

                        nextIndex =
                            Math.floor(
                                Math.random() *
                                songs.length
                            );

                    } while (
                        nextIndex === currentIndex
                    );

                    playSong(nextIndex);

                    return;
                }


                /*
                 * NEXT NORMAL
                 */

                if (
                    currentIndex <
                    songs.length - 1
                ) {

                    playSong(
                        currentIndex + 1
                    );

                    return;
                }


                /*
                 * HẾT PLAYLIST
                 */

                if (repeat) {

                    playSong(0);

                }

            }
        );

    }


    /* =====================================================
       PREVIOUS SONG
    ====================================================== */

    if (previousButton) {

        previousButton.addEventListener(
            "click",
            function () {

                if (!songs.length) {
                    return;
                }


                /*
                 * Nếu bài đang chạy > 3 giây
                 * thì Previous quay lại đầu bài
                 */

                if (
                    audioPlayer.currentTime > 3
                ) {

                    audioPlayer.currentTime = 0;

                    return;
                }


                /*
                 * Quay bài trước
                 */

                if (currentIndex > 0) {

                    playSong(
                        currentIndex - 1
                    );

                    return;
                }


                /*
                 * Đang ở bài đầu
                 * Previous -> bài cuối
                 */

                playSong(
                    songs.length - 1
                );

            }
        );

    }


    /* =====================================================
       SHUFFLE
    ====================================================== */

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

            }
        );

    }


    /* =====================================================
       REPEAT
    ====================================================== */

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

            }
        );

    }


    /* =====================================================
       AUDIO PLAY
    ====================================================== */

    if (audioPlayer) {

        audioPlayer.addEventListener(
            "play",
            function () {

                if (mainPlayButton) {

                    mainPlayButton.textContent =
                        "❚❚";

                }

                updateCurrentSongIcon();

            }
        );


        /* =================================================
           AUDIO PAUSE
        ================================================== */

        audioPlayer.addEventListener(
            "pause",
            function () {

                if (mainPlayButton) {

                    mainPlayButton.textContent =
                        "▶";

                }

                updateCurrentSongIcon();

            }
        );


        /* =================================================
           AUDIO LOADED
        ================================================== */

        audioPlayer.addEventListener(
            "loadedmetadata",
            function () {

                if (duration) {

                    duration.textContent =
                        formatTime(
                            audioPlayer.duration
                        );

                }

                if (progressBar) {

                    progressBar.value = 0;

                    progressBar.style.setProperty(
                        "--progress",
                        "0%"
                    );

                }

            }
        );


        /* =================================================
           AUDIO TIME UPDATE
        ================================================== */

        audioPlayer.addEventListener(
            "timeupdate",
            function () {

                updateProgress();

            }
        );


        /* =================================================
           AUDIO ENDED
        ================================================== */

        audioPlayer.addEventListener(
            "ended",
            function () {

                /*
                 * REPEAT
                 */

                if (repeat) {

                    audioPlayer.currentTime = 0;

                    audioPlayer.play();

                    return;
                }


                /*
                 * SHUFFLE
                 */

                if (shuffle) {

                    if (songs.length <= 1) {

                        playSong(0);

                        return;
                    }

                    let nextIndex;

                    do {

                        nextIndex =
                            Math.floor(
                                Math.random() *
                                songs.length
                            );

                    } while (
                        nextIndex === currentIndex
                    );

                    playSong(nextIndex);

                    return;
                }


                /*
                 * NEXT
                 */

                if (
                    currentIndex <
                    songs.length - 1
                ) {

                    playSong(
                        currentIndex + 1
                    );

                    return;
                }


                /*
                 * HẾT PLAYLIST
                 */

                audioPlayer.currentTime = 0;

                if (progressBar) {

                    progressBar.value = 0;

                    progressBar.style.setProperty(
                        "--progress",
                        "0%"
                    );

                }

                if (currentTime) {
                    currentTime.textContent =
                        "0:00";
                }

                if (mainPlayButton) {
                    mainPlayButton.textContent =
                        "▶";
                }

                resetSongStates();

            }
        );

    }


    /* =====================================================
       PROGRESS BAR CLICK / DRAG
    ====================================================== */

    if (progressBar) {

        progressBar.addEventListener(
            "input",
            function () {

                if (
                    !audioPlayer ||
                    !audioPlayer.duration
                ) {
                    return;
                }

                const percent =
                    Number(progressBar.value);

                audioPlayer.currentTime =
                    (
                        percent / 100
                    ) *
                    audioPlayer.duration;

                progressBar.style.setProperty(
                    "--progress",
                    percent + "%"
                );

            }
        );

    }


    /* =====================================================
       VOLUME
    ====================================================== */

    if (audioPlayer) {

        if (volumeBar) {

            audioPlayer.volume =
                Number(volumeBar.value);

        } else {

            audioPlayer.volume = 1;

        }

    }


    if (volumeBar) {

        volumeBar.addEventListener(
            "input",
            function () {

                const value =
                    Number(volumeBar.value);

                audioPlayer.volume =
                    value;

                audioPlayer.muted =
                    value === 0;

                if (value > 0) {
                    previousVolume = value;
                }

                updateVolumeIcon();

            }
        );

    }


    /* =====================================================
       MUTE / UNMUTE
    ====================================================== */

    if (volumeButton) {

        volumeButton.addEventListener(
            "click",
            function () {

                if (audioPlayer.muted) {

                    audioPlayer.muted = false;

                    const volume =
                        previousVolume > 0
                            ? previousVolume
                            : 1;

                    audioPlayer.volume =
                        volume;

                    if (volumeBar) {
                        volumeBar.value =
                            volume;
                    }

                } else {

                    if (audioPlayer.volume > 0) {

                        previousVolume =
                            audioPlayer.volume;

                    }

                    audioPlayer.muted = true;

                    if (volumeBar) {
                        volumeBar.value = 0;
                    }

                }

                updateVolumeIcon();

            }
        );

    }


    /* =====================================================
       DELETE PLAYLIST
    ====================================================== */

    const deleteButton =
        document.querySelector(
            "[data-confirm-delete]"
        );

    if (deleteButton) {

        deleteButton.addEventListener(
            "click",
            function (event) {

                const confirmed =
                    confirm(
                        "Bạn có chắc muốn xóa playlist này?"
                    );

                if (!confirmed) {

                    event.preventDefault();

                }

            }
        );

    }


    /* =====================================================
       REMOVE SONG
    ====================================================== */

    document
        .querySelectorAll(".remove-song-form")
        .forEach(function (form) {

            form.addEventListener(
                "submit",
                function (event) {

                    const confirmed =
                        confirm(
                            "Xóa bài hát này khỏi playlist?"
                        );

                    if (!confirmed) {

                        event.preventDefault();

                    }

                }
            );

        });


    /* =====================================================
       ADD SONG MODAL
    ====================================================== */

    const modal =
        document.getElementById(
            "addSongModal"
        );

    const openButton =
        document.getElementById(
            "openAddSong"
        );

    const openEmptyButton =
        document.getElementById(
            "openAddSongEmpty"
        );

    const closeButton =
        document.getElementById(
            "closeAddSong"
        );

    const overlay =
        document.getElementById(
            "closeAddSongOverlay"
        );

    const searchInput =
        document.getElementById(
            "addSongSearch"
        );


    /* =====================================================
       OPEN MODAL
    ====================================================== */

    function openModal() {

        if (!modal) {
            return;
        }

        modal.classList.add("show");

        document.body.classList.add(
            "modal-open"
        );

        if (searchInput) {

            searchInput.value = "";

            filterSongs("");

            setTimeout(function () {

                searchInput.focus();

            }, 100);

        }

    }


    /* =====================================================
       CLOSE MODAL
    ====================================================== */

    function closeModal() {

        if (!modal) {
            return;
        }

        modal.classList.remove(
            "show"
        );

        document.body.classList.remove(
            "modal-open"
        );

    }


    if (openButton) {

        openButton.addEventListener(
            "click",
            openModal
        );

    }


    if (openEmptyButton) {

        openEmptyButton.addEventListener(
            "click",
            openModal
        );

    }


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            closeModal
        );

    }


    if (overlay) {

        overlay.addEventListener(
            "click",
            closeModal
        );

    }


    /* =====================================================
       SEARCH
    ====================================================== */

    function filterSongs(keyword) {

        const search =
            keyword
                .trim()
                .toLowerCase();


        document
            .querySelectorAll(
                ".add-song-item"
            )
            .forEach(function (item) {

                const title =
                    (
                        item.dataset.title ||
                        ""
                    ).toLowerCase();

                const artist =
                    (
                        item.dataset.artist ||
                        ""
                    ).toLowerCase();


                const matched =
                    !search ||
                    title.includes(search) ||
                    artist.includes(search);


                item.style.display =
                    matched
                        ? ""
                        : "none";

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
       ESC
    ====================================================== */

    document.addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Escape") {

                closeModal();

            }

        }
    );


    /* =====================================================
       KEYBOARD PLAYER
    ====================================================== */

    document.addEventListener(
        "keydown",
        function (event) {

            /*
             * Không xử lý phím khi đang nhập
             */

            const tag =
                document.activeElement
                    ? document.activeElement.tagName
                    : "";

            if (
                tag === "INPUT" ||
                tag === "TEXTAREA" ||
                tag === "SELECT"
            ) {
                return;
            }


            /*
             * SPACE
             */

            if (event.code === "Space") {

                event.preventDefault();

                if (!audioPlayer.src) {

                    if (songs.length > 0) {
                        playSong(0);
                    }

                    return;
                }

                if (audioPlayer.paused) {

                    audioPlayer.play();

                } else {

                    audioPlayer.pause();

                }

            }


            /*
             * ARROW RIGHT
             */

            if (
                event.key === "ArrowRight"
            ) {

                if (
                    currentIndex >= 0 &&
                    currentIndex < songs.length - 1
                ) {

                    playSong(
                        currentIndex + 1
                    );

                }

            }


            /*
             * ARROW LEFT
             */

            if (
                event.key === "ArrowLeft"
            ) {

                if (
                    currentIndex > 0
                ) {

                    playSong(
                        currentIndex - 1
                    );

                }

            }

        }
    );


    /* =====================================================
       INITIAL VOLUME
    ====================================================== */

    updateVolumeIcon();

});