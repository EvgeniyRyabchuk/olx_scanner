
const url = 'https://jabko.ua/zaporizhzhia/rus/';

const { GoodsPageType, fromTextToMoney} = require('./utills');
const axios = require('axios')
const jsdom = require("jsdom");
const {Category, Good, History, User, TrackedGood, Scan, ScanUser, ScanGood} = require("../db/models");
const path = require('path');
const fs = require("fs");
const writeLog = require("./logger");
const moment = require("moment");
const {all} = require("axios");
const { JSDOM } = jsdom;

require('dotenv').config();

const baseTargetUrl = process.env.BASE_TARGET_URL;


const saveHtmlDoc = (html) => {
    var fs = require('fs');
    fs.appendFile('123.html', html.toString("utf-8"), function (err) {
        if (err) throw err;
        console.log('Saved!');
    })
}

const getJsDomByUrl = async (url, isSave = false) => {
    const response = await axios.get(`${url}`, {
        responseType: 'document',
        headers: {
            // cacheControl: 'no-cache',
            // pragma: 'no-cache',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'Expires': '0',
            'Cookie': 'currency=UAH; sc=D80AFC0B-6285-4664-7244-DC91A3D22691; _gcl_au=1.1.784045452.1685257063; _ms=954ebda9-c107-4e9d-b0bd-3053a907a8d1; _hjSessionUser_2828866=eyJpZCI6ImFlMjg3ZDY0LWI1ZDItNTExYS1hNzdhLTJlMzYxY2YwYTdjYSIsImNyZWF0ZWQiOjE2ODUyNTcwNjMzMjYsImV4aXN0aW5nIjp0cnVlfQ==; rcusi=1; user_store_id=8; store_id=8; PHPSESSID=2ncg5v9dpn7fb88lf9uhj5mpv3; _gid=GA1.2.636623163.1686400205; ln_or=eyIzNTMwMzQwIjoiZCJ9; language=rus; _hjSession_2828866=eyJpZCI6Ijg3NDU0ZTM4LWFjOWMtNDA5OS04M2I1LWVkOWFmMTQ4MTc0NyIsImNyZWF0ZWQiOjE2ODY0NzA4MjQ3OTcsImluU2FtcGxlIjpmYWxzZX0=; _hjAbsoluteSessionInProgress=0; _ga_6XL3GWYTYK=GS1.1.1686470824.28.1.1686471633.0.0.0; _ga=GA1.2.1180345601.1685257063; biatv-cookie={%22firstVisitAt%22:1685257062%2C%22visitsCount%22:9%2C%22campaignCount%22:1%2C%22currentVisitStartedAt%22:1686470830%2C%22currentVisitLandingPage%22:%22https://jabko.ua/zaporizhzhia/rus/iphone/%22%2C%22currentVisitOpenPages%22:8%2C%22location%22:%22https://jabko.ua/rus/iphone/apple-iphone-13/apple-iphone-13-128gb-midnight%22%2C%22locationTitle%22:%22%D0%9A%D1%83%D0%BF%D0%B8%D1%82%D1%8C%20Apple%20iPhone%2013%20128GB%20(Midnight)%20%E2%80%94%20%D1%86%D0%B5%D0%BD%D1%8B%20%E2%9A%A1%2C%20%D0%BE%D1%82%D0%B7%D1%8B%D0%B2%D1%8B%20%E2%9A%A1%2C%20%D1%85%D0%B0%D1%80%D0%B0%D0%BA%D1%82%D0%B5%D1%80%D0%B8%D1%81%D1%82%D0%B8%D0%BA%D0%B8%20%E2%80%94%20%D0%AF%D0%91%D0%9A%D0%9E%22%2C%22userAgent%22:%22Mozilla/5.0%20(Windows%20NT%2010.0%3B%20Win64%3B%20x64)%20AppleWebKit/537.36%20(KHTML%2C%20like%20Gecko)%20Chrome/114.0.0.0%20Safari/537.36%22%2C%22language%22:%22ru%22%2C%22encoding%22:%22utf-8%22%2C%22screenResolution%22:%222195x1235%22%2C%22currentVisitUpdatedAt%22:1686471640%2C%22utmDataCurrent%22:{%22utm_source%22:%22google%22%2C%22utm_medium%22:%22organic%22%2C%22utm_campaign%22:%22(not%20set)%22%2C%22utm_content%22:%22(not%20set)%22%2C%22utm_term%22:%22(not%20provided)%22%2C%22beginning_at%22:1685257062}%2C%22campaignTime%22:1685257062%2C%22utmDataFirst%22:{%22utm_source%22:%22google%22%2C%22utm_medium%22:%22organic%22%2C%22utm_campaign%22:%22(not%20set)%22%2C%22utm_content%22:%22(not%20set)%22%2C%22utm_term%22:%22(not%20provided)%22%2C%22beginning_at%22:1685257062}%2C%22geoipData%22:{%22country%22:%22Ukraine%22%2C%22region%22:%22Zaporizhzhya%20Oblast%22%2C%22city%22:%22Zaporizhzhia%22%2C%22org%22:%22%22}}; bingc-activity-data={%22numberOfImpressions%22:0%2C%22activeFormSinceLastDisplayed%22:0%2C%22pageviews%22:3%2C%22callWasMade%22:0%2C%22updatedAt%22:1686472765}'
        },
        withCredentials: true
    });
    const html = response.data;

    // const response = await fetch(`${url}`, {
    //     cache: 'no-cache',
    //     headers: {
    //         'Content-Type': "text/html",
    //         'Cache-Control': 'no-cache',
    //         'Pragma': 'no-cache',
    //         'Cookie': 'currency=UAH; sc=D80AFC0B-6285-4664-7244-DC91A3D22691; _gcl_au=1.1.784045452.1685257063; _ms=954ebda9-c107-4e9d-b0bd-3053a907a8d1; _hjSessionUser_2828866=eyJpZCI6ImFlMjg3ZDY0LWI1ZDItNTExYS1hNzdhLTJlMzYxY2YwYTdjYSIsImNyZWF0ZWQiOjE2ODUyNTcwNjMzMjYsImV4aXN0aW5nIjp0cnVlfQ==; rcusi=1; user_store_id=8; store_id=8; PHPSESSID=2ncg5v9dpn7fb88lf9uhj5mpv3; _gid=GA1.2.636623163.1686400205; ln_or=eyIzNTMwMzQwIjoiZCJ9; language=rus; _hjSession_2828866=eyJpZCI6Ijg3NDU0ZTM4LWFjOWMtNDA5OS04M2I1LWVkOWFmMTQ4MTc0NyIsImNyZWF0ZWQiOjE2ODY0NzA4MjQ3OTcsImluU2FtcGxlIjpmYWxzZX0=; _hjAbsoluteSessionInProgress=0; _ga_6XL3GWYTYK=GS1.1.1686470824.28.1.1686471633.0.0.0; _ga=GA1.2.1180345601.1685257063; biatv-cookie={%22firstVisitAt%22:1685257062%2C%22visitsCount%22:9%2C%22campaignCount%22:1%2C%22currentVisitStartedAt%22:1686470830%2C%22currentVisitLandingPage%22:%22https://jabko.ua/zaporizhzhia/rus/iphone/%22%2C%22currentVisitOpenPages%22:8%2C%22location%22:%22https://jabko.ua/rus/iphone/apple-iphone-13/apple-iphone-13-128gb-midnight%22%2C%22locationTitle%22:%22%D0%9A%D1%83%D0%BF%D0%B8%D1%82%D1%8C%20Apple%20iPhone%2013%20128GB%20(Midnight)%20%E2%80%94%20%D1%86%D0%B5%D0%BD%D1%8B%20%E2%9A%A1%2C%20%D0%BE%D1%82%D0%B7%D1%8B%D0%B2%D1%8B%20%E2%9A%A1%2C%20%D1%85%D0%B0%D1%80%D0%B0%D0%BA%D1%82%D0%B5%D1%80%D0%B8%D1%81%D1%82%D0%B8%D0%BA%D0%B8%20%E2%80%94%20%D0%AF%D0%91%D0%9A%D0%9E%22%2C%22userAgent%22:%22Mozilla/5.0%20(Windows%20NT%2010.0%3B%20Win64%3B%20x64)%20AppleWebKit/537.36%20(KHTML%2C%20like%20Gecko)%20Chrome/114.0.0.0%20Safari/537.36%22%2C%22language%22:%22ru%22%2C%22encoding%22:%22utf-8%22%2C%22screenResolution%22:%222195x1235%22%2C%22currentVisitUpdatedAt%22:1686471640%2C%22utmDataCurrent%22:{%22utm_source%22:%22google%22%2C%22utm_medium%22:%22organic%22%2C%22utm_campaign%22:%22(not%20set)%22%2C%22utm_content%22:%22(not%20set)%22%2C%22utm_term%22:%22(not%20provided)%22%2C%22beginning_at%22:1685257062}%2C%22campaignTime%22:1685257062%2C%22utmDataFirst%22:{%22utm_source%22:%22google%22%2C%22utm_medium%22:%22organic%22%2C%22utm_campaign%22:%22(not%20set)%22%2C%22utm_content%22:%22(not%20set)%22%2C%22utm_term%22:%22(not%20provided)%22%2C%22beginning_at%22:1685257062}%2C%22geoipData%22:{%22country%22:%22Ukraine%22%2C%22region%22:%22Zaporizhzhya%20Oblast%22%2C%22city%22:%22Zaporizhzhia%22%2C%22org%22:%22%22}}; bingc-activity-data={%22numberOfImpressions%22:0%2C%22activeFormSinceLastDisplayed%22:0%2C%22pageviews%22:3%2C%22callWasMade%22:0%2C%22updatedAt%22:1686472765}'
    //
    //         // 'Content-Type': 'application/x-www-form-urlencoded',
    //     },
    //     credentials: "include"
    // })
    // const html = await response.text();

    if(isSave)
        saveHtmlDoc(html);

    return new JSDOM(`${html}`, { resources: 'usable'});
}


const checkNewGoods = async (queryText, dbUser) => {
    const search_query_part = `d/list/q-${queryText}/`;
    const searchOrderByNewest = '?search%5Border%5D=created_at:desc';
    const url = `${baseTargetUrl}/${search_query_part}${searchOrderByNewest}`;

    console.log(url);

    let window = (await getJsDomByUrl(url, false)).window;
    let document = window.document;


    const pageList = document.querySelectorAll('.pagination-list > li');
    const totalPageCount = parseInt(pageList[pageList.length - 1].querySelector('a').textContent);
    let currentPage = 1;

    console.log(totalPageCount);

    let addedCount = 0;
    const newGoods = [];

    while (currentPage <= totalPageCount) {

        if(currentPage > 1) {
            const currentUrl = `${url}&page=${currentPage}`;
            window = (await getJsDomByUrl(currentUrl, false)).window;
            document = window.document;
        }

        const items = document.querySelectorAll(".css-1sw7q4x");

        console.log(items.length);

        const allGoodIds = [];

        for(let item of items) allGoodIds.push(item.getAttribute('id'));

        const finded = await Good.findAll({
            where: { id: allGoodIds}
        });

        console.log(`all goods = ${allGoodIds.length} | finded = ${finded.length}`);

        if(allGoodIds.length === 0) { console.log("no goods"); break; }

        if(finded.length === allGoodIds.length) {
            // all is up to date
            console.log("all is up to date")
            break;
        }

        // get only new goods

        console.log("changes is exist");

        for(let item of items) {

            const id = item.getAttribute('id');

            if(finded.find(f => f.id == id)) continue;

            //todo: fix
            const name = item.querySelector('.css-16v5mdi.er34gjf0') ?
                item.querySelector('.css-16v5mdi.er34gjf0').textContent : null;

            if(name === null) continue;

            console.log(name);

            const url = item.querySelector('.css-rc5s2u') ?
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

            const newGood = await Good.create({
                id,
                name,
                url,
                img_url,
                price_uah,
                state,
                fixed,
                location,
                post_created_at
            });

            newGoods.push(newGood);
            addedCount++;
        }

        if(finded.length === 0) currentPage++; else break;
    }

    const [scan, created] = await Scan.findOrCreate({
        where: { query_text: queryText },
        defaults: {
            query_text: queryText,
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

    // console.log(`=========================== count ${allGoodIds.length} ===========================`)
    console.log(`=========================== added ${addedCount} ===========================`)

    return {newGoods};
}

module.exports = {
    getJsDomByUrl,
    saveHtmlDoc,
    checkNewGoods
}
