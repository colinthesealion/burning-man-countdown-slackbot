var Botkit = require('botkit');
var DateFormat = require('dateformat');
var EndOfDays = 273860;

var controller = Botkit.slackbot({
	json_file_store: 'countdown_bot_store.js'
});
var bot = controller.spawn({
	token: process.env.SLACKBOT_TOKEN
});
bot.startRTM(function(err,bot,payload) {
  if (err) {
    throw new Error('Could not connect to Slack');
  }
});

controller.hears(['help'], 'direct_mention,direct_message,mention', function(bot, message) {
	bot.reply(message, ':burn: No. :burn:');
	setTimeout(function() {
		bot.reply(message, ':burn: Haha, just kidding. Try @countdown_bot: my first burn was 4_DIGIT_YEAR_OF_YOUR_FIRST_BURN. :burn:');
	}, 5000);
});

controller.hears(['my first burn was \(\\d+\)'], 'direct_mention,direct_message', function(bot, message) {
	controller.storage.users.save({ id: message.user, firstBurn: message.match[1] }, function(err) { if (err) { console.log('An error was encountered saving first burn year: ' + err); } });
	bot.reply(message, ':burn: Cool, I\'ll remember that. :burn:');
});

controller.hears(['final countdown', 'europe', EndOfDays.toString()], 'ambient,direct_mention,direct_message,mention', function(bot, message) {
	var finalBurnDay = getBurnDay(EndOfDays);
	bot.reply(message, ':burn: In the year ' + DateFormat(finalBurnDay, 'yyyy') + ', on ' + DateFormat(finalBurnDay, 'dddd, mmmm dS') + ' the final man is engulfed in flames as the sun itself immolates the entire surface of the planet Earth. Having lived their lives fully and with open hearts, the gathered burners move on to the next stage of consciousness, taking little more than their 10 principles and a sense of adventure. Burn, baby, burn. :burn:');
});

controller.hears(['countdown'], 'ambient,direct_mention,direct_message,mention', function(bot, message) {
	var daysTilBurn = daysBetween(getBurnDay(), new Date());
	if (daysTilBurn === 0) {
		bot.reply(message, ':burn: The man burns today! :burn:');
	}
	else if (daysTilBurn === 1) {
		bot.reply(message, ':burn: The man burns tomorrow! :burn:');
	}
	else {
		bot.reply(message, ':burn: The man burns in ' + daysTilBurn + ' days :burn:');
	}
});

controller.hears(['paul', 'addis', '2007'], 'ambient,direct_mention,direct_message,mention', function(bot, message) {
	var burnDays = [getBurnDay(2007)];
	burnDays.push(new Date(burnDays[0]));
	burnDays[0].setDate(burnDays[0].getDate() - 4);
	var virgins = getVirgins('2007');
	if (virgins.length) {
		myFirstBurn(bot, message, virgins, burnDays[0]);
	}
	bot.reply(message, ':burn: Did you know? In 2007 the man burned twice. At 3AM on ' + DateFormat(burnDays[0], 'dddd, mmmm dS') + ' Paul David Addis lit the man prematurely during a lunar eclipse. Paul did this in the name of preserving the ethos of Burning Man, which he perceived to be fading at that time. Doc, at his first burn, was doing shots off of a ski with Mojito Molly and James on the Esplanade while this scene unfolded behind them. The man was rebuilt and burned as planned on ' + DateFormat(burnDays[1], 'dddd, mmmm dS') + '. :burn:');
});

controller.hears(['\\b\(\\d\{4,\}\)\\b'], 'ambient,direct_mention,direct_message,mention', function(bot, message) {
	var year = parseInt(message.match[1]);
	if (year > EndOfDays) {
		bot.reply(message, ':burn: Did you know? Javascript doesn\'t support dates more than 8,640,000,000,000,000 milliseconds after January 1st, 1970 UTC. :burn:');
	}
	else if (year < 1986) {
		bot.reply(message, ':burn: Did you know? Burning Man was founded in 1986. :burn:');
	}
	else {
		var burnDay = getBurnDay(year);
		if (year === 1986) {
			bot.reply(message, ':burn: The very first man burned in 1986 on ' + DateFormat(burnDay, 'dddd, mmmm dS') + '. :burn:');
		}
		else {
			var future = burnDay > new Date();
			if (future) {
				bot.reply(message, ':burn: In ' + DateFormat(burnDay, 'yyyy') + ' the man will burn on ' + DateFormat(burnDay, 'dddd, mmmm dS') + '. :burn:');
			}
			else {
				var virgins = getVirgins(message.match[1]);
				if (virgins.length) {
					myFirstBurn(bot, message, virgins, burnDay);
				}
				else {
					bot.reply(message, ':burn: In ' + DateFormat(burnDay, 'yyyy') + ' the man burned on ' + DateFormat(burnDay, 'dddd, mmmm dS') + '. :burn:');
				}
			}
		}
	}
});

function getLaborDay(year) {
	// Assume labor day is today
	var laborDay = new Date();
	if (typeof year !== 'undefined') {
		laborDay.setYear(year);
	}

	// Well, we know it's in September
	laborDay.setMonth(8);

	// So search the month until we find a Monday
	for (var i = 1; i <= 7; i++) {
		laborDay.setDate(i);
		if (laborDay.getDay() == 1) {
			break;
		}
	}

	if (typeof year === 'undefined') {
		// We want the next labor day, so make sure that the current choice is
		// on or after today
		var today = new Date();
		if (today > laborDay) {
			return getLaborDay(today.getYear() + 1);
		}
	}

	return laborDay;
}

function getBurnDay(year) {
	var burnDay = getLaborDay(year);
	burnDay.setDate(burnDay.getDate() - 2);
	if (typeof year === 'undefined') {
		// We want the next burn day, so make sure that the current choice is
		// on or after today
		var today = new Date();
		if (today > burnDay) {
			return getBurnDay(today.getYear() + 1);
		}
	}
	return burnDay;
}

function daysBetween(date1, date2) {
	// The number of milliseconds in one day
	var ONE_DAY = 1000 * 60 * 60 * 24;

	// Convert both dates to milliseconds
	var date1_ms = date1.getTime();
	var date2_ms = date2.getTime();

	// Calculate the difference in milliseconds
	var difference_ms = date1_ms - date2_ms;

	// Convert back to days and return
	return Math.round(difference_ms/ONE_DAY);
}

function getVirgins(year) {
	var allUsers = controller.storage.users.allSync();
	var virgins = [];
	for (var userId in allUsers) {
		if (allUsers[userId].firstBurn === year) {
			virgins.push('<@' + userId + '>');
		}
	}
	return virgins;
}

function myFirstBurn(bot, message, virgins, burnDay) {
	if (virgins.length) {
		var burners = englishJoin(virgins);
		bot.reply(message, ':burn: In ' + DateFormat(burnDay, 'yyyy') + ' ' + burners + ' watched the man burn for the very first time on ' + DateFormat(burnDay, 'dddd, mmmm dS') + '. :burn:');
	}
	return;
}

function englishJoin(words) {
	if (words.length <= 1) {
		return words.toString();
	}
	else if (words.length === 2) {
		return words[0] + ' and ' + words[1];
	}
	else {
		var lastWord = words.pop();
		return englishJoin([words.join(', '), lastWord]);
	}
}
