const express = require('express');
const { WebSocketServer } = require('ws');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
// const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const bodyParser = require('body-parser');

const app = express();
const portWeb = 3003;
const portMC = 8000;

const db = new sqlite3.Database('./database.sqlite', (err) => {
    if (err) console.error(err.message);
    db.run(`CREATE TABLE IF NOT EXISTS redemptions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        player_name TEXT,
        code TEXT,
        claimed_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
});

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

let minecraftWS = null;

const wss = new WebSocketServer({ port: portMC }, () => {
    console.log(`[MC] WebSocket Server running on port ${portMC}`);
});

wss.on('connection', (ws) => {
    minecraftWS = ws;
    console.log("[MC] Minecraft Connected!");

    const sendCmd = (cmd) => {
        ws.send(JSON.stringify({
            header: { version: 1, requestId: crypto.randomUUID(), messageType: "commandRequest", messagePurpose: "commandRequest" },
            body: { commandLine: cmd, version: 1 }
        }));
    };

    sendCmd("playsound random.levelup @a");
    ws.send(JSON.stringify({
        header: { version: 1, requestId: crypto.randomUUID(), messageType: "commandRequest", messagePurpose: "subscribe" },
        body: { eventName: "PlayerMessage" }
    }));

    ws.on('message', (data) => {
        const msg = JSON.parse(data);
        if (msg.header.eventName === "PlayerMessage") {
            const { sender, message } = msg.body;
            const content = message.trim();

            if (content === "SUMMER2016" && sender !== "External") {
                db.get("SELECT * FROM redemptions WHERE player_name = ? AND code = ?", [sender, "SUMMER2016"], (err, row) => {
                    if (row) {
                        sendCmd(`tellraw "${sender}" {"rawtext":[{"text":"§cYou already claimed this!"}]}`);
                        sendCmd(`playsound note.bass ${sender}`)
                    } else {
                        db.run("INSERT INTO redemptions (player_name, code) VALUES (?, ?)", [sender, "SUMMER2016"]);
                        const announceMsg = JSON.stringify({ rawtext: [{ text: `[§l§bSERVER§r] §aCode redeemed by §e${sender}` }] });
                        sendCmd(`tellraw @a ${announceMsg}`);
                        sendCmd(`title ${sender} actionbar §a+3000 XP`)
                        sendCmd(`xp 3000 ${sender}`);
                        sendCmd(`playsound random.orb ${sender}`);
                    }
                });
            }
        }
    });

    ws.on('close', () => {
        minecraftWS = null;
        console.log("[MC] Disconnected");
    });
});

app.get('/', (req, res) => {
    db.all("SELECT * FROM redemptions ORDER BY claimed_at DESC", [], (err, rows) => {
        res.render('index', { 
            redemptions: rows, 
            isOnline: minecraftWS !== null 
        }, (err, html) => {
            res.render('base', { 
                body: html, 
                isOnline: minecraftWS !== null 
            });
        });
    });
});

app.post('/announce', (req, res) => {
    if (minecraftWS) {
        const rawMsg = JSON.stringify({ rawtext: [{ text: `[§l§bANNOUNCEMENT§r] §l§e»§r §e${req.body.announcement}§r` }] });
        minecraftWS.send(JSON.stringify({
            header: { version: 1, requestId: crypto.randomUUID(), messageType: "commandRequest", messagePurpose: "commandRequest" },
            body: { commandLine: `tellraw @a ${rawMsg}`, version: 1 }
        }));
        minecraftWS.send(JSON.stringify({
            header: { version: 1, requestId: crypto.randomUUID(), messageType: "commandRequest", messagePurpose: "commandRequest" },
            body: { commandLine: `title @a title §e${req.body.announcement}`, version: 1 }
        }));
        minecraftWS.send(JSON.stringify({
            header: { version: 1, requestId: crypto.randomUUID(), messageType: "commandRequest", messagePurpose: "commandRequest" },
            body: { commandLine: `playsound note.pling @a`, version: 1 }
        }));
    }
    res.redirect('/');
});

app.post('/delete/:id', (req, res) => {
    db.run("DELETE FROM redemptions WHERE id = ?", req.params.id);
    res.redirect('/');
});

app.listen(portWeb, () => {
    console.log(`[WEB] Dashboard running at http://localhost:${portWeb}`);
});