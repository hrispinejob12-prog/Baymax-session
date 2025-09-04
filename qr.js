// qr.js
const { makeid, generateSessionName } = require('./id');
const { encryptSession } = require('./session-encrypt');
const QRCode = require('qrcode');
const express = require('express');
const path = require('path');
const fs = require('fs');
let router = express.Router();
const pino = require("pino");
const {
    default: Maher_Zubair,
    useMultiFileAuthState,
    Browsers,
    delay,
} = require("maher-zubair-baileys");

function removeFile(FilePath) {
    if (!fs.existsSync(FilePath)) return false;
    fs.rmSync(FilePath, { recursive: true, force: true });
}

router.get('/', async (req, res) => {
    const id = makeid();
    
    // Ensure the final sessions directory exists
    const sessionsDir = path.join(__dirname, 'sessions');
    if (!fs.existsSync(sessionsDir)) {
        fs.mkdirSync(sessionsDir, { recursive: true });
    }

    async function SIGMA_MD_QR_CODE() {
        const { state, saveCreds } = await useMultiFileAuthState('./temp/' + id);
        try {
            let Qr_Code_By_Maher_Zubair = Maher_Zubair({
                auth: state,
                printQRInTerminal: false,
                logger: pino({ level: "silent" }),
                browser: Browsers.macOS("Desktop"),
            });

            Qr_Code_By_Maher_Zubair.ev.on('creds.update', saveCreds);
            Qr_Code_By_Maher_Zubair.ev.on("connection.update", async (s) => {
                const { connection, lastDisconnect, qr } = s;

                if (qr) {
                    res.end(await QRCode.toBuffer(qr));
                }

                if (connection === "open") {
                    await delay(5000);
                    
                    // --- SESSION HANDLING LOGIC (Same as pair.js) ---

                    // 1. Read the creds.json file
                    const credsData = fs.readFileSync(path.join(__dirname, `temp/${id}/creds.json`));

                    // 2. Encrypt and format the session data
                    const finalSessionString = encryptSession(credsData);

                    // 3. Generate unique name and file path
                    const uniqueName = generateSessionName();
                    const sessionFilePath = path.join(sessionsDir, `${uniqueName}.json`);

                    // 4. Save the formatted string to the file
                    fs.writeFileSync(sessionFilePath, finalSessionString);

                    // 5. Send the unique name to the user
                    const successMessage = `
✅ *Your Session ID Has Been Generated!*

Your unique session name is:
📋 \`${uniqueName}\`

Copy this name and paste it into the \`SESSION_ID\` variable in your bot's configuration.

_This session name will be used to fetch your credentials automatically from the server._

⚠️ *Do not share this ID with anyone!*
`;

                    await Qr_Code_By_Maher_Zubair.sendMessage(Qr_Code_By_Maher_Zubair.user.id, { text: successMessage });
                    
                    // --- END OF NEW LOGIC ---

                    await delay(100);
                    await Qr_Code_By_Maher_Zubair.ws.close();
                    return await removeFile("temp/" + id);

                } else if (connection === "close" && lastDisconnect?.error?.output?.statusCode !== 401) {
                    await delay(10000);
                    SIGMA_MD_QR_CODE();
                }
            });
        } catch (err) {
            console.log('Service restarted due to an error:', err);
            await removeFile("temp/" + id);
            if (!res.headersSent) {
                await res.json({ code: "Service Unavailable" });
            }
        }
    }
    return await SIGMA_MD_QR_CODE();
});

module.exports = router;
