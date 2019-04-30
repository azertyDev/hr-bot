process.env["NTBA_FIX_319"] = 1;
const TelegramBot = require('node-telegram-bot-api');
const token = require('./config').token;
const bot = new TelegramBot(token, {polling: true});
const request = require('request');
const axios = require('axios');
// const cron = require('node-schedule');
var cron = require('node-cron');
 
bot.onText(/\/start/, (msg) => {
    const chat_id = msg.chat.id;
    const msg_text = msg.text;
    
    var options = {
        reply_markup: {
            keyboard: [
                ['My tasks'],
                ['Add task']
            ]
        }
    };

    bot.sendMessage(chat_id, 'Welcome!', options);

    cron.schedule('30 8 * * *', () => {
        bot.sendMessage(chat_id,'Are you aware of your tasks ?!');
        var options = {
            reply_markup: JSON.stringify({
                inline_keyboard: [
                    [{ text: 'Add task', callback_data: 'add' }]
                ]
            })
        };
        bot.sendMessage(chat_id, 'Enter your task for today!',options);
    });

    // cron.schedule('0 0 9 * * *', () => {
    //     bot.sendMessage(chat_id,'Are you aware of your tasks ?!');
    // });
});



bot.on('message', (msg) => {
    const chat_id = msg.chat.id;
    const msg_text = msg.text;
    // console.log(msg_text);

    if(msg_text === 'My tasks') {
        request('http://firstlyapi.herokuapp.com/api/tasks', { json: true }, (err, res, body) => {
            if (err) { return console.log(err); }
            body.forEach(function(element) {
                var text ="<b>"+ element.text +"</b>\n" + element.date;  

                var options = {
                    reply_markup: JSON.stringify({
                        inline_keyboard: [
                            [{text: '✅', callback_data: 'done'},{ text: 'Edit', callback_data: `${element.id}` }]
                        ]
                    }),
                    parse_mode : "HTML"
                };
                bot.sendMessage(chat_id, text, options);
            });
        });
    } else if(msg_text == 'Add task'){
        bot.sendMessage(chat_id, "Enter your new task:");
        axios.post('http://firstlyapi.herokuapp.com/api/tasks',{
            text: msg.text,
            date: Date.now()
        })
        .then(res => {
            console.log(res);
        })
        .catch(error => {
            console.log(error);
        });
        // bot.sendMessage(chat_id, `You said: ${msg_text}`);

    }
    

    bot.on('callback_query', function onCallbackQuery(query) {
        const id = query.id;
        const chat_id = query.message.chat.id;
        const data = query.data;
        let text;

        if (data === 'my_tasks') {
            request('http://firstlyapi.herokuapp.com/api/tasks', { json: true }, (err, res, body) => {
                if (err) { return console.log(err); }
                body.forEach(function(element) {
                    var text ="<b>"+ element.text +"</b>\n" + element.date;  
                    
                    var options = {
                        reply_markup: JSON.stringify({
                            inline_keyboard: [
                                [{text: '✅', callback_data: 'done'},{ text: 'Edit', callback_data: `${element.id}` }],
                            ]
                        }),
                        parse_mode : "HTML"
                    };
                    bot.sendMessage(chat_id, text, options);
                });
            });
        }   
    });
});

bot.on("polling_error", (err) => console.log(err));
