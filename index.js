
const {
    sequelize,
    User,
    Good,
    Scan,
    Track,
    ScanUser,
    ScanGood
} = require("./db/models");

const { saveHtmlDoc } = require("./src/checker");

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
    const priceCheckerTask = cron.schedule('0 * * * *', async () => {
        console.log('cron job is begin');

        console.log('cron job end');
    });

    const jobs = [priceCheckerTask];

    bot.on('message', async msg => {
        const text = msg.text;
        const chatId = msg.chat.id;
        const user = msg.from;
        // const member = await bot.getChatMember(chatId, user.id);
        const dbUser = await User.findOne({ where: { id: user.id}});

        // user must be registered in system
        if(!dbUser && text != CommandName.START) return bot.sendMessage(chatId, '/start - to register');

        // try {
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


                                    const search_query_part = `d/list/q-${text}/`;
                                    const searchOrderByNewest = '?search%5Border%5D=created_at:desc';
                                    const url = `${baseTargetUrl}/${search_query_part}${searchOrderByNewest}`;

                                    console.log(url);

                                    const window = (await getJsDomByUrl(url, false)).window;
                                    const document = window.document;
                                    const items = document.querySelectorAll(".css-1sw7q4x");

                                    let addedCount = 0;

                                    const newGoods = [];

                                    for(let item of items) {

                                        const id = item.getAttribute('id');

                                        if(!item.querySelector('.css-16v5mdi.er34gjf0')) {
                                            writeLog(`error: id - ${id}`);
                                            continue;
                                        }

                                        const name = item.querySelector('.css-16v5mdi.er34gjf0').textContent;

                                        const url =  item.querySelector('.css-rc5s2u') ?
                                            item.querySelector('.css-rc5s2u').getAttribute('href') : '';


                                        console.log(`${baseTargetUrl}${url}`)

                                        const doc = (await getJsDomByUrl(`${baseTargetUrl}${url}`, false)).window.document;

                                        const img_url = doc.querySelector("[data-testid='swiper-image']") ?
                                            doc.querySelector("[data-testid='swiper-image']").getAttribute('src') : null;

                                        let price_uah = 0;
                                        const price_uah_raw_array = doc.querySelector('[data-testid="ad-price-container"] > h3') ?
                                            doc.querySelector('[data-testid="ad-price-container"] > h3').textContent : null;
                                        if(price_uah_raw_array === null) { price_uah = 0; }
                                        else {
                                            price_uah = fromTextToMoney(price_uah_raw_array);
                                        }

                                        const state = item.querySelector('.css-3lkihg > span') ?
                                            item.querySelector('.css-3lkihg > span').textContent : null;

                                        // const fixed = item.querySelector('.css-10b0gli.er34gjf0:nth-child(2)') ?
                                        //     item.querySelector('.css-10b0gli.er34gjf0:nth-child(2)').textContent : null;
                                        const fixed = item.querySelector('.css-1vxklie') ?
                                            item.querySelector('.css-1vxklie').textContent : null;

                                        const locationDate = item.querySelector('.css-veheph.er34gjf0')
                                            .textContent.split('-');

                                        const location = locationDate[0];
                                        const post_created_at_raw = locationDate.length <= 2 ? locationDate[1] : locationDate[locationDate.length-1];

                                        let post_created_at = "";
                                        const toDayPrefix = 'Сегодня в ';
                                        if(post_created_at_raw.includes(toDayPrefix)) {
                                            const time = post_created_at_raw.replace(toDayPrefix, '') + ":00";
                                            const date = moment().format('DD-MM-YYYY');
                                            // DD-MM-YYYY hh:mm
                                            post_created_at = moment(`${date}${time}`, 'DD-MM-YYYY hh:mm:SS').format();
                                            console.log(`${date}${time}`)
                                        }
                                        else {
                                            post_created_at = moment(post_created_at_raw, 'DD MMMM YYYY').format();
                                            console.log(post_created_at);
                                        }

                                        writeLog(JSON.stringify({
                                            id, name, url, img_url, price_uah, state, fixed, location, post_created_at
                                        }))

                                        const [newGood, created] = await Good.findOrCreate({
                                                where: {id},
                                                defaults: {
                                                    id,
                                                    name,
                                                    url,
                                                    img_url,
                                                    price_uah,
                                                    state,
                                                    fixed,
                                                    location,
                                                    post_created_at
                                                }
                                            }
                                        );

                                        newGoods.push(newGood);

                                        addedCount++;
                                    }



                                    const [scan, created] = await Scan.findOrCreate({
                                        where: { query_text: text },
                                        defaults: {
                                            query_text: text,
                                            last_scan_at: moment().format(),
                                        }
                                    });

                                    const su = await ScanUser.findOrCreate({
                                        where: { scanId: scan.id, userId: dbUser.id },
                                        defaults:  { scanId: scan.id, userId: dbUser.id }
                                    });

                                    for (let good of newGoods) {
                                        const sg = await ScanGood.findOrCreate({
                                            where: { scanId: scan.id, goodId: good.id },
                                            defaults:  { scanId: scan.id, goodId: good.id }
                                        });
                                    }

                                    console.log(`=========================== count ${items.length} ===========================`)
                                    console.log(`=========================== added ${addedCount} ===========================`)

                                    CommandHistory.deleteCommandHistoryIfExist(user);
                                    return bot.sendMessage(chatId,StatusMessages.SUCCESS_ADD_TO_TRACK_LIST);
                                }
                                if(existCommand.step == 1) {
                                    return bot.sendMessage(chatId, StatusMessages.SUCCESS_ADD_TO_TRACK_LIST);
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
        // } catch (e) {
        //     writeLog(`Error ${e}`);
        //     return bot.sendMessage(chatId, StatusMessages.ERROR);
        // }
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




