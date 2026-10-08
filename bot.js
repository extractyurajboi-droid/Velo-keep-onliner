const mineflayer = require('mineflayer');
const http = require('http');

const HOST = 'boiscraftmc.falixsrv.me';
const PORT = 24930;

const BOT_USERNAME = 'AFKBot';

const WAIT_BETWEEN_ACTIONS = 3000;
const RECONNECT_DELAY = 5000;

let bot = null;
let intentionallyDisconnecting = false;
let cycle = 0;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function moveForward() {
    if (!bot || !bot.entity) return;

    console.log('[BOT] Moving forward for 1 second...');

    bot.setControlState('forward', true);

    await sleep(1000);

    if (bot) {
        bot.setControlState('forward', false);
    }
}

function createBot() {
    intentionallyDisconnecting = false;

    console.log('[BOT] Connecting to Velocity...');

    bot = mineflayer.createBot({
        host: HOST,
        port: PORT,
        username: BOT_USERNAME,
        auth: 'offline',
        version: false,
        hideErrors: false,
        checkTimeoutInterval: 120000
    });

    bot.once('spawn', async () => {
        console.log('[BOT] Connected.');

        await sleep(1000);

        await moveForward();

        await sleep(WAIT_BETWEEN_ACTIONS);

        // First server
        console.log('[BOT] Sending /server survival');
        bot.chat('/server survival');

        await sleep(WAIT_BETWEEN_ACTIONS);

        await moveForward();

        await sleep(WAIT_BETWEEN_ACTIONS);

        // Second server
        console.log('[BOT] Sending /server lobby');
        bot.chat('/server lobby');

        await sleep(WAIT_BETWEEN_ACTIONS);

        await moveForward();

        await sleep(WAIT_BETWEEN_ACTIONS);

        // Finish one complete cycle
        cycle++;
        console.log(`[BOT] Cycle ${cycle} complete.`);

        intentionallyDisconnecting = true;

        try {
            bot.quit('Reconnecting for next cycle');
        } catch (err) {
            console.log('[BOT] Quit error:', err.message);
        }
    });

    bot.on('kicked', reason => {
        console.log('[BOT] Kicked:', reason);
    });

    bot.on('error', err => {
        console.log('[BOT] Error:', err.message);
    });

    bot.on('end', () => {
        console.log('[BOT] Disconnected.');

        if (bot) {
            try {
                bot.clearControlStates();
            } catch (e) {}
        }

        bot = null;

        console.log(`[BOT] Reconnecting in ${RECONNECT_DELAY / 1000} seconds...`);

        setTimeout(() => {
            createBot();
        }, RECONNECT_DELAY);
    });
}

createBot();


// Render health server
const server = http.createServer((req, res) => {
    res.writeHead(200, {
        'Content-Type': 'text/plain'
    });

    res.end(
        `AFK Bot Online\n` +
        `Cycles completed: ${cycle}\n`
    );
});

const WEB_PORT = process.env.PORT || 10000;

server.listen(WEB_PORT, '0.0.0.0', () => {
    console.log(`[WEB] Health server running on port ${WEB_PORT}`);
});
