var socket = io();
var colors = ["white", "violet", "indigo", "blue", "green", "yellow", "orange", "red", "black"];
var sizes = [1, 5, 10, 20, 30, 40];

var mouse = {
    click: false,
    move: false,
    size: 10,
    color: "black",
    pos: { x: 0, y: 0 },
    pos_prev: false
};

var canvas = document.getElementById('drawing');
var canvas2 = document.getElementById('circle');
var context = canvas.getContext('2d');
var context2 = canvas2.getContext('2d');
var width = window.innerWidth;
var height = window.innerHeight;

canvas.width = width;
canvas.height = height;

context.beginPath()
context.rect(0, 0, width, height);
context.fillStyle = "white";
context.fill();

context2.beginPath();
context2.arc(22.5, 22.5, mouse.size / 2, 0, 2 * Math.PI);
context2.fillStyle = mouse.color;
context2.fill();
context2.stroke();

$("body").keydown(function(e) {
    if (e.keyCode == 83) {
        var link = document.getElementById('save');
        link.setAttribute('download', 'drawing.png');
        link.setAttribute('href', canvas.toDataURL("image/png").replace("image/png", "image/octet-stream"));
        link.click();
    }
    if ((e.keyCode == 13) && (e.shiftKey)) {
        socket.emit("clear");
        context.clearRect(0, 0, canvas.width, canvas.height);
    }
    if (e.keyCode == 13) {
        colors.unshift(mouse.color);
        colors.pop();
        mouse.color = colors[colors.length - 1];
        context2.beginPath();
        context2.clearRect(0, 0, canvas.width, canvas.height);
        context2.arc(22.5, 22.5, mouse.size / 2, 0, 2 * Math.PI);
        context2.fillStyle = mouse.color;
        context2.fill();
        context2.stroke();
    }
    if (e.keyCode == 32) {
        mouse.size = sizes[sizes.length - 1];
        sizes.unshift(mouse.size);
        sizes.pop();
        context2.beginPath();
        context2.clearRect(0, 0, canvas.width, canvas.height);
        context2.arc(22.5, 22.5, mouse.size / 2, 0, 2 * Math.PI);
        context2.fillStyle = mouse.color;
        context2.fill();
        context2.stroke();
    }
});

canvas.onmousedown = function(e) { mouse.click = true; };
canvas.onmouseup = function(e) { mouse.click = false; };

canvas.onmousemove = function(e) {
    mouse.pos.x = e.clientX / width;
    mouse.pos.y = e.clientY / height;
    mouse.move = true;
};

socket.on('draw_line', function(data) {
    var line = data.line;
    context.beginPath();
    context.lineWidth = line[3];
    context.strokeStyle = line[2];
    context.moveTo(line[0].x * width, line[0].y * height);
    context.lineTo(line[1].x * width, line[1].y * height);
    context.stroke();
});

socket.on('clear', function() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.beginPath();
    context.rect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "white";
    context.fill();
});

socket.on('update users', function(count) {
    $("#users").text(count);
});

function mainLoop() {
    if (mouse.click && mouse.move && mouse.pos_prev) {
        socket.emit('draw_line', { line: [mouse.pos, mouse.pos_prev, mouse.color, mouse.size] });
        mouse.move = false;
    }
    mouse.pos_prev = { x: mouse.pos.x, y: mouse.pos.y };
    setTimeout(mainLoop, 25);
}
mainLoop();
