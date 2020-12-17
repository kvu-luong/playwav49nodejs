// var http = require('http'),
//     path = require('path'),
//     methods = require('methods'),
//     
//     session = require('express-session'),

//     passport = require('passport'),
//     errorhandler = require('errorhandler'),
//     mongoose = require('mongoose');
let    express = require('express');
// let bodyParser = require('body-parser');
let    cors = require('cors');
var isProduction = process.env.NODE_ENV === 'production';

// Create global app object
var app = express();

app.use(cors());

// Normal express config defaults
// app.use(require('morgan')('dev'));
// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.json());

// app.use(require('method-override')());
app.use(express.static(__dirname + '/public'));

// app.use(session({ secret: 'conduit', cookie: { maxAge: 60000 }, resave: false, saveUninitialized: false  }));

// if (!isProduction) {
//   app.use(errorhandler());
// }

// if(isProduction){
//   mongoose.connect(process.env.MONGODB_URI);
// } else {
//   mongoose.connect('mongodb://localhost/conduit');
//   mongoose.set('debug', true);
// }

// require('./models/User');
// require('./models/Article');
// require('./models/Comment');
// require('./config/passport');

// app.use(require('./routes'));

// /// catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   var err = new Error('Not Found');
//   err.status = 404;
//   next(err);
// });

// /// error handlers

// // development error handler
// // will print stacktrace
// if (!isProduction) {
//   app.use(function(err, req, res, next) {
//     console.log(err.stack);

//     res.status(err.status || 500);

//     res.json({'errors': {
//       message: err.message,
//       error: err
//     }});
//   });
// }

// // production error handler
// // no stacktraces leaked to user
// app.use(function(err, req, res, next) {
//   res.status(err.status || 500);
//   res.json({'errors': {
//     message: err.message,
//     error: {}
//   }});
// });
process.setMaxListeners(0);
app.get('/', (req, res) => {;
  res.send(
      `<audio controls>
        <source src="/audio/test2.wav" type="audio/wav">
      Your browser does not support the audio element.
      </audio>`
    );
})

// const { VLC } = require('node-vlc-http');
// const vlc = new VLC(
//   'http://localhost',
//   '3000'
// );
// console.log(vlc);
// let uri = './public/audio/test2.wav';
// console.log(uri);
// // console.log(vlc, '1');
// async function test(uri){
//   
//     console.log('kkk');
//     let hello =  await vlc.addToQueue(uri);
//     // console.log(hello);
//     console.log(vlc);
//   }catch(err){
//     console.log(err);
//   }
// }
// test(uri);



const vlc = require("@richienb/vlc");
// console.log(vlc);
// (async (vlc) => {
//   // const vlcs = await vlc()
//     // Play audio
//     console.log('hahah');
//     console.log(vlcs);
//     await vlc.command("in_play", {
//       input: "/audio/test2.wav"
//     })

//     // Pause/resume audio
//     await vlcs.command("pl_pause")
// })()
let vlcs = null;
// console.log(vlc);
async function play(vlc, link_audio){
  vlcs = await vlc();
  console.log("play");
  try{
   await vlcs.command("in_play", {
      input: link_audio
    })
 }catch(err){
   console.log(err);
 }
}
// play(vlc);
async function pause(vlc){
  // vlcs = await vlc();
  console.log("pause");
  try{
   await vlcs.command("pl_pause");
 }catch(err){
   console.log(err);
 }
}

async function stop(vlc){
  // vlcs = await vlc();
  console.log("stop");
  try{
   await vlcs.command("pl_stop");
 }catch(err){
   console.log(err);
 }
}

async function repeat(vlc){
  // vlcs = await vlc();
  console.log("repeat");
  try{
   await vlcs.command("pl_repeat");
 }catch(err){
   console.log(err);
 }
}

// play(vlc);
app.use(cors());
var http = require('http').createServer(app);
var io = require('socket.io')(http, {
  cors: {
    origin: '*',
  }
});

let arr_socket = [];
let status = false;
io.on('connection', (socket) => {
  console.log('a user connected');
  // console.log(arr_socket);
  // socket.emit('vlc',vlc );
  // console.log(socket.id);
  addToQueue(arr_socket, socket.id, status);
  console.log(arr_socket);
 
  // console.log(arr_socket, 'before play', checkStatus);

    socket.on('play', (link_audio) => {
       let checkStatus = checkStatusSocket(arr_socket, socket.id);
        if(checkStatus){
          play(vlc, link_audio);
          setStatus(arr_socket, socket.id, true);
       }else{
         repeat(vlc);
       }
      console.log(arr_socket, 'after play');
    })
 

    socket.on('pause', (msg) => {
        pause(vlc);
      })
     socket.on('stop', (msg) => {
        stop(vlc);
        setStatus(arr_socket, socket.id, false);
      })
});
function addToQueue(arr, socket, status){
  if(arr.length > 0){
    let temp = arr.map((value, index) => value.socket_id);
    if(!temp.includes(socket)){
      arr.push({'socket_id':socket, 'status': status})
    } 
  }else{
     arr.push({'socket_id':socket, 'status': status})
  } 
}

// function checkExistSocketID(arr, socket_id){
//   let temp = arr.map((value, index) => value.socket_id);
//   if(!temp.includes(socket_id)){
//     return false;
//   } 
//   arr.forEach((element) => {
//     if(element['socket_id'] == socket_id) return true;
//   })
//   return false;
// }

function checkStatusSocket(arr, socket_id){
   let temp = arr.map((value, index) => value.socket_id);
  if(!temp.includes(socket_id)){
    // console.log('kkkk')
    return true;
  } 
  let check = false;
   arr.forEach((element) => {
     console.log(element['socket_id'], socket_id)
    if(element['socket_id'] == socket_id && element['status'] == false) check = true;
  })
  return check;
}
function setStatus(arr, socket_id, status){
   arr.forEach((element) => {
    if(element['socket_id'] == socket_id) element['status'] = status;
  })
}
// var server = app.listen( process.env.PORT || 3000, function(){
//   console.log('Listening on port ' + server.address().port);
// });
http.listen(5000, () => {
  console.log('listening on *:5000');
});