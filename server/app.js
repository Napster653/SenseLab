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

function handleDisconnect ()
{
	connection = mysql.createConnection(db_config);
	console.log('Connected to database with thread id: ' + connection.threadId)
	connection.connect(function (err)
	{
		if (err)
		{
			console.error('Error when connecting to database: ', err);
			console.error('Attempting to reconnect...');
			setTimeout(handleDisconnect, 2000);
		}
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
		new_rule_parsed = JSON.parse(data);

		console.log(new_rule_parsed);

	});
});
