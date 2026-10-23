/* =========================================================
   ELEMENTS
========================================================= */

const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

const showRegister =
    document.getElementById("showRegister");

const showLogin =
    document.getElementById("showLogin");

const canvas =
    document.getElementById("visualizer");

const ctx =
    canvas.getContext("2d");

const audio =
    document.getElementById("ambientAudio");

const experienceOverlay =
    document.getElementById("experienceOverlay");

const enterExperience =
    document.getElementById("enterExperience");


/* =========================================================
   NEON PALETTE
   cycles lime -> cyan -> pink across the ring, MTP-style
========================================================= */

const PALETTE = [
    { r: 184, g: 255, b: 61 },   // lime
    { r: 0,   g: 229, b: 255 },  // cyan
    { r: 255, g: 46,  b: 99 }    // pink
];

function paletteColor(t, alpha) {

    // t: 0..1 position around the ring
    const scaled = (t % 1) * PALETTE.length;

    const i = Math.floor(scaled);

    const next = (i + 1) % PALETTE.length;

    const f = scaled - i;

    const a = PALETTE[i];

    const b = PALETTE[next];

    const r = Math.round(a.r + (b.r - a.r) * f);

    const g = Math.round(a.g + (b.g - a.g) * f);

    const bl = Math.round(a.b + (b.b - a.b) * f);

    return `rgba(${r},${g},${bl},${alpha})`;

}


/* =========================================================
   LOGIN / REGISTER SWITCH
========================================================= */

showRegister.addEventListener("click", () => {

    loginForm.classList.remove("active");

    setTimeout(() => {

        registerForm.classList.add("active");

    }, 120);

});


showLogin.addEventListener("click", () => {

    registerForm.classList.remove("active");

    setTimeout(() => {

        loginForm.classList.add("active");

    }, 120);

});


/* =========================================================
   PASSWORD TOGGLE
========================================================= */

document
    .querySelectorAll(".password-toggle")
    .forEach(button => {

        button.addEventListener("click", () => {

            const targetId =
                button.dataset.target;

            const input =
                document.getElementById(targetId);

            if (input.type === "password") {

                input.type = "text";

            } else {

                input.type = "password";

            }

        });

    });


/* =========================================================
   AUDIO VISUALIZER
========================================================= */

let audioContext;

let analyser;

let source;

let dataArray;

let animationId;

let rotation = 0;


function resizeCanvas() {

    const ratio =
        window.devicePixelRatio || 1;

    canvas.width =
        window.innerWidth * ratio;

    canvas.height =
        window.innerHeight * ratio;

    canvas.style.width =
        window.innerWidth + "px";

    canvas.style.height =
        window.innerHeight + "px";

    ctx.setTransform(
        ratio,
        0,
        0,
        ratio,
        0,
        0
    );

}


resizeCanvas();

window.addEventListener(
    "resize",
    resizeCanvas
);


/* =========================================================
   START AUDIO
========================================================= */

async function startExperience() {

    try {

        audioContext =
            new (
                window.AudioContext ||
                window.webkitAudioContext
            )();

        analyser =
            audioContext.createAnalyser();

        analyser.fftSize = 256;

        analyser.smoothingTimeConstant =
            0.82;

        source =
            audioContext.createMediaElementSource(
                audio
            );

        source.connect(analyser);

        analyser.connect(
            audioContext.destination
        );

        dataArray =
            new Uint8Array(
                analyser.frequencyBinCount
            );

        await audio.play();

        experienceOverlay
            .classList
            .add("hidden");

        drawVisualizer();

    } catch (error) {

        console.error(
            "Audio error:",
            error
        );

        experienceOverlay
            .classList
            .add("hidden");

        drawFakeVisualizer();

    }

}


enterExperience.addEventListener(
    "click",
    startExperience
);


/* =========================================================
   REAL VISUALIZER
========================================================= */

function drawVisualizer() {

    animationId =
        requestAnimationFrame(
            drawVisualizer
        );

    analyser.getByteFrequencyData(
        dataArray
    );

    drawBackground();

    const width =
        window.innerWidth;

    const height =
        window.innerHeight;

    const centerX =
        width / 2;

    const centerY =
        height / 2;

    const bars = 80;

    const radius =
        Math.min(width, height) * .23;

    const maxBarHeight =
        Math.min(width, height) * .22;

    rotation += 0.0009;

    ctx.save();

    ctx.translate(
        centerX,
        centerY
    );

    for (
        let i = 0;
        i < bars;
        i++
    ) {

        const value =
            dataArray[
                Math.floor(
                    i *
                    dataArray.length /
                    bars
                )
            ] / 255;

        const angle =
            (i / bars) *
            Math.PI *
            2;

        const barHeight =
            8 +
            value *
            maxBarHeight;

        const x1 =
            Math.cos(angle) *
            radius;

        const y1 =
            Math.sin(angle) *
            radius;

        const x2 =
            Math.cos(angle) *
            (radius + barHeight);

        const y2 =
            Math.sin(angle) *
            (radius + barHeight);

        const t = (i / bars + rotation) % 1;

        const gradient =
            ctx.createLinearGradient(
                x1,
                y1,
                x2,
                y2
            );

        gradient.addColorStop(
            0,
            paletteColor(t, .05)
        );

        gradient.addColorStop(
            .5,
            paletteColor(t, .55)
        );

        gradient.addColorStop(
            1,
            paletteColor(t, .95)
        );

        ctx.beginPath();

        ctx.moveTo(
            x1,
            y1
        );

        ctx.lineTo(
            x2,
            y2
        );

        ctx.strokeStyle =
            gradient;

        ctx.lineWidth =
            2;

        ctx.lineCap =
            "round";

        ctx.stroke();

    }

    /* center glow */

    const average =
        dataArray.reduce(
            (a, b) => a + b,
            0
        ) /
        dataArray.length;

    const glow =
        120 +
        average * .4;

    const centerGradient =
        ctx.createRadialGradient(
            0,
            0,
            5,
            0,
            0,
            glow
        );

    centerGradient.addColorStop(
        0,
        paletteColor(rotation, .18)
    );

    centerGradient.addColorStop(
        1,
        paletteColor(rotation, 0)
    );

    ctx.fillStyle =
        centerGradient;

    ctx.beginPath();

    ctx.arc(
        0,
        0,
        glow,
        0,
        Math.PI * 2
    );

    ctx.fill();

    ctx.restore();

}


/* =========================================================
   BACKGROUND
========================================================= */

function drawBackground() {

    const width =
        window.innerWidth;

    const height =
        window.innerHeight;

    ctx.clearRect(
        0,
        0,
        width,
        height
    );

    const gradient =
        ctx.createRadialGradient(
            width * .5,
            height * .5,
            50,
            width * .5,
            height * .5,
            Math.max(
                width,
                height
            ) * .7
        );

    gradient.addColorStop(
        0,
        "rgba(184,255,61,.025)"
    );

    gradient.addColorStop(
        .45,
        "rgba(0,0,0,.02)"
    );

    gradient.addColorStop(
        1,
        "rgba(0,0,0,.25)"
    );

    ctx.fillStyle =
        gradient;

    ctx.fillRect(
        0,
        0,
        width,
        height
    );

}


/* =========================================================
   FAKE VISUALIZER FALLBACK
========================================================= */

function drawFakeVisualizer() {

    let fakeRotation = 0;

    function animate() {

        requestAnimationFrame(
            animate
        );

        const fake =
            new Uint8Array(128);

        for (
            let i = 0;
            i < fake.length;
            i++
        ) {

            fake[i] =
                70 +
                Math.random() * 80;

        }

        dataArray =
            fake;

        drawBackground();

        const width =
            window.innerWidth;

        const height =
            window.innerHeight;

        fakeRotation += 0.0009;

        ctx.save();

        ctx.translate(
            width / 2,
            height / 2
        );

        const bars = 80;

        const radius =
            Math.min(width, height) * .23;

        for (
            let i = 0;
            i < bars;
            i++
        ) {

            const value =
                fake[
                    i %
                    fake.length
                ] / 255;

            const angle =
                i / bars *
                Math.PI *
                2;

            const length =
                10 +
                value *
                100;

            const t = (i / bars + fakeRotation) % 1;

            ctx.beginPath();

            ctx.moveTo(
                Math.cos(angle) *
                radius,

                Math.sin(angle) *
                radius
            );

            ctx.lineTo(
                Math.cos(angle) *
                (radius + length),

                Math.sin(angle) *
                (radius + length)
            );

            ctx.strokeStyle =
                paletteColor(t, .55);

            ctx.lineWidth = 2;

            ctx.stroke();

        }

        ctx.restore();

    }

    animate();

}


/* =========================================================
   REGISTER VALIDATION
========================================================= */

const register =
    document.getElementById("register");

register.addEventListener(
    "submit",
    event => {

        const password =
            document.getElementById(
                "registerPassword"
            ).value;

        const confirm =
            document.getElementById(
                "confirmPassword"
            ).value;

        if (password !== confirm) {

            event.preventDefault();

            alert(
                "Passwords do not match."
            );

        }

        if (password.length < 6) {

            event.preventDefault();

            alert(
                "Password must contain at least 6 characters."
            );

        }

    }
);