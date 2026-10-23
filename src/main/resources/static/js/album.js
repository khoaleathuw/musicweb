 document.addEventListener("DOMContentLoaded", () => {

    // =====================================================
    // ELEMENTS
    // =====================================================

    const audio = document.getElementById("audioPlayer");
    const player = document.getElementById("musicPlayer");

    const playerCover = document.getElementById("playerCover");
    const playerTitle = document.getElementById("playerTitle");
    const playerArtist = document.getElementById("playerArtist");

    const mainPlayButton =
        document.getElementById("mainPlayButton");

    const previousButton =
        document.getElementById("previousButton");

    const nextButton =
        document.getElementById("nextButton");

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

    const volumeBar =
        document.getElementById("volumeBar");

    const volumeButton =
        document.getElementById("volumeButton");


    // =====================================================
    // ONLY SONGS IN THIS ALBUM
    // =====================================================

    const songs = [
        ...document.querySelectorAll(
            ".album-song[data-audio]"
        )
    ];


    // =====================================================
    // PLAYER STATE
    // =====================================================

    let currentIndex = -1;

    let shuffle = false;

    let repeat = false;

    let previousVolume = 0.8;

    /*
     * Playlist dùng cho shuffle.
     *
     * Ví dụ:
     *
     * songs:
     * 0 1 2 3 4
     *
     * shufflePlaylist:
     * 3 0 4 1 2
     *
     * Như vậy shuffle sẽ không random lại lung tung
     * mỗi lần bấm Next.
     */
    let shufflePlaylist = [];

    let shufflePosition = -1;


    // =====================================================
    // PLAYER VISIBILITY
    // =====================================================

    function showPlayer() {

        if (!player) return;

        player.classList.add("active");
    }


    // =====================================================
    // FORMAT TIME
    // =====================================================

    function formatTime(seconds) {

        if (!Number.isFinite(seconds)) {
            return "0:00";
        }

        const minutes =
            Math.floor(seconds / 60);

        const secondsPart =
            Math.floor(seconds % 60)
                .toString()
                .padStart(2, "0");

        return `${minutes}:${secondsPart}`;
    }


    // =====================================================
    // SHUFFLE ARRAY
    // Fisher-Yates
    // =====================================================

    function createShufflePlaylist() {

        shufflePlaylist = [
            ...Array(songs.length).keys()
        ];

        for (
            let i = shufflePlaylist.length - 1;
            i > 0;
            i--
        ) {

            const j =
                Math.floor(
                    Math.random() * (i + 1)
                );

            [
                shufflePlaylist[i],
                shufflePlaylist[j]
            ] = [
                shufflePlaylist[j],
                shufflePlaylist[i]
            ];
        }

        shufflePosition = -1;
    }


    // =====================================================
    // PLAY SONG
    // =====================================================

    async function playSong(card) {

        if (!card || !audio) {
            return;
        }

        const audioUrl =
            card.dataset.audio;

        if (!audioUrl) {
            return;
        }


        // ---------------------------------------------
        // CURRENT INDEX
        // ---------------------------------------------

        currentIndex =
            songs.indexOf(card);


        // ---------------------------------------------
        // SONG INFORMATION
        // ---------------------------------------------

        const title =
            card.dataset.title ||
            "Unknown";

        const artist =
            card.dataset.artist ||
            "Unknown Artist";

        const image =
            card.dataset.image ||
            "/images/default-album.jpg";


        // ---------------------------------------------
        // PLAYER UI
        // ---------------------------------------------

        if (playerTitle) {
            playerTitle.textContent = title;
        }

        if (playerArtist) {
            playerArtist.textContent = artist;
        }

        if (playerCover) {
            playerCover.src = image;
        }


        // ---------------------------------------------
        // AUDIO
        // ---------------------------------------------

        audio.src = audioUrl;

        audio.load();


        // ---------------------------------------------
        // SHOW PLAYER
        // ---------------------------------------------

        showPlayer();


        // ---------------------------------------------
        // UPDATE SHUFFLE POSITION
        // ---------------------------------------------

        if (shuffle) {

            shufflePosition =
                shufflePlaylist.indexOf(
                    currentIndex
                );

            /*
             * Nếu bài chưa có trong playlist
             * thì tạo lại playlist.
             */
            if (shufflePosition === -1) {

                createShufflePlaylist();

                shufflePosition =
                    shufflePlaylist.indexOf(
                        currentIndex
                    );
            }
        }


        // ---------------------------------------------
        // PLAY
        // ---------------------------------------------

        try {

            await audio.play();

            updatePlayButton(true);

            sendPlayCount(
                card.dataset.id
            );

        } catch (error) {

            console.error(
                "Cannot play audio:",
                error
            );

            updatePlayButton(false);
        }
    }


    // =====================================================
    // PLAY COUNT
    // =====================================================

    async function sendPlayCount(id) {

        if (!id) {
            return;
        }

        try {

            await fetch(
                `/api/songs/${id}/play`,
                {
                    method: "POST"
                }
            );

        } catch (error) {

            console.warn(
                "Play count failed:",
                error
            );
        }
    }


    // =====================================================
    // PLAY / PAUSE
    // =====================================================

    function togglePlay() {

        if (!audio) {
            return;
        }


        // Chưa có bài nào
        if (!audio.src) {

            if (songs.length > 0) {

                let firstSong = songs[0];

                if (
                    shuffle &&
                    shufflePlaylist.length > 0
                ) {

                    firstSong =
                        songs[
                            shufflePlaylist[0]
                        ];

                    shufflePosition = 0;
                }

                playSong(firstSong);
            }

            return;
        }


        // PAUSE
        if (!audio.paused) {

            audio.pause();

            updatePlayButton(false);

            return;
        }


        // PLAY
        audio.play()
            .then(() => {
                updatePlayButton(true);
            })
            .catch(error => {
                console.error(
                    "Cannot resume audio:",
                    error
                );
            });
    }


    // =====================================================
    // PLAY BUTTON UI
    // =====================================================

    function updatePlayButton(isPlaying) {

        if (!mainPlayButton) {
            return;
        }

        mainPlayButton.textContent =
            isPlaying
                ? "Ⅱ"
                : "▶";
    }


    // =====================================================
    // NEXT SONG
    // =====================================================

    function nextSong() {

        if (!songs.length) {
            return;
        }


        // =================================================
        // SHUFFLE
        // =================================================

        if (shuffle) {

            /*
             * Chưa có playlist
             */
            if (!shufflePlaylist.length) {

                createShufflePlaylist();

                shufflePosition =
                    shufflePlaylist.indexOf(
                        currentIndex
                    );
            }


            shufflePosition++;


            /*
             * Hết playlist
             *
             * Tạo một vòng shuffle mới.
             */
            if (
                shufflePosition >=
                shufflePlaylist.length
            ) {

                createShufflePlaylist();

                /*
                 * Nếu có nhiều hơn 1 bài,
                 * tránh phát lại bài vừa nghe.
                 */
                if (songs.length > 1) {

                    while (
                        shufflePlaylist[0] ===
                        currentIndex
                    ) {

                        createShufflePlaylist();
                    }
                }

                shufflePosition = 0;
            }


            const nextIndex =
                shufflePlaylist[
                    shufflePosition
                ];


            playSong(
                songs[nextIndex]
            );

            return;
        }


        // =================================================
        // NORMAL MODE
        // =================================================

        let nextIndex =
            currentIndex + 1;


        /*
         * Hết album → quay lại bài đầu
         */
        if (
            nextIndex >=
            songs.length
        ) {

            nextIndex = 0;
        }


        playSong(
            songs[nextIndex]
        );
    }


    // =====================================================
    // PREVIOUS SONG
    // =====================================================

    function previousSong() {

        if (!songs.length) {
            return;
        }


        // =================================================
        // SHUFFLE
        // =================================================

        if (
            shuffle &&
            shufflePlaylist.length
        ) {

            shufflePosition--;


            /*
             * Đầu playlist → quay cuối
             */
            if (
                shufflePosition < 0
            ) {

                shufflePosition =
                    shufflePlaylist.length - 1;
            }


            const previousIndex =
                shufflePlaylist[
                    shufflePosition
                ];


            playSong(
                songs[previousIndex]
            );

            return;
        }


        // =================================================
        // NORMAL
        // =================================================

        let previousIndex =
            currentIndex - 1;


        if (
            previousIndex < 0
        ) {

            previousIndex =
                songs.length - 1;
        }


        playSong(
            songs[previousIndex]
        );
    }


    // =====================================================
    // SONG CLICK
    // =====================================================

    songs.forEach(song => {

        song.addEventListener(
            "click",
            event => {

                /*
                 * Nếu trong card có button/link
                 * riêng thì vẫn ưu tiên phát bài.
                 */

                playSong(song);
            }
        );

    });


    // =====================================================
    // MAIN PLAY BUTTON
    // =====================================================

    if (mainPlayButton) {

        mainPlayButton.addEventListener(
            "click",
            togglePlay
        );
    }


    // =====================================================
    // NEXT BUTTON
    // =====================================================

    if (nextButton) {

        nextButton.addEventListener(
            "click",
            nextSong
        );
    }


    // =====================================================
    // PREVIOUS BUTTON
    // =====================================================

    if (previousButton) {

        previousButton.addEventListener(
            "click",
            previousSong
        );
    }


    // =====================================================
    // SHUFFLE
    // =====================================================

    if (shuffleButton) {

        shuffleButton.addEventListener(
            "click",
            () => {

                shuffle =
                    !shuffle;


                // -----------------------------------------
                // ENABLE SHUFFLE
                // -----------------------------------------

                if (shuffle) {

                    createShufflePlaylist();


                    /*
                     * Nếu đang phát bài,
                     * đặt vị trí hiện tại vào playlist.
                     */
                    if (currentIndex !== -1) {

                        shufflePosition =
                            shufflePlaylist.indexOf(
                                currentIndex
                            );


                        /*
                         * Nếu bài hiện tại không phải
                         * vị trí đầu thì vẫn giữ nguyên bài.
                         */
                    }

                } else {

                    /*
                     * Tắt shuffle
                     */
                    shufflePlaylist = [];

                    shufflePosition = -1;
                }


                shuffleButton.classList.toggle(
                    "active",
                    shuffle
                );
            }
        );
    }


    // =====================================================
    // REPEAT
    // =====================================================

    if (repeatButton) {

        repeatButton.addEventListener(
            "click",
            () => {

                repeat =
                    !repeat;


                repeatButton.classList.toggle(
                    "active",
                    repeat
                );
            }
        );
    }


    // =====================================================
    // PROGRESS BAR
    // =====================================================

    if (audio) {

        audio.addEventListener(
            "loadedmetadata",
            () => {

                if (!progressBar) {
                    return;
                }

                progressBar.max =
                    audio.duration || 0;

                if (duration) {

                    duration.textContent =
                        formatTime(
                            audio.duration
                        );
                }
            }
        );


        audio.addEventListener(
            "timeupdate",
            () => {

                if (!progressBar) {
                    return;
                }

                progressBar.value =
                    audio.currentTime || 0;


                if (currentTime) {

                    currentTime.textContent =
                        formatTime(
                            audio.currentTime
                        );
                }
            }
        );


        audio.addEventListener(
            "play",
            () => {

                updatePlayButton(true);
            }
        );


        audio.addEventListener(
            "pause",
            () => {

                updatePlayButton(false);
            }
        );
    }


    // =====================================================
    // SEEK
    // =====================================================

    if (progressBar && audio) {

        progressBar.addEventListener(
            "input",
            () => {

                audio.currentTime =
                    Number(
                        progressBar.value
                    );
            }
        );
    }


    // =====================================================
    // SONG ENDED
    // =====================================================

    if (audio) {

        audio.addEventListener(
            "ended",
            () => {


                // -----------------------------------------
                // REPEAT CURRENT SONG
                // -----------------------------------------

                if (repeat) {

                    audio.currentTime = 0;

                    audio.play()
                        .then(() => {
                            updatePlayButton(true);
                        })
                        .catch(error => {
                            console.error(
                                "Repeat failed:",
                                error
                            );
                        });

                    return;
                }


                // -----------------------------------------
                // NEXT SONG
                // -----------------------------------------

                nextSong();
            }
        );
    }


    // =====================================================
    // VOLUME
    // =====================================================

    if (volumeBar && audio) {

        audio.volume =
            Number(
                volumeBar.value
            );

        previousVolume =
            audio.volume;


        volumeBar.addEventListener(
            "input",
            () => {

                audio.volume =
                    Number(
                        volumeBar.value
                    );


                if (
                    audio.volume > 0
                ) {

                    previousVolume =
                        audio.volume;
                }


                updateVolumeIcon();
            }
        );
    }


    // =====================================================
    // MUTE
    // =====================================================

    if (volumeButton && audio) {

        volumeButton.addEventListener(
            "click",
            () => {


                // -----------------------------------------
                // MUTE
                // -----------------------------------------

                if (
                    audio.volume > 0
                ) {

                    previousVolume =
                        audio.volume;

                    audio.volume = 0;


                    if (volumeBar) {

                        volumeBar.value = 0;
                    }

                }

                // -----------------------------------------
                // UNMUTE
                // -----------------------------------------

                else {

                    audio.volume =
                        previousVolume || 0.8;


                    if (volumeBar) {

                        volumeBar.value =
                            audio.volume;
                    }
                }


                updateVolumeIcon();
            }
        );
    }


    // =====================================================
    // VOLUME ICON
    // =====================================================

    function updateVolumeIcon() {

        if (!volumeButton || !audio) {
            return;
        }


        if (
            audio.volume === 0
        ) {

            volumeButton.textContent =
                "🔇";

        } else if (
            audio.volume < 0.5
        ) {

            volumeButton.textContent =
                "🔉";

        } else {

            volumeButton.textContent =
                "🔊";
        }
    }


    // =====================================================
    // INITIALIZE
    // =====================================================

    updateVolumeIcon();

    updatePlayButton(false);

});