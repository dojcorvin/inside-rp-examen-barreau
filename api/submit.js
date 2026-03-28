export default async function handler(req, res) {
    const { user, answers, time } = req.body;

    const minutes = Math.floor(time / 60000);
    const seconds = Math.floor((time % 60000) / 1000);

    const formatted = answers.map((a, i) => `Q${i + 1}: ${a}`).join("\n");

    await fetch("TON_WEBHOOK", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            content:
`📚 EXAMEN BARREAU

👤 ${user.username}
🆔 ${user.id}

⏱️ Temps: ${minutes} min ${seconds} sec

📝 Réponses:
${formatted}`
        })
    });

    res.json({ success: true });
}
