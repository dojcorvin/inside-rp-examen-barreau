import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export default async function handler(req, res) {
    try {
        const { user, answers, time, prenom, nom } = req.body;

        if (!user || !answers || !prenom || !nom) {
            return res.status(400).json({ error: "Données manquantes" });
        }

        const minutes = Math.floor(time / 60000);
        const seconds = Math.floor((time % 60000) / 1000);

        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([600, 800]);

        // 🧾 BACKGROUND
        const bgBytes = await fetch("https://raw.githubusercontent.com/dojcorvin/inside-rp-examen-barreau/main/doj_a4_background.png")
            .then(res => res.arrayBuffer());
        
        const bgImage = await pdfDoc.embedPng(bgBytes);
        
        page.drawImage(bgImage, {
            x: 0,
            y: 0,
            width: 600,
            height: 800,
        });

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

        // 🏛️ LOGO DOJ 
        const dojBytes = await fetch("https://raw.githubusercontent.com/dojcorvin/inside-rp-examen-barreau/main/Tampon%20-%20DOJ%20Noir.png")
            .then(res => res.arrayBuffer());

        const dojImage = await pdfDoc.embedPng(dojBytes);

        page.drawImage(dojImage, {
            x: 470,   
            y: 680,
            width: 100,
            height: 100
        });

        // 🏛️ TITRES CENTRÉS
        const title = "DEPARTMENT OF JUSTICE";
        const subtitle = "STATE OF SAN ANDREAS";

        const titleWidth = boldFont.widthOfTextAtSize(title, 16);
        const subtitleWidth = normalFont.widthOfTextAtSize(subtitle, 12);

        page.drawText(title, {
            x: (600 - titleWidth) / 2,
            y: 750,
            size: 16,
            font: boldFont
        });

        page.drawText(subtitle, {
            x: (600 - subtitleWidth) / 2,
            y: 730,
            size: 12,
            font: normalFont
        });

        // 📏 TRAIT
        page.drawLine({
            start: { x: 50, y: 710 },
            end: { x: 550, y: 710 },
            thickness: 1,
        });

        y = 680;

        // 👤 INFOS
        drawText(`Nom : ${nom} ${prenom}`, 50, 12, true);
        drawText(`Discord : ${user.username}`);
        drawText(`ID : ${user.id}`);
        drawText(`Temps : ${minutes} min ${seconds} sec`);

        // ⏳ ESPACE AVANT BARRE ROUGE
        y -= 20;

        // 🔴 BARRE ROUGE
        page.drawRectangle({
            x: 0,
            y: y,
            width: 600,
            height: 30,
            color: rgb(0.7, 0, 0)
        });

        // 🎯 TEXTE CENTRÉ PARFAITEMENT
        const examText = "EXAMEN DU BARREAU";
        const examWidth = boldFont.widthOfTextAtSize(examText, 14);

        page.drawText(examText, {
            x: (600 - examWidth) / 2,
            y: y + 8,
            size: 14,
            font: boldFont,
            color: rgb(1, 1, 1)
        });

        y -= 45;

        // 📋 QUESTIONS
        answers.forEach((a, i) => {
            drawText(`Question ${i + 1} :`, 50, 12, true);
            drawText(a, 60);
            drawText("");
        });

        const pdfBytes = await pdfDoc.save();

        const formData = new FormData();
        formData.append("file", new Blob([pdfBytes]), "examen.pdf");

        formData.append("payload_json", JSON.stringify({
            content: `📚 Examen Barreau RP\n👤 ${prenom} ${nom}`
        }));

        const discordRes = await fetch("https://discord.com/api/webhooks/1487531036295561437/xKnt5qA12SWCQd3eRGfvdgwK50WvL22Yg-FIYrisDpeDByaE0Bs6KNi1tJnPnL-lQjRY", {
            method: "POST",
            body: formData
        });

        if (!discordRes.ok) {
            throw new Error("Erreur Discord");
        }

        res.json({ success: true });

    } catch (error) {
        console.error("ERREUR:", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
}
