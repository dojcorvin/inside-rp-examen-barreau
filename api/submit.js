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

        // 🏛️ SCEAU DOJ (gauche)
        const dojBytes = await fetch("https://raw.githubusercontent.com/dojcorvin/inside-rp-examen-barreau/main/Tampon%20-%20DOJ%20Noir.png")
            .then(res => res.arrayBuffer());

        const dojImage = await pdfDoc.embedPng(dojBytes);

        page.drawImage(dojImage, {
            x: 40,
            y: 680,
            width: 80,
            height: 80
        });

        // 🏛️ TITRE CENTRÉ
        page.drawText("DEPARTMENT OF JUSTICE", {
            x: 180,
            y: 750,
            size: 16,
            font: boldFont
        });

        page.drawText("STATE OF SAN ANDREAS", {
            x: 190,
            y: 730,
            size: 12,
            font: normalFont
        });

        // Trait
        page.drawLine({
            start: { x: 50, y: 710 },
            end: { x: 550, y: 710 },
            thickness: 1,
            color: rgb(0, 0, 0)
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

        await fetch("TON_WEBHOOK", {
            method: "POST",
            body: formData
        });

        res.json({ success: true });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur serveur" });
    }
}
