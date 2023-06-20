
const {
    sequelize,
    User,
    Good,
    Scan,
    Track,
    ScanUser,
    ScanGood
} = require("./db/models");

const { saveHtmlDoc, checkNewGoods } = require("./src/checker");

const {
    StatusMessages,
    CommandName,
    BotCommand,
    stickerList,
    getDefAnswer,
    getExtraQuestion,
    getInfoMsg,
    AdminCommandName, fromTextToMoney
} = require('./src/utills');
const CommandHistory = require('./src/commandHistory');

require('dotenv').config();


const TelegramApi = require('node-telegram-bot-api');
const token = process.env.CHAT_BOT_TOKEN;
const baseTargetUrl = process.env.BASE_TARGET_URL;

const mode = process.env.MODE ?? 'development';
const bot = new TelegramApi(token, {
    polling: true
});

const fs = require('fs');
const writeLog = require('./src/logger.js');
const cron = require('node-cron');
const moment = require("moment/moment");
moment.locale('ru');
const axios = require("axios");
const {getJsDomByUrl} = require("./src/checker");
const {logger} = require("sequelize/lib/utils/logger");

const default_scan_location_url_part = '';

bot.setMyCommands([...BotCommand.map(c => ({ command: c.name, description: c.description }))]);

const admin_user_id = 473591842;


const start = async () =>
{
    writeLog('Service was started');

    await sequelize.authenticate();
    await sequelize.sync();


    // every day scan
    const priceCheckerTask = cron.schedule('* * * * *', async () => {
        console.log('cron job is begin');

        const users = await User.findAll();

        for (let user of users) {
            const scans = await user.getScans();

            if(scans.length === 0) return;

            for (let scan of scans) {
                const {newGoods} = await checkNewGoods(scan.query_text, user);
                await Scan.update({ last_scan_at: moment().format()}, { where: {id: scan.id}});
                //TODO: currency checker
                newGoods.forEach(item => {
                    const msg = `<a href="${baseTargetUrl+item.url}">${item.name}</a> 
- ${item.price_uah}грн [${moment(item.post_created_at).format("DD-MM-YYYY")}]`;
                    bot.sendMessage(user.chatId, msg,{ parse_mode: 'HTML' });
                })
            }
        }

        console.log('cron job end');
    });

    const jobs = [priceCheckerTask];

    bot.on('message', async msg => {
        const text = msg.text;
        const chatId = msg.chat.id;
        const user = msg.from;
        const dbUser = await User.findOne({ where: { id: user.id}});

        if(!dbUser && text != CommandName.START) return bot.sendMessage(chatId, '/start - to register');

        try {
            switch (text) {
                case CommandName.START: {
                    CommandHistory.deleteCommandHistoryIfExist(user);
                    await bot.sendSticker(chatId, stickerList.find(s => s.name == 'Hello').url);
                    if(!dbUser) {
                        await User.create({ id: user.id, chatId, name: user.first_name });
                        return bot.sendMessage(chatId, getDefAnswer(text));
                    } else {
                        return bot.sendMessage(chatId, StatusMessages.INFO_TIP);
                    }
                }
                case CommandName.INFO: {
                    CommandHistory.deleteCommandHistoryIfExist(user);
                    return bot.sendMessage(chatId, getInfoMsg(), { parse_mode: 'HTML' });
                }

                case CommandName.SCAN_BY_QUERY: {
                    CommandHistory.deleteCommandHistoryIfExist(user);
                    CommandHistory.addOrUpdateCommandHistory(user, CommandName.SCAN_BY_QUERY);
                    return bot.sendMessage(chatId, "Отправь запрос для поиска");
                }

                case CommandName.QUERY_HISTORY: {
                    CommandHistory.deleteCommandHistoryIfExist(user);

                    const su = await ScanUser.findAll({
                        where: { userId: dbUser.id },
                        include: [Scan]
                    });
                    if(su.length === 0) return bot.sendMessage(chatId, StatusMessages.NOT_FOUND);
                    const answer = su.map((suItem, index) =>
                        `${index+1}) ${suItem.Scan.query_text}`).join('\n');

                    return bot.sendMessage(chatId, answer);
                }

                case CommandName.ADD_QUERY_TRACK: {


                }
                case CommandName.QUERY_TRACK_LIST: {
                    const scans = await dbUser.getScans();

                    const tracks = await Track.findAll({
                        where: { userId: dbUser.id, scanId: [scans.map(scan => scan.id)] },
                        include: [Scan]
                    });

                    const answer = tracks.map((track, index) =>
                        `${index+1}) ${track.Scan.query_text}`).join('\n');

                    return bot.sendMessage(chatId, answer.length > 0 ? answer : StatusMessages.NOT_FOUND);
                }

                case CommandName.DELETE_MY_SCAN: {
                    CommandHistory.deleteCommandHistoryIfExist(user);
                    CommandHistory.addOrUpdateCommandHistory(user, CommandName.DELETE_MY_SCAN);
                    return bot.sendMessage(chatId, "Укажите текст запроса на сканирования");
                }

                case AdminCommandName.STOP_ALL_CORN_JOBS: {
                    if (user.id !== admin_user_id)
                        return bot.sendMessage(chatId, StatusMessages.NOT_ALLOW_FOR_YOUR_ROLE)
                    jobs.forEach(job => job.stop());
                    return bot.sendMessage(chatId, 'corn jobs stopped successfully');
                }
                case AdminCommandName.START_ALL_CORN_JOBS: {
                    if (user.id !== admin_user_id)
                        return bot.sendMessage(chatId, StatusMessages.NOT_ALLOW_FOR_YOUR_ROLE)
                    jobs.forEach(job => job.start());
                    return bot.sendMessage(chatId, 'corn jobs started successfully');
                }
                case AdminCommandName.SHOW_LOGS: {
                    if (user.id !== admin_user_id)
                        return bot.sendMessage(chatId, StatusMessages.NOT_ALLOW_FOR_YOUR_ROLE);
                    return bot.sendDocument(chatId, './logs/logs.txt', { caption: "logs"});
                }

                default: {
                    const existCommand = CommandHistory.history.find(c => c.user.id == user.id);
                    if(existCommand) {
                        switch (existCommand.command) {
                            case CommandName.SCAN_BY_QUERY: {
                                if(existCommand.step == 0)  {
                                    if(text.length === 0) return bot.sendMessage(chatId, StatusMessages.NOT_CORRECT_DATA)
                                    await checkNewGoods(text, dbUser);
                                    CommandHistory.deleteCommandHistoryIfExist(user);
                                    return bot.sendMessage(chatId,StatusMessages.SUCCESS_ADD_TO_TRACK_LIST);
                                }
                                break;
                            }
                            case CommandName.DELETE_MY_SCAN: {
                                const scan = await Scan.findOne({ where: { query_text: text }});
                                const su = await ScanUser.destroy({
                                    where: { scanId: scan.id, userId: dbUser.id },
                                });
                                return bot.sendMessage(chatId, StatusMessages.SUCCESS_DELETED);
                            }
                        }
                    }
                    return bot.sendMessage(chatId, StatusMessages.COMMAND_NOT_FOUND);
                }
            }
        } catch (e) {
            writeLog(`Error ${e}`);
            return bot.sendMessage(chatId, StatusMessages.ERROR);
        }
    })

    bot.on('callback_query', async (query) =>{
        //настройки для редактирования сообщения
        const opts = {
            chat_id: query.message.chat.id,
            message_id: query.message.message_id,
        };

        const [command, payload] = query.data.split('#');

        switch (command) {
            case CommandName.SCAN_BY_CATEGORY: {

                break;
            }
        }
    });
    bot.on("polling_error", (msg) => console.log(msg));
}

start();


console.log("end");




