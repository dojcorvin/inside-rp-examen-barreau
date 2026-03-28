let user = null;
let startTime;

let warned25 = false;
let warned29 = false;

let questions = [];

const questionBank = [
    { question: "Expliquez la présomption d'innocence.", type: "text" },
    { question: "Quel est le rôle d’un avocat ?", type: "text" },
    { question: "Quel tribunal juge les crimes graves ?", type: "qcm", choices: ["Cour pénale", "Tribunal civil", "Mairie"] }
];

// 🔐 LOGIN
function login() {
    window.location.href = "/api/auth";
}

// 📥 USER
function getUser() {
    const params = new URLSearchParams(window.location.search);
    const data = params.get("user");

    if (data) {
        user = JSON.parse(decodeURIComponent(data));
        localStorage.setItem("user", data);
    } else {
        const stored = localStorage.getItem("user");
        if (stored) user = JSON.parse(stored);
    }
}

// ⏱️ START TIME (persistant)
function initStartTime() {
    const stored = localStorage.getItem("startTime");

    if (stored) {
        startTime = parseInt(stored);
    } else {
        startTime = Date.now();
        localStorage.setItem("startTime", startTime);
    }
}

// 🎲 QUESTIONS
function generateQuestions() {
    questions = questionBank.sort(() => 0.5 - Math.random());

    const container = document.getElementById("questions");
    container.innerHTML = "";

    questions.forEach((q, i) => {
        if (q.type === "text") {
            container.innerHTML += `
                <p>${q.question}</p>
                <textarea id="q${i}"></textarea>
            `;
        } else {
            container.innerHTML += `
                <p>${q.question}</p>
                <select id="q${i}">
                    ${q.choices.map(c => `<option>${c}</option>`).join("")}
                </select>
            `;
        }
    });
}

// 🚨 WARNING UI
function showWarning(message) {
    const div = document.createElement("div");
    div.innerText = message;

    div.style.position = "fixed";
    div.style.top = "20px";
    div.style.left = "50%";
    div.style.transform = "translateX(-50%)";
    div.style.background = "gold";
    div.style.color = "black";
    div.style.padding = "10px 20px";
    div.style.borderRadius = "8px";

    document.body.appendChild(div);

    setTimeout(() => div.remove(), 5000);
}

// ⏱️ TIMER
function startTimer() {
    setInterval(() => {
        const elapsed = Date.now() - startTime;

        const min = Math.floor(elapsed / 60000);
        const sec = Math.floor((elapsed % 60000) / 1000);

        document.getElementById("timer").innerText =
            `Temps: ${min} min ${sec} sec`;

        if (min >= 25 && !warned25) {
            warned25 = true;
            showWarning("⚠️ Il vous reste environ 5 minutes !");
        }

        if (min >= 29 && !warned29) {
            warned29 = true;
            showWarning("🚨 Dernière minute !");
        }

    }, 1000);
}

// 📩 SUBMIT
async function submitExam() {

    // 🔐 Récupération identité
    const prenom = document.getElementById("prenom").value;
    const nom = document.getElementById("nom").value;

    // ⚠️ Vérification
    if (!prenom || !nom) {
        alert("Veuillez renseigner votre nom et prénom.");
        return;
    }

    // 📋 Réponses
    const answers = questions.map((_, i) => {
        return document.getElementById("q" + i).value;
    });

    // ⏱️ Temps
    const time = Date.now() - startTime;

    // 📩 Envoi
    await fetch("/api/submit", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ user, answers, time, prenom, nom })
    });

    // 🧹 reset
    localStorage.removeItem("startTime");

    document.body.innerHTML = "<h2>Examen envoyé</h2>";
}

// 🚀 INIT
window.onload = () => {
    getUser();

    if (user) {
        document.getElementById("login").style.display = "none";
        document.getElementById("exam").style.display = "block";

        initStartTime();
        generateQuestions();
        startTimer();
    }
};
