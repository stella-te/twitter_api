
const logger = require('./logger');
const Args = require('args')
const Kafka = require('./kafka');
const twitter_post = require('./twitter.js').postTwitter;
const twitter_post_calendar = require('./twitter.js').postTwitterCalendar;

const express = require('express');


Args
    .option('topic', 'Kafka Topics To Forward', ['calendar', 'stream', 'earnings'])
    .option('bot', 'Discord Bot Name', 'tradingeconomics')
    .option('offset', 'Kafka Topic Offset', 10000000000000000000)
    .option('production', 'is production or test', false)

const args = Args.parse(process.argv)
logger.info(JSON.stringify(args));

if (args.production) 
    logger.warn("Production version");
else 
    logger.warn("Test version");

function onMessage(msg) {
    try {
        if (!msg.topic) { return; }
        logger.info("[kafka] " + msg.value);
        switch (msg.topic) {
            case 'calendar':
                OnCalendar(JSON.parse(msg.value))
                break;
            case 'stream':
                OnStream(JSON.parse(msg.value))
                break;
            default:
                logger.info('[not handled] topic:' + msg.topic + ' msg:' + msg.value);
                break;
        }
    } catch (err) {
        logger.error('onMessage Error: ' + err);
    }
}

function OnCalendar(msg) {
    try {
        if (("country" in msg || "Country" in msg) && ("event" in msg || "Event" in msg)) {
            if ("country" in msg){
                msg.Country = msg.country
            }
            if ("Country" in msg){
                msg.Country = msg.Country.trim()
            }
            if ("event" in msg){
                msg.Event = msg.event.trim()
            }
            if ("Event" in msg){
                msg.Event = msg.Event.trim()
            }
            const title = msg.Country + " " + msg.Event;
            const url = "https://tradingeconomics.com" + msg.URL;
    
            twitter_post_calendar(msg)
    
        } else {
            logger.error("message is missing country key or event key")
        }

    } catch (err) {
        logger.error('OnTick Error: ' + err);
    }
};

function OnStream(msg) {
    try {
        const title = msg.title;
        const url = "https://cdn.tradingeconomics.com/charts/image.png?url=" + msg.url + "&title=false&lbl=0&fnt=10&ts=15"
        console.log(url, title)
        twitter_post(url, msg)
    } catch (err) {
        logger.error('OnTick Error: ' + err);
    }
};

async function Main() {
    try {

        let topics = [];
        args.topic.forEach(topic => {
            logger.warn("Subscring to " + topic)
            topics.push({ topic: topic, offset: args.offset })
        });

        let kafka = Kafka({
            onMessage: function (msg, originalMsg) {
                onMessage(msg);
            },
            topics: topics
        });
    } catch (ex) {
        logger.error('Main Exception');
        logger.error(ex);
        process.exit(1)
    }
}

const app = express()
const port = 3000

app.get('/status', (req, res) => {
  res.send(JSON.stringify({"status": 200, "message": "All is fine"}));
})
app.listen(port)

Main()