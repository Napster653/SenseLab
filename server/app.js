const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const mysql = require('mysql');
const Bean = require('ble-bean');
const port = 8080;

var db_config = {
	host: 'ni2141493-2.web13.nitrado.hosting',
	port: 3306,
	user: 'ni2141493_2sql1',
	password: 'ubicua123',
	database: 'ni2141493_2sql1'
};
var connection;

var sqlInsertRule = 'INSERT INTO rule SET ?';
var sqlRemoveRule = 'DELETE FROM rule WHERE rule_id = ?';
var sqlSelectRule = 'SELECT * FROM rule INNER JOIN trigger_type ON rule.trigger_type_id = trigger_type.trigger_type_id INNER JOIN action_type ON rule.action_type_id = action_type.action_type_id';
var sqlTurnOffRule = 'UPDATE rule SET active = 0 WHERE rule_id = ?';
var sqlTurnOnRule = 'UPDATE rule SET active = 1 WHERE rule_id = ?';

bean = null;

device = {
	'hasBeenSwiped': false,
	'hasBeenSwipedCycle': false,
	'hasBeenShaken': false,
	'hasBeenShakenCycle': false,
	'temperature': 0,
	'buttonHasBeenPressed': false,
	'buttonHasBeenPressedCycle': false,
	'buttonHasBeenHeld': false,
	'buttonHasBeenHeldCycle': false,

	'light': 10
}

function handleDisconnect ()
{
	connection = mysql.createConnection(db_config);
	connection.connect(function (err)
	{
		if (err)
		{
			console.error('Error when connecting to database: ', err);
			console.error('Attempting to reconnect...');
			setTimeout(handleDisconnect, 2000);
		}
		console.log('Connected to database with thread id: ' + connection.threadId)
	});
	connection.on('error', function (err)
	{
		console.error('Database error: ', err);
		console.error('Attempting to reconnect...');
		if (err.code === 'PROTOCOL_CONNECTION_LOST')
		{
			handleDisconnect();
		} else
		{
			throw err;
		}
	});
}

function removeRule (rule_id)
{
	var query = connection.query(sqlRemoveRule, rule_id, function (err, result)
	{
		if (err)
		{
			console.log(query.sql);
			throw err;
		}
		console.log('Number of records deleted: ' + result.affectedRows);
	});
}

function checkAllRules ()
{
	if (bean != null)
	{
		var query = connection.query(sqlSelectRule, function (err, result)
		{
			if (err) throw err;
			result.forEach(checkTrigger);
			resetDeviceTwin();
		});
	}
}

function resetDeviceTwin ()
{
	if (device.buttonHasBeenHeldCycle)
	{
		device.buttonHasBeenHeldCycle = false;
		device.buttonHasBeenHeld = false;
	}
	if (device.buttonHasBeenPressedCycle)
	{
		device.buttonHasBeenPressedCycle = false;
		device.buttonHasBeenPressed = false;
	}
	if (device.hasBeenShakenCycle)
	{
		device.hasBeenShakenCycle = false;
		device.hasBeenShaken = false;
	}
	if (device.hasBeenSwipedCycle)
	{
		device.hasBeenSwipedCycle = false;
		device.hasBeenSwiped = false;
	}
}

function checkSwipe ()
{
	return device.hasBeenSwiped;
}

function checkShake ()
{
	return device.hasBeenShaken;
}

function checkTemp (aboveOrBelow, temperature)
{
	if (aboveOrBelow == 'above')
		return device.temperature > temperature;
	else
		return device.temperature < temperature;
}

function checkButton (pressOrHold)
{
	if (pressOrHold == 'press')
		return device.buttonHasBeenPressed;
	else
		return device.buttonHasBeenHeld;
}

function checkLight (aboveOrBelow, light)
{
	if (aboveOrBelow == 'above')
		return device.light > light;
	else
		return device.light < light;
}

function checkTime (time)
{
	// console.log(time);
	// console.log(typeof (time)); //string
	return true;
}

function actionGmail (address)
{
	// Seng Gmail
}

function actionLED (mode, color)
{
	color = color || '#FFFFFF';
	switch (mode)
	{
		case 'on':
			bean.setColor(new Buffer([0xFF, 0xFF, 0xFF]), function () { });
			break;
		case 'off':
			bean.setColor(new Buffer([0x00, 0x00, 0x00]), function () { });
			break;
		case 'color':
			// Set LED color
			break;
		default:
			console.error('ERROR: Unknown mode parameter for actionLED (mode, color)');
			break;
	}
}

function actionBuzzer ()
{
	bean.write(Buffer.from('5\n', 'utf8'), function (params)
	{

	});
}

function runAction (rule)
{
	switch (rule.action_type_id)
	{
		case 1:
			actionGmail(rule.action_data_text);
			break;
		case 2:
			actionLED('on');
			break;
		case 3:
			actionLED('off');
			break;
		case 4:
			actionLED('color', rule.action_data_text);
			break;
		case 5:
			actionBuzzer();
			break;
		case 6:
			// WIP
			break;
		case 7:
			// WIP
			break;
		case 8:
			// WIP
			break;
		default:
			console.error('ERROR: Unrecognized action type');
			break;
	}
	return;
}

function checkTrigger (rule)
{
	if (!rule.active)
	{
		return;
	}
	switch (rule.trigger_type_id)
	{
		case 1:
			if (checkSwipe())
			{
				console.log('\n=== Trigger activated: swipe');
				console.log('=== Running action for rule ' + rule.rule_id);
				device.hasBeenSwipedCycle = true;
				runAction(rule);
			}
			break;
		case 2:
			if (checkShake())
			{
				console.log('\n=== Trigger activated: shake');
				console.log('=== Running action for rule ' + rule.rule_id);
				device.hasBeenShakenCycle = true;
				runAction(rule);
			}
			break;
		case 3:
			if (checkTemp('above', rule.trigger_data_int))
			{
				console.log('\n=== Trigger activated: temperature above');
				console.log('=== Running action for rule ' + rule.rule_id);
				runAction(rule);
			}
			break;
		case 4:
			if (checkTemp('below', rule.trigger_data_int))
			{
				console.log('\n=== Trigger activated: temperature below');
				console.log('=== Running action for rule ' + rule.rule_id);
				runAction(rule);
			}
			break;
		case 5:
			if (checkButton('press'))
			{
				console.log('\n=== Trigger activated: button pressed');
				console.log('=== Running action for rule ' + rule.rule_id);
				device.buttonHasBeenPressedCycle = true;
				runAction(rule);
			}
			break;
		case 6:
			if (checkButton('hold'))
			{
				console.log('\n=== Trigger activated: button held');
				console.log('=== Running action for rule ' + rule.rule_id);
				device.buttonHasBeenHeldCycle = true;
				runAction(rule);
			}
			break;
		case 7:
			if (checkLight('above', rule.trigger_data_int))
			{
				console.log('\n=== Trigger activated: light above');
				console.log('=== Running action for rule ' + rule.rule_id);
				runAction(rule);
			}
			break;
		case 8:
			if (checkLight('below', rule.trigger_data_int))
			{
				console.log('\n=== Trigger activated: light below');
				console.log('=== Running action for rule ' + rule.rule_id);
				runAction(rule);
			}
			break;
		case 9:
			if (checkTime(rule.trigger_data_time))
			{
				console.log('\n=== Trigger activated: time once');
				console.log('=== Running action for rule ' + rule.rule_id);
				runAction(rule);
				removeRule(rule.rule_id);
			}
			break;
		case 10:
			if (checkTime(rule.trigger_data_time))
			{
				console.log('\n=== Trigger activated: time repeat');
				console.log('=== Running action for rule ' + rule.rule_id);
				// addOneDayToTimeTrigger(rule);
				runAction(rule);
			}
			break;
		case 11:
			// WIP
			break;
		case 12:
			// WIP
			break;
		case 13:
			// WIP
			break;
		case 14:
			// WIP
			break;
		default:
			console.error('ERROR: Unrecognized trigger type');
			break;
	}
}

function interpretMessage (data)
{
	if (data.hasOwnProperty('button'))
	{
		if (data.button == 'pressed')
		{
			device.buttonHasBeenPressed = true;
		}
		else if (data.button == 'held')
		{
			device.buttonHasBeenHeld = true;
		}
	}
	else if (data.hasOwnProperty('temperature'))
	{
		device.temperature = data.temperature;
	}
	else if (data.hasOwnProperty('light'))
	{
		device.light = data.light;
	}
	else if (data.hasOwnProperty('accelerometer'))
	{
		if (data.accelerometer == 'swiped')
		{
			device.hasBeenSwiped = true;
		}
		else if (data.accelerometer == 'shaken')
		{
			device.hasBeenShaken = true;
		}
	}
	else
	{
		console.error('ERROR: Unrecognised data: ' + data);
	}
}

handleDisconnect();

server.listen(port, function (err)
{
	if (err) throw err;
	setInterval(checkAllRules, 5000);
});
console.log('Listening on port ' + port);

Bean.discover(function (thisBean)
{
	bean = thisBean;
	bean.on("serial", function (data, valid)
	{
		try
		{
			parsedData = JSON.parse(data.toString());
			interpretMessage(parsedData);
			console.log(parsedData);
		} catch (error)
		{
			console.error('ERROR: Unrecognised message: ' + data.toString());
		}
	});

	bean.on('disconnect', function ()
	{
		console.log('Bean disconnected');
	});

	bean.connectAndSetup(function ()
	{
		console.log('Bean connected');
	});
});

io.on('connection', function (socket)
{
	socket.on('new_rule', function (data)
	{
		console.log('\n\nMessage received: new_rule');
		var new_rule_parsed = JSON.parse(data);

		console.log(new_rule_parsed);
		var checksOut = 1;
		if (new_rule_parsed.rule_name == undefined)
		{
			console.log('Can\'t create new rule: No name');
			checksOut = 0;
		}
		if (new_rule_parsed.trigger_type_id == undefined)
		{
			console.log('Can\'t create new rule: No trigger type id');
			checksOut = 0;
		}
		if (new_rule_parsed.action_type_id == undefined)
		{
			console.log('Can\'t create new rule: No action type id');
			checksOut = 0;
		}
		if (checksOut)
		{
			var query = connection.query(sqlInsertRule, new_rule_parsed, function (err, result)
			{
				if (err)
				{
					console.log(query.sql);
					throw err;
				}
				console.log('Number of records inserted: ' + result.affectedRows);
			});
		}
	});

	socket.on('get_rule_list', function ()
	{
		console.log('\nMessage received: get_rule_list');
		var query = connection.query(sqlSelectRule, function (err, result)
		{
			if (err) throw err;
			// console.log(result);
			socket.emit('rule_list', JSON.stringify(result));
		});
	});

	socket.on('rule_turn_off', function (data)
	{
		console.log('\nMessage received: rule_turn_off');
		var query = connection.query(sqlTurnOffRule, data, function (err, result)
		{
			if (err)
			{
				console.log(query.sql);
				throw err;
			}
			console.log('Number of records updated: ' + result.affectedRows);
		});
	});

	socket.on('rule_turn_on', function (data)
	{
		console.log('\nMessage received: rule_turn_on');
		var query = connection.query(sqlTurnOnRule, data, function (err, result)
		{
			if (err)
			{
				console.log(query.sql);
				throw err;
			}
			console.log('Number of records updated: ' + result.affectedRows);
		});
	});
});