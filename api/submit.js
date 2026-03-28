import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export default async function handler(req, res) {
    try {
        const { user, answers, time, prenom, nom } = req.body;

        const minutes = Math.floor(time / 60000);
        const seconds = Math.floor((time % 60000) / 1000);

        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([600, 800]);

        const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        const normalFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

        let y = 750;

        const drawText = (text, x = 50, size = 12, bold = false) => {
            page.drawText(text, {
                x,
                y,
                size,
                font: bold ? boldFont : normalFont,
                color: rgb(0, 0, 0)
            });
            y -= size + 5;
        };

// 🏛️ LOGO DOJ (gauche)
const dojBytes = await fetch("https://raw.githubusercontent.com/dojcorvin/inside-rp-examen-barreau/main/Tampon%20-%20DOJ%20Noir.png")
    .then(res => res.arrayBuffer());

const dojImage = await pdfDoc.embedPng(dojBytes);

page.drawImage(dojImage, {
    x: 50,
    y: 700,
    width: 80,
    height: 80
});

// 🏛️ TITRE (droite)
page.drawText("DEPARTMENT OF JUSTICE", {
    x: 150,
    y: 750,
    size: 16,
    font: boldFont
});

page.drawText("STATE OF SAN ANDREAS", {
    x: 160,
    y: 730,
    size: 12,
    font: normalFont
});

// 📄 INFOS (colonne droite)
let infoY = 690;

const drawInfo = (text) => {
    page.drawText(text, {
        x: 150,
        y: infoY,
        size: 12,
        font: normalFont
    });
    infoY -= 18;
};

drawInfo(`Nom : ${nom} ${prenom}`);
drawInfo(`Discord : ${user.username}`);
drawInfo(`ID : ${user.id}`);
drawInfo(`Temps : ${minutes} min ${seconds} sec`);

// 🔲 TRAIT COMPLET
page.drawLine({
    start: { x: 50, y: 640 },
    end: { x: 550, y: 640 },
    thickness: 1,
});

        y = 680;

        // 👤 INFOS
        drawText(`Nom : ${nom} ${prenom}`, 50, 12, true);

        page.drawLine({
            start: { x: 50, y: y },
            end: { x: 300, y: y },
            thickness: 1,
            color: rgb(0, 0, 0)
        });

        y -= 15;

        drawText(`Discord : ${user.username}`);
        drawText(`ID : ${user.id}`);
        drawText(`Temps : ${minutes} min ${seconds} sec`);

        y -= 10;

        // 🔴 BARRE ROUGE
        page.drawRectangle({
            x: 0,
            y: y,
            width: 600,
            height: 30,
            color: rgb(0.8, 0, 0)
        });

        page.drawText("EXAMEN DU BARREAU", {
            x: 200,
            y: y + 8,
            size: 14,
            font: boldFont,
            color: rgb(1, 1, 1)
        });

        y -= 40;

        // 📋 QUESTIONS / RÉPONSES
        answers.forEach((a, i) => {
            drawText(`Question ${i + 1} :`, 50, 12, true);
            drawText(a, 60);
            drawText("");
        });

        const pdfBytes = await pdfDoc.save();

        const formData = new FormData();
        formData.append("file", new Blob([pdfBytes]), "examen_barreau.pdf");

        formData.append("payload_json", JSON.stringify({
            content: `📚 Examen Barreau RP\n👤 ${prenom} ${nom}`
        }));

        await fetch("https://discord.com/api/webhooks/1487531036295561437/xKnt5qA12SWCQd3eRGfvdgwK50WvL22Yg-FIYrisDpeDByaE0Bs6KNi1tJnPnL-lQjRY", {
            method: "POST",
            body: formData
        });

        res.json({ success: true });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur serveur" });
    }
}
