var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
const port = 3000;

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get('/client.js', (req, res) => {
    res.sendFile(__dirname + '/client.js');
});

var users = {};
io.on('connection', function(socket) {
    console.log("user connected");
    // if(users.length===0) {
    //     users["conn1"] = socket;
    // } else{
    //     users["conn2"] = socket;
    // }

    // socket.on('makeOffer', function(offer){
    //     console.log("offer conn1 -> conn2");
    //     users.conn2.emit('onOffer', offer);
    // });
    // socket.on('makeAnswer', function(answer){
    //     console.log("answer conn2 -> conn1");
    //     users.conn1.emit('onAnswer', answer);
    // });

    socket.on('message', function(data){
        console.log("data at server:");
        console.log(data);
        switch(data.type){
            case "setUser":
                var userName = data.fromUser;
                if(userName in users){
                    socket.emit('message', {"type": "error", "error": userName + " taken. choose a different one"});
                } else{
                    users[userName] = {"joinedRoom": false, "socket": socket};
                    socket.emit('message', {"type": "userSet", "message": userName + " is set as userId", "users": Object.keys(users)});
                }
                break;
            case "makeOffer":
                var toUser = data.toUser;
                if(users[toUser].joinedRoom){
                    socket.emit('message', {"type": "error", "error": toUser + " already in a room."});
                } else{
                    data.type = "onOffer";
                    users[toUser].socket.emit('message', data);
                }
                break;
            case "makeAnswer":
                var toUser = data.toUser;
                data.type = "onAnswer";
                users[toUser].socket.emit('message', data);
                break;
            case "iceCandidate":
                var toUser = data.toUser;
                data.type = "onIceCandidate";
                users[toUser].socket.emit('message', data);
                break;
        }
    });

    // socket.on('setUser', function(userName){
    // if(userName in users){
    //     socket.emit('userExists', userName);
    // } else {
    //     users[userName] = {"joinedRoom": false, "socket": socket};
    //     socket.emit('userSet', Object.keys(users));
    // }
    // });

    // socket.on('clear', function() {
    //     users = {};
    //     console.log("users cleared");
    // });

    // socket.on('makeOffer', function(data){
    //     var otherUser = data.toUser;
    //     if(users[otherUser].joinedRoom){
    //         socket.emit('failed', otherUser + "already in a room");
    //     } else{
    //         users[otherUser].socket.emit('onOffer', data);
    //     }
    // });

    // socket.on('makeAnswer', function(data){
    //     var toUser = data.toUser;
    //     users[toUser].socket.emit('onAnswer', data);
    // });

    socket.on('disconnect', function(){
        console.log("user disconnected");
    });
});
http.listen(port, () => console.log(`Example app listening at ${port}`));