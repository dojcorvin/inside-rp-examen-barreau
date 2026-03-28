import { PDFDocument, StandardFonts } from 'pdf-lib';

export default async function handler(req, res) {
    try {
        const { user, answers, time, prenom, nom } = req.body;

        const minutes = Math.floor(time / 60000);
        const seconds = Math.floor((time % 60000) / 1000);

        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([600, 800]);

        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

        let y = 750;

        const drawText = (text) => {
            page.drawText(text, { x: 50, y, size: 12, font });
            y -= 20;
        };

        drawText(`EXAMEN BARREAU - Inside RP`);
        drawText(``);
        drawText(`Nom: ${nom}`);
        drawText(`Prénom: ${prenom}`);
        drawText(`Discord: ${user.username}`);
        drawText(`ID: ${user.id}`);
        drawText(`ID: ${user.id}`);
        drawText(`Temps: ${minutes} min ${seconds} sec`);
        drawText(``);

        answers.forEach((a, i) => {
            drawText(`Q${i + 1}: ${a}`);
            drawText(``);
        });

        const pdfBytes = await pdfDoc.save();

        // 🧠 Création FormData
        const formData = new FormData();

        formData.append("file", new Blob([pdfBytes]), "examen.pdf");

        formData.append("payload_json", JSON.stringify({
            content: `📚 Nouvel examen

            👤 ${prenom} ${nom}
            💬 Discord: ${user.username}`
        }));

        await fetch("https://discord.com/api/webhooks/1487531036295561437/xKnt5qA12SWCQd3eRGfvdgwK50WvL22Yg-FIYrisDpeDByaE0Bs6KNi1tJnPnL-lQjRY", {
            method: "POST",
            body: formData
        });

        res.json({ success: true });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erreur serveur" });
    }
}
