export default async function handler(req, res) {
    const { user, answers, time } = req.body;

    const minutes = Math.floor(time / 60000);
    const seconds = Math.floor((time % 60000) / 1000);

    const formatted = answers.map((a, i) => `Q${i + 1}: ${a}`).join("\n");

    await fetch("https://discord.com/api/webhooks/1487531036295561437/xKnt5qA12SWCQd3eRGfvdgwK50WvL22Yg-FIYrisDpeDByaE0Bs6KNi1tJnPnL-lQjRY", {
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
