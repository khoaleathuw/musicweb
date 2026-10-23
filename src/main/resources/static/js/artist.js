document.addEventListener("DOMContentLoaded", () => {

    /* =========================================================
       ELEMENTS
    ========================================================= */

    const audio = document.getElementById("audioPlayer");
    const player = document.getElementById("musicPlayer");

    const playerCover =
        document.getElementById("playerCover");

    const playerTitle =
        document.getElementById("playerTitle");

    const playerArtist =
        document.getElementById("playerArtist");

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


    /* =========================================================
       ONLY SONGS
       
       Chỉ những element có:
       
       class="artist-song"
       data-audio="..."
       
       mới được đưa vào player.
       
       Artist / Album không có data-audio
       nên không phát nhạc.
    ========================================================= */

    const songs = [
        ...document.querySelectorAll(
            ".artist-song[data-audio]"
        )
    ];


    /* =========================================================
       STATE
    ========================================================= */

    let currentIndex = -1;

    /*
     * Shuffle
     *
     * false = phát theo thứ tự
     * true  = phát random theo queue
     */
    let shuffle = false;


    /*
     * Repeat mode
     *
     * 0 = OFF
     * 1 = ALL
     * 2 = ONE
     */
    let repeatMode = 0;


    /*
     * Queue chứa index của songs
     */
    let queue = [];


    /*
     * Vị trí hiện tại trong queue
     */
    let queuePosition = -1;


    /*
     * Lịch sử bài đã nghe
     */
    let history = [];


    /*
     * Volume
     */
    let previousVolume = 0.8;


    /* =========================================================
       CREATE NORMAL QUEUE
    ========================================================= */

    function createNormalQueue() {

        queue = [];

        for (let i = 0; i < songs.length; i++) {
            queue.push(i);
        }

    }


    /* =========================================================
       SHUFFLE ARRAY
       
       Fisher-Yates shuffle
    ========================================================= */

    function shuffleArray(array) {

        const result = [...array];

        for (
            let i = result.length - 1;
            i > 0;
            i--
        ) {

            const randomIndex =
                Math.floor(
                    Math.random() * (i + 1)
                );

            [
                result[i],
                result[randomIndex]
            ] = [
                result[randomIndex],
                result[i]
            ];
        }

        return result;
    }


    /* =========================================================
       CREATE SHUFFLE QUEUE
       
       Bài hiện tại luôn giữ lại.
       Những bài còn lại được random.
    ========================================================= */

    function createShuffleQueue(
        currentSongIndex = -1
    ) {

        const remainingSongs = [];

        for (let i = 0; i < songs.length; i++) {

            if (i !== currentSongIndex) {
                remainingSongs.push(i);
            }

        }


        const shuffled =
            shuffleArray(remainingSongs);


        if (currentSongIndex >= 0) {

            queue = [
                currentSongIndex,
                ...shuffled
            ];

            queuePosition = 0;

        } else {

            queue = shuffled;

            queuePosition = -1;
        }
    }


    /* =========================================================
       REBUILD QUEUE
    ========================================================= */

    function rebuildQueue(
        currentSongIndex = -1
    ) {

        if (shuffle) {

            createShuffleQueue(
                currentSongIndex
            );

        } else {

            createNormalQueue();

            if (currentSongIndex >= 0) {

                queuePosition =
                    queue.indexOf(
                        currentSongIndex
                    );

            } else {

                queuePosition = -1;
            }
        }
    }


    /*
     * Khởi tạo queue
     */
    rebuildQueue();


    /* =========================================================
       SHOW PLAYER
    ========================================================= */

    function showPlayer() {

        if (!player) {
            return;
        }

        player.classList.add("active");
    }


    /* =========================================================
       FORMAT TIME
    ========================================================= */

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


    /* =========================================================
       PLAY SONG
    ========================================================= */

    async function playSong(
        card,
        saveHistory = true
    ) {

        if (!card || !audio) {
            return;
        }


        const audioUrl =
            card.dataset.audio;

        if (!audioUrl) {
            return;
        }


        const songIndex =
            songs.indexOf(card);

        if (songIndex === -1) {
            return;
        }


        /*
         * Lưu bài hiện tại vào history
         *
         * Không lưu nếu Previous đang gọi.
         */
        if (
            saveHistory &&
            currentIndex !== -1 &&
            currentIndex !== songIndex
        ) {

            history.push(currentIndex);

            /*
             * Không để history quá dài
             */
            if (history.length > 100) {
                history.shift();
            }
        }


        currentIndex = songIndex;


        /*
         * Tìm bài trong queue
         */
        const position =
            queue.indexOf(songIndex);


        if (position !== -1) {

            queuePosition = position;

        } else {

            /*
             * Nếu chưa có thì tạo lại queue
             */
            rebuildQueue(songIndex);
        }


        /* =====================================================
           SONG INFO
        ===================================================== */

        const title =
            card.dataset.title ||
            "Unknown";

        const artist =
            card.dataset.artist ||
            "Unknown Artist";

        const image =
            card.dataset.image ||
            "/images/default-album.jpg";


        /* =====================================================
           LOAD AUDIO
        ===================================================== */

        audio.src = audioUrl;

        audio.load();


        /* =====================================================
           PLAYER UI
        ===================================================== */

        if (playerTitle) {

            playerTitle.textContent =
                title;
        }


        if (playerArtist) {

            playerArtist.textContent =
                artist;
        }


        if (playerCover) {

            playerCover.src =
                image;
        }


        showPlayer();


        /* =====================================================
           PLAY
        ===================================================== */

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


    /* =========================================================
       PLAY COUNT
    ========================================================= */

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


    /* =========================================================
       PLAY / PAUSE
    ========================================================= */

    function togglePlay() {

        if (!audio) {
            return;
        }


        /*
         * Chưa chọn bài
         */
        if (!audio.src) {

            if (songs.length === 0) {
                return;
            }


            /*
             * Nếu shuffle đang bật
             */
            if (shuffle) {

                rebuildQueue();

                if (queue.length > 0) {

                    playSong(
                        songs[queue[0]]
                    );
                }

            } else {

                playSong(
                    songs[0]
                );
            }

            return;
        }


        /*
         * Đang pause
         */
        if (audio.paused) {

            audio.play();

            updatePlayButton(true);

        } else {

            /*
             * Đang phát
             */
            audio.pause();

            updatePlayButton(false);
        }
    }


    /* =========================================================
       UPDATE PLAY BUTTON
    ========================================================= */

    function updatePlayButton(
        isPlaying
    ) {

        if (!mainPlayButton) {
            return;
        }

        mainPlayButton.textContent =
            isPlaying
                ? "Ⅱ"
                : "▶";
    }


    /* =========================================================
       NEXT SONG
    ========================================================= */

    function nextSong() {

        if (!songs.length) {
            return;
        }


        /* =====================================================
           REPEAT ONE
        ===================================================== */

        if (repeatMode === 2) {

            audio.currentTime = 0;

            audio.play();

            updatePlayButton(true);

            return;
        }


        /* =====================================================
           TẠO QUEUE NẾU CHƯA CÓ
        ===================================================== */

        if (!queue.length) {

            rebuildQueue(
                currentIndex
            );
        }


        let nextPosition =
            queuePosition + 1;


        /* =====================================================
           CÒN BÀI TRONG QUEUE
        ===================================================== */

        if (
            nextPosition <
            queue.length
        ) {

            queuePosition =
                nextPosition;


            const nextIndex =
                queue[queuePosition];


            playSong(
                songs[nextIndex]
            );

            return;
        }


        /* =====================================================
           HẾT QUEUE
        ===================================================== */

        /*
         * REPEAT ALL
         */
        if (repeatMode === 1) {

            rebuildQueue(
                currentIndex
            );


            /*
             * Nếu shuffle:
             *
             * queue[0] = bài hiện tại
             *
             * nên lấy queue[1]
             */
            if (
                shuffle &&
                queue.length > 1
            ) {

                queuePosition = 1;

            } else {

                queuePosition = 0;
            }


            const nextIndex =
                queue[queuePosition];


            playSong(
                songs[nextIndex]
            );

            return;
        }


        /*
         * OFF
         *
         * Không repeat thì dừng.
         */
        audio.pause();

        updatePlayButton(false);

        /*
         * Đưa về đầu progress
         */
        audio.currentTime = 0;

        if (progressBar) {
            progressBar.value = 0;
        }

        if (currentTime) {
            currentTime.textContent =
                "0:00";
        }
    }


    /* =========================================================
       PREVIOUS SONG
    ========================================================= */

    function previousSong() {

        if (!songs.length) {
            return;
        }


        /*
         * Nếu bài đã chạy > 3 giây
         * thì Previous chỉ reset bài hiện tại.
         */
        if (
            audio &&
            audio.currentTime > 3
        ) {

            audio.currentTime = 0;

            return;
        }


        /* =====================================================
           HISTORY
        ===================================================== */

        if (history.length > 0) {

            const previousIndex =
                history.pop();


            /*
             * Tìm lại vị trí trong queue
             */
            const previousPosition =
                queue.indexOf(
                    previousIndex
                );


            if (previousPosition !== -1) {

                queuePosition =
                    previousPosition;
            }


            playSong(
                songs[previousIndex],
                false
            );

            return;
        }


        /* =====================================================
           KHÔNG CÓ HISTORY
        ===================================================== */

        if (!queue.length) {
            return;
        }


        let previousPosition =
            queuePosition - 1;


        /*
         * Nếu đang ở đầu queue
         */
        if (previousPosition < 0) {

            if (repeatMode === 1) {

                previousPosition =
                    queue.length - 1;

            } else {

                previousPosition = 0;
            }
        }


        queuePosition =
            previousPosition;


        const previousIndex =
            queue[queuePosition];


        playSong(
            songs[previousIndex],
            false
        );
    }


    /* =========================================================
       AUDIO METADATA
    ========================================================= */

    if (audio) {

        audio.addEventListener(
            "loadedmetadata",
            () => {

                if (progressBar) {

                    progressBar.max =
                        audio.duration || 0;

                    progressBar.value = 0;
                }


                if (duration) {

                    duration.textContent =
                        formatTime(
                            audio.duration
                        );
                }


                if (currentTime) {

                    currentTime.textContent =
                        "0:00";
                }
            }
        );


        /* =====================================================
           TIME UPDATE
        ===================================================== */

        audio.addEventListener(
            "timeupdate",
            () => {

                if (progressBar) {

                    progressBar.value =
                        audio.currentTime || 0;
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
           SONG ENDED
        ===================================================== */

        audio.addEventListener(
            "ended",
            () => {

                /*
                 * Repeat ONE
                 */
                if (repeatMode === 2) {

                    audio.currentTime = 0;

                    audio.play();

                    updatePlayButton(true);

                    return;
                }


                /*
                 * Sang bài tiếp
                 */
                nextSong();
            }
        );
    }


    /* =========================================================
       PROGRESS BAR
    ========================================================= */

    if (progressBar) {

        progressBar.addEventListener(
            "input",
            () => {

                if (!audio) {
                    return;
                }

                audio.currentTime =
                    Number(
                        progressBar.value
                    );
            }
        );
    }


    /* =========================================================
       SONG CLICK
    ========================================================= */

    songs.forEach(
        (card) => {

            card.addEventListener(
                "click",
                () => {

                    /*
                     * Chỉ Song có data-audio
                     * mới chạy vào đây.
                     */

                    playSong(card);
                }
            );
        }
    );


    /* =========================================================
       MAIN PLAY BUTTON
    ========================================================= */

    if (mainPlayButton) {

        mainPlayButton.addEventListener(
            "click",
            togglePlay
        );
    }


    /* =========================================================
       PREVIOUS BUTTON
    ========================================================= */

    if (previousButton) {

        previousButton.addEventListener(
            "click",
            previousSong
        );
    }


    /* =========================================================
       NEXT BUTTON
    ========================================================= */

    if (nextButton) {

        nextButton.addEventListener(
            "click",
            nextSong
        );
    }


    /* =========================================================
       SHUFFLE
       
       OFF → ON → OFF
    ========================================================= */

    if (shuffleButton) {

        shuffleButton.addEventListener(
            "click",
            () => {

                shuffle =
                    !shuffle;


                /*
                 * Bật shuffle
                 */
                if (shuffle) {

                    rebuildQueue(
                        currentIndex
                    );

                    shuffleButton.classList.add(
                        "active"
                    );

                    shuffleButton.textContent =
                        "🔀";

                    shuffleButton.title =
                        "Shuffle: ON";

                }

                /*
                 * Tắt shuffle
                 */
                else {

                    rebuildQueue(
                        currentIndex
                    );

                    shuffleButton.classList.remove(
                        "active"
                    );

                    shuffleButton.textContent =
                        "🔀";

                    shuffleButton.title =
                        "Shuffle: OFF";
                }
            }
        );


        shuffleButton.title =
            "Shuffle: OFF";
    }


    /* =========================================================
       REPEAT
       
       OFF → ALL → ONE → OFF
    ========================================================= */

    if (repeatButton) {

        repeatButton.addEventListener(
            "click",
            () => {

                repeatMode++;


                if (repeatMode > 2) {
                    repeatMode = 0;
                }


                /* =============================================
                   OFF
                ============================================= */

                if (repeatMode === 0) {

                    repeatButton.classList.remove(
                        "active"
                    );

                    repeatButton.textContent =
                        "🔁";

                    repeatButton.title =
                        "Repeat: OFF";
                }


                /* =============================================
                   REPEAT ALL
                ============================================= */

                else if (repeatMode === 1) {

                    repeatButton.classList.add(
                        "active"
                    );

                    repeatButton.textContent =
                        "🔁";

                    repeatButton.title =
                        "Repeat: ALL";
                }


                /* =============================================
                   REPEAT ONE
                ============================================= */

                else {

                    repeatButton.classList.add(
                        "active"
                    );

                    repeatButton.textContent =
                        "🔂";

                    repeatButton.title =
                        "Repeat: ONE";
                }
            }
        );


        repeatButton.title =
            "Repeat: OFF";
    }


    /* =========================================================
       VOLUME
    ========================================================= */

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


                if (audio.volume > 0) {

                    previousVolume =
                        audio.volume;
                }


                updateVolumeIcon();
            }
        );
    }


    /* =========================================================
       MUTE
    ========================================================= */

    if (volumeButton && audio) {

        volumeButton.addEventListener(
            "click",
            () => {

                /*
                 * Mute
                 */
                if (audio.volume > 0) {

                    previousVolume =
                        audio.volume;

                    audio.volume = 0;


                    if (volumeBar) {

                        volumeBar.value = 0;
                    }
                }


                /*
                 * Unmute
                 */
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


    /* =========================================================
       VOLUME ICON
    ========================================================= */

    function updateVolumeIcon() {

        if (!volumeButton || !audio) {
            return;
        }


        if (audio.volume === 0) {

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


    /* =========================================================
       INITIAL VOLUME ICON
    ========================================================= */

    updateVolumeIcon();

});