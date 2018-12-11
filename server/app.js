const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const mysql = require('mysql');
const port = 8080;

var db_config = {
	host: 'ni2141493-2.web13.nitrado.hosting',
	port: 3306,
	user: 'ni2141493_2sql1',
	password: 'ubicua123',
	database: 'ni2141493_2sql1'
};
var connection;

var sqlInsertRule = 'INSERT INTO ni2141493_2sql1.rule SET ?';
var sqlSelectRule = 'SELECT * FROM rule INNER JOIN trigger_type ON rule.trigger_type_id = trigger_type.trigger_type_id INNER JOIN action_type ON rule.action_type_id = action_type.action_type_id';

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
			throw err; s
		}
	});
}
handleDisconnect();

server.listen(port);
console.log('Listening on port ' + port);

io.on('connection', function (socket)
{
	socket.on('new_rule', function (data)
	{
		console.log('\n\nMessage received: new_rule');
		var new_rule_parsed = JSON.parse(data);

		console.log(new_rule_parsed);
		var values = [
			// new_rule_parsed.rule_name,
			// new_rule_parsed.trigger_type_id,
			// new_rule_parsed.trigger_data_int,
			// new_rule_parsed.trigger_data_time,
			// new_rule_parsed.action_type_id,
			// new_rule_parsed.action_data_text
			'aaa', 1, null, null, 2, null
		]
		var query = connection.query(sqlInsertRule, new_rule_parsed, function (err, result)
		{
			if (err)
			{
				console.log(query.sql);
				throw err;
			}
			console.log('Number of records inserted: ' + result.affectedRows);
		});
	});

	socket.on('get_rule_list', function ()
	{
		var query = connection.query(sqlSelectRule, function (err, result)
		{
			if (err) throw err;
			console.log(result)
			socket.emit('rule_list', JSON.stringify(result));
		});
	});
});
