require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const telegramBotApi = require('node-telegram-bot-api');
const {text} = require('express');
// const axios = require('axios');

const {log} = console;

const {TELEGRAM_TOKEN} = process.env;

const bot = new telegramBotApi(TELEGRAM_TOKEN, {polling: true});

const app = express();
app.use(bodyParser.json());

const chats = {};
const gameOptions = {
    reply_markup: JSON.stringify({
        inline_keyboard: [
            [
                {text: '0', callback_data: '0'},
                {text: '1', callback_data: '1'},
                {text: '2', callback_data: '2'},
                {text: '3', callback_data: '3'},
                {text: '4', callback_data: '4'},
            ],
            [
                {text: '5', callback_data: '5'},
                {text: '6', callback_data: '6'},
                {text: '7', callback_data: '7'},
                {text: '8', callback_data: '8'},
                {text: '9', callback_data: '9'},
            ]
        ]
    })
};

let counter = 0;

const start = async () => {

    bot.setMyCommands([
        {command: '/start', description: 'welcome to chat'},
        {command: '/info', description: 'here is your info'},
        {command: '/game', description: 'play a guess number game'},
    ]);

    bot.on('message', async (msg) => {
        log(msg);
        const chatId = msg.chat.id;
        const text = msg.text;

        if(msg.from.is_bot) return sendMessage(chatId, 'Your are BOT');

        if(text === '/start') {
            return bot.sendMessage(chatId, `Welcome ${msg.from.first_name}, let me introduce my art to you!`);
        }

        if(text === '/info') {
            return bot.sendMessage(chatId, `your name is ${msg.from.first_name} and your username is ${msg.from.username}`);
        }

        if(text === '/game') {
            await bot.sendMessage(chatId, 'Can your guess what number I have on my mind? A little hint for you: the number is inbetween 0 and 9');
            const randomNumber = Math.floor(Math.random() * 10);

            chats[chatId] = randomNumber;
            await bot.sendMessage(chatId, 'guess now:)', gameOptions);
            return;
        }

        return bot.sendMessage(chatId, `how should I react to your message: ${text}`);
    });

    bot.on('callback_query', async msg => {

        const data = msg.data;
        const chatId = msg.message.chat.id;
        let answer;

        await bot.sendMessage(chatId, `so, you guess it is a ${data}`);
        counter++;

        if(+chats[chatId] === +data) {
            answer = "you're right!";
            counter = 0;
            return setTimeout(async () => await bot.sendMessage(chatId, answer), 500);



        } else {
            answer = "try again, I believe in you"; setTimeout(async () => await bot.sendMessage(chatId, answer, gameOptions), 300);

        }

        if(counter === 2) {
            let row;
            chats[chatId] >= 5 ? row = 'second' : row = 'first';
            await bot.sendMessage(chatId, `want a hint? It's in the ${row} row`);
        }

        if(counter === 3) {
            counter = 0;
            return bot.sendMessage(chatId, `too bad, it was ${chats[chatId]}`);
        }

    });
};

start();

app.listen(3333, async () => {
    console.log('running');
});