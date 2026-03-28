import { PDFDocument, StandardFonts } from 'pdf-lib';

export default async function handler(req, res) {
    const { user, answers, time } = req.body;

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

    drawText(`EXAMEN BARREAU RP`);
    drawText(``);
    drawText(`Nom: ${user.username}`);
    drawText(`ID: ${user.id}`);
    drawText(`Temps: ${minutes} min ${seconds} sec`);
    drawText(``);

    answers.forEach((a, i) => {
        drawText(`Q${i + 1}: ${a}`);
        drawText(``);
    });

    const pdfBytes = await pdfDoc.save();

    // conversion base64 pour Discord
    const base64 = Buffer.from(pdfBytes).toString('base64');

    await fetch("https://discord.com/api/webhooks/1487531036295561437/xKnt5qA12SWCQd3eRGfvdgwK50WvL22Yg-FIYrisDpeDByaE0Bs6KNi1tJnPnL-lQjRY", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            content: `📚 Nouvel examen de ${user.username}`,
            files: [
                {
                    name: "examen.pdf",
                    data: base64
                }
            ]
        })
    });

    res.json({ success: true });
}
