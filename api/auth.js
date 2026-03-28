export default async function handler(req, res) {
    const code = req.query.code;

    if (!code) {
        return res.redirect(
            "https://discord.com/api/oauth2/authorize?client_id=1487533972127744001&redirect_uri=https://inside-rp-examen-barreau.vercel.app/api/auth&response_type=code&scope=identify"
        );
    }

    const params = new URLSearchParams();
    params.append("client_id", "1487533972127744001");
    params.append("client_secret", "6cPvij_8xU0169BlvNXiztkYqkFu82Oz");
    params.append("grant_type", "authorization_code");
    params.append("code", code);
    params.append("redirect_uri", "https://inside-rp-examen-barreau.vercel.app/api/auth");

    const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
        method: "POST",
        body: params,
        headers: { "Content-Type": "application/x-www-form-urlencoded" }
    });

    const tokenData = await tokenRes.json();

    const userRes = await fetch("https://discord.com/api/users/@me", {
        headers: {
            Authorization: `Bearer ${tokenData.access_token}`
        }
    });

    const user = await userRes.json();

    return res.redirect(`/frontend/index.html?user=${encodeURIComponent(JSON.stringify(user))}`);
}
