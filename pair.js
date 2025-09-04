// pair.js
const { makeid, generateSessionName } = require('./id');
const { encryptSession } = require('./session-encrypt');
const express = require('express');
const fs = require('fs');
const path = require('path');
const pino = require('pino');
let router = express.Router();
const {
    default: Malvin_Tech,
    useMultiFileAuthState,
    delay,
    makeCacheableSignalKeyStore,
    Browsers
} = require('@whiskeysockets/baileys');

function removeFile(FilePath) {
    if (!fs.existsSync(FilePath)) return false;
    fs.rmSync(FilePath, { recursive: true, force: true });
}

router.get('/', async (req, res) => {
    const id = makeid();
    let num = req.query.number;
    
    // Ensure the final sessions directory exists
    const sessionsDir = path.join(__dirname, 'sessions');
    if (!fs.existsSync(sessionsDir)) {
        fs.mkdirSync(sessionsDir, { recursive: true });
    }

    async function Malvin_PAIR_CODE() {
        const { state, saveCreds } = await useMultiFileAuthState('./temp/' + id);
        try {
            let Pair_Code_By_Malvin_Tech = Malvin_Tech({
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'fatal' }).child({ level: 'fatal' })),
                },
                printQRInTerminal: false,
                logger: pino({ level: 'fatal' }).child({ level: 'fatal' }),
                browser: Browsers.macOS('Chrome')
            });

            if (!Pair_Code_By_Malvin_Tech.authState.creds.registered) {
                await delay(1500);
                num = num.replace(/[^0-9]/g, '');
                const code = await Pair_Code_By_Malvin_Tech.requestPairingCode(num);
                if (!res.headersSent) {
                    await res.send({ code });
                }
            }

            Pair_Code_By_Malvin_Tech.ev.on('creds.update', saveCreds);
            Pair_Code_By_Malvin_Tech.ev.on('connection.update', async (s) => {
                const { connection, lastDisconnect } = s;
                if (connection === 'open') {
                    await delay(5000);
                    
                    // --- NEW SESSION HANDLING LOGIC ---

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

                    await Pair_Code_By_Malvin_Tech.sendMessage(Pair_Code_By_Malvin_Tech.user.id, { text: successMessage });
                    
                    // --- END OF NEW LOGIC ---

                    await delay(100);
                    await Pair_Code_By_Malvin_Tech.ws.close();
                    return await removeFile('./temp/' + id);

                } else if (connection === 'close' && lastDisconnect?.error?.output?.statusCode !== 401) {
                    await delay(10000);
                    Malvin_PAIR_CODE();
                }
            });
        } catch (err) {
            console.log('Service restarted due to an error:', err);
            await removeFile('./temp/' + id);
            if (!res.headersSent) {
                await res.send({ code: 'Service Currently Unavailable' });
            }
        }
    }
    
    return await Malvin_PAIR_CODE();
});

module.exports = router;
