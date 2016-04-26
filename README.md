# burning-man-countdown-slackbot

To use this bot, first [create a bot] (https://my.slack.com/services/new/bot), and then:
    npm install botkit
    npm install dateformat
    cp burning-man-countdown-slackbot/simple_storage.js ~/node_modules/botkit/lib/storage/
    SLACKBOT_TOKEN='you should know this' node burning-man-countdown-slackbot/countdown_bot.js