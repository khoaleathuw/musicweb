document.addEventListener("DOMContentLoaded", function () {

    /* =========================================
       COVER PREVIEW
    ========================================= */

    const coverInput = document.getElementById("cover");
    const coverPreview = document.getElementById("coverPreview");
    const coverPlaceholder = document.getElementById("coverPlaceholder");

    if (coverInput) {

        coverInput.addEventListener("change", function () {

            const file = this.files && this.files[0];

            if (!file) {

                if (coverPreview) {
                    coverPreview.style.display = "none";
                    coverPreview.removeAttribute("src");
                }

                if (coverPlaceholder) {
                    coverPlaceholder.style.display = "flex";
                }

                return;
            }

            /* Kiểm tra file ảnh */

            const allowedTypes = [
                "image/jpeg",
                "image/png",
                "image/webp"
            ];

            if (!allowedTypes.includes(file.type)) {

                alert("Poster chỉ hỗ trợ JPG, JPEG, PNG hoặc WEBP.");

                this.value = "";

                if (coverPreview) {
                    coverPreview.style.display = "none";
                    coverPreview.removeAttribute("src");
                }

                if (coverPlaceholder) {
                    coverPlaceholder.style.display = "flex";
                }

                return;
            }

            const reader = new FileReader();

            reader.onload = function (event) {

                if (coverPreview) {

                    coverPreview.src = event.target.result;
                    coverPreview.style.display = "block";

                }

                if (coverPlaceholder) {
                    coverPlaceholder.style.display = "none";
                }

            };

            reader.readAsDataURL(file);

        });
    }


    /* =========================================
       AUDIO FILE
    ========================================= */

    const audioInput = document.getElementById("audio");
    const audioName = document.getElementById("audioName");

    if (audioInput) {

        audioInput.addEventListener("change", function () {

            const file = this.files && this.files[0];

            if (!file) {

                if (audioName) {
                    audioName.textContent = "Choose MP3 file";
                }

                return;
            }


            /* Kiểm tra MP3 */

            const fileName = file.name.toLowerCase();

            if (!fileName.endsWith(".mp3")) {

                alert("Chỉ hỗ trợ file MP3.");

                this.value = "";

                if (audioName) {
                    audioName.textContent = "Choose MP3 file";
                }

                return;
            }


            if (audioName) {
                audioName.textContent = file.name;
            }

        });
    }


    /* =========================================
       ARTIST / ALBUM
       
       KHÔNG CÒN DROPDOWN
       Backend sẽ tự tạo Artist / Album
       ========================================= */

    const artistInput = document.getElementById("artist");
    const albumInput = document.getElementById("album");


    /* =========================================
       FORM VALIDATION
    ========================================= */

    const form = document.querySelector(".song-card");

    if (form) {

        form.addEventListener("submit", function (event) {

            const titleInput = document.getElementById("title");

            const artist = artistInput
                ? artistInput.value.trim()
                : "";

            const title = titleInput
                ? titleInput.value.trim()
                : "";

            const coverFile =
                coverInput &&
                coverInput.files &&
                coverInput.files[0];

            const audioFile =
                audioInput &&
                audioInput.files &&
                audioInput.files[0];


            /* Song title */

            if (!title) {

                event.preventDefault();

                alert("Vui lòng nhập tên bài hát.");

                if (titleInput) {
                    titleInput.focus();
                }

                return;
            }


            /* Artist */

            if (!artist) {

                event.preventDefault();

                alert("Vui lòng nhập tên nghệ sĩ.");

                if (artistInput) {
                    artistInput.focus();
                }

                return;
            }


            /* Cover */

            if (!coverFile) {

                event.preventDefault();

                alert("Vui lòng chọn poster.");

                if (coverInput) {
                    coverInput.focus();
                }

                return;
            }


            /* Audio */

            if (!audioFile) {

                event.preventDefault();

                alert("Vui lòng chọn file MP3.");

                if (audioInput) {
                    audioInput.focus();
                }

                return;
            }


            /* Check MP3 */

            if (!audioFile.name.toLowerCase().endsWith(".mp3")) {

                event.preventDefault();

                alert("Chỉ hỗ trợ file MP3.");

                audioInput.value = "";

                if (audioName) {
                    audioName.textContent = "Choose MP3 file";
                }

                return;
            }


            /* =====================================
               SUBMITTING STATE
            ====================================== */

            const submitButton =
                form.querySelector(".submit-btn");

            if (submitButton) {

                submitButton.disabled = true;

                submitButton.textContent = "UPLOADING...";

            }

        });

    }

});