var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 80;
var line_history = [];
var users = 0;

io.on('connection', function(socket) {
    users++;
    socket.emit("update users", users);
    for (var i in line_history) {
        socket.emit('draw_line', { line: line_history[i] });
    }
    socket.on('draw_line', function(data) {
        line_history.push(data.line);
        io.emit('draw_line', { line: data.line });
    });
    socket.on('clear', function() {
        line_history = [];
        io.emit("clear");
    });
    socket.on('disconnect', function() {
        users--;
        io.emit("update users", users);
    });

});

server.listen(port, function() {
    console.log("Server listening at port " + port);
});

var dir = __dirname + '/public';
app.use(express.static(dir));
