const TelegramBot = require('node-telegram-bot-api');
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require("@google/generative-ai");
const express = require('express');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const token = process.env.BOT_TOKEN;
const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

app.get('/', (req, res) => {
    const html = `
    <html>
    <head>
        <title>praAI BOT - Telegram</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 0;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                height: 100vh;
                background-color: #f5f5f5;
                line-height: 1.6;
            }
            h1 {
                font-size: 2.5em;
                color: #333;
                text-shadow: 2px 2px #fff;
                margin-bottom: 0.5em;
                text-align: center;
            }
            h2 {
                font-size: 1.2em;
                color: #666;
                text-shadow: 1px 1px #fff;
                margin-top: 0;
                text-align: center;
            }
        </style>
    </head>
    <body>
        <h1>praAI BOT is active</h1>
        <br>
        <h2>Copyright PRA Code</h2>
    </body>
</html>
    `;
    res.send(html);
});

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash-latest",
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
];

let chatSession;

const bot = new TelegramBot(token, {polling: true});

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Hai! Aktifkan bot ini dengan mendaftar terlebih dahulu, lalu ketik pesan atau pertanyaan untuk mendapatkan respon.\n\nJangan lupa follow sosial media author:\nInstagram: instagram.com/jayyidsptr\nTelegram: jayyidsptrr.t.me\nTrakteer: trakteer.id/jayyidsptr/tip\nSaweria: saweria.co/jayyidsptr/tip');
});

bot.onText(/\/help/, async (msg) => {
  const chatId = msg.chat.id;
  if (chatSession) {
    // Jika bot telah diaktifkan, tampilkan pesan help untuk mode chat
    bot.sendMessage(chatId, 'Ketik apa saja untuk memulai mengobrol dengan bot.\n\nGunakan /quit untuk keluar dari chat.', {
      reply_markup: {
        remove_keyboard: true
      }
    });
  } else {
    // Jika bot belum diaktifkan, tampilkan pesan help untuk mode non-chat
    const keyboard = [
      [
        {
          text: 'Daftar',
          url: process.env.REGISTRATION_URL
        }
      ]
    ];
    bot.sendMessage(chatId, 'Bot ini dapat diaktifkan dengan mendaftar terlebih dahulu. Setelah diaktifkan, ketik pesan atau pertanyaan untuk mendapatkan respon.\n\nUntuk keluar dari chat, ketik /quit.', {
      reply_markup: {
        inline_keyboard: keyboard
      }
    });
  }
});

bot.onText(/\/about/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Bot ini dibangun menggunakan Google Generative AI API dan Telegram Bot API.');
});

bot.onText(/\/enable/, (msg) => {
  chatSession = model.startChat({
    generationConfig,
    safetySettings,
    history: [
    ],
  });
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Bot telah diaktifkan. Silakan kirim pesan atau pertanyaan.\n\nUntuk mengaktifkannya kembali cukup ketik perintah /enable.');
});

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  if (!chatSession) {
    if (msg.text === '/quit') {
      bot.sendMessage(chatId, 'Bot belum aktif. Silahkan mendaftar terlebih dahulu.', {
      reply_markup: {
        inline_keyboard: [
          [{text: 'Daftar', url: process.env.REGISTRATION_URL}]
        ]
      }
    });
      return;
   }
    bot.sendMessage(chatId, 'Bot belum diaktifkan. Silakan mendaftar terlebih dahulu.', {
    reply_markup: {
      inline_keyboard: [
        [{text: 'Daftar', url: process.env.REGISTRATION_URL}]
      ]
    }
});
return;
  }
  if (msg.text === '/quit') {
    bot.sendMessage(chatId, 'Bot telah dinonaktifkan. Terima kasih.');
    chatSession = null;
    return;
  }
  try {
    const result = await chatSession.sendMessage(msg.text);
    bot.sendMessage(chatId, result.response.text());
  } catch (error) {
    botsendMessage(chatId, 'Terjadi kesalahan, silakan coba lagi.');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT);

console.log(`bot start running & server running on port ${PORT}`);

