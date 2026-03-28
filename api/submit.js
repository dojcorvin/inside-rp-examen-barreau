import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export default async function handler(req, res) {
    try {
        const { user, answers, time, prenom, nom } = req.body;

        // 🔒 Vérification
        if (!user || !answers || !prenom || !nom) {
            return res.status(400).json({ error: "Données manquantes" });
        }

        const minutes = Math.floor(time / 60000);
        const seconds = Math.floor((time % 60000) / 1000);

        // 📄 Création PDF
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([600, 800]);

        const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        const normalFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

        let y = 750;

        const drawText = (text, size = 12, bold = false) => {
            page.drawText(text, {
                x: 50,
                y,
                size,
                font: bold ? boldFont : normalFont,
                color: rgb(0, 0, 0)
            });
            y -= size + 6;
        };

        // 🖼️ LOGO SERVEUR (EN HAUT À DROITE)
        const logoBytes = await fetch("https://raw.githubusercontent.com/dojcorvin/inside-rp-examen-barreau/main/logo_inside_principal.png")
            .then(res => res.arrayBuffer());

        const logoImage = await pdfDoc.embedPng(logoBytes);

        page.drawImage(logoImage, {
            x: 400,
            y: 680,
            width: 150,
            height: 150
        });

        // 🏛️ TITRE
        drawText("BARREAU DE LOS SANTOS", 18, true);
        drawText("Examen Officiel", 14);
        drawText("");

        // 👤 INFOS
        drawText(`Nom : ${nom}`);
        drawText(`Prénom : ${prenom}`);
        drawText(`Discord : ${user.username}`);
        drawText(`ID : ${user.id}`);
        drawText(`Temps : ${minutes} min ${seconds} sec`);
        drawText("");

        drawText("__________________________________", 12);
        drawText("");

        // 📋 QUESTIONS / RÉPONSES
        answers.forEach((a, i) => {
            drawText(`Question ${i + 1}`, 12, true);
            drawText(a);
            drawText("");
        });

        // 🏛️ SCEAU DOJ (EN BAS TRANSPARENT)
        const dojBytes = await fetch("https://raw.githubusercontent.com/dojcorvin/inside-rp-examen-barreau/main/Tampon%20-%20DOJ%20Noir.png")
            .then(res => res.arrayBuffer());

        const dojImage = await pdfDoc.embedPng(dojBytes);

        page.drawImage(dojImage, {
            x: 150,
            y: 50,
            width: 300,
            height: 300,
            opacity: 0.15
        });

        // 💾 Sauvegarde PDF
        const pdfBytes = await pdfDoc.save();

        // 📤 Envoi Discord
        const formData = new FormData();
        formData.append("file", new Blob([pdfBytes]), "examen_barreau.pdf");

        formData.append("payload_json", JSON.stringify({
            content: `📚 Examen Barreau RP\n👤 ${prenom} ${nom}\n💬 ${user.username}`
        }));

        const response = await fetch("https://discord.com/api/webhooks/1487531036295561437/xKnt5qA12SWCQd3eRGfvdgwK50WvL22Yg-FIYrisDpeDByaE0Bs6KNi1tJnPnL-lQjRY", {
            method: "POST",
            body: formData
        });

        if (!response.ok) {
            throw new Error("Erreur envoi Discord");
        }

        res.json({ success: true });

    } catch (error) {
        console.error("ERREUR:", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
}
