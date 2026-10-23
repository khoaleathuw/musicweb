document.addEventListener("DOMContentLoaded", function () {

    const playlistName = document.getElementById("playlistName");
    const characterCount = document.getElementById("characterCount");

    if (!playlistName || !characterCount) {
        return;
    }


    function updateCharacterCount() {

        const length = playlistName.value.length;

        characterCount.textContent =
            `${length}/100`;

    }


    playlistName.addEventListener(
        "input",
        updateCharacterCount
    );


    updateCharacterCount();

});