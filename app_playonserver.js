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
// console.log(vlc, 'inital')
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

// console.log(vlc);
 // let vlcs;
async function play(vlc, link_audio, vlcs = null){
  if(vlcs == null){
    vlcs = await vlc();
    try{
      await vlcs.command("in_play", {
        input: link_audio
      })
    return vlcs;
    }catch(err){
      console.log(err);
    }
  }else{
    vlcs.then(async play => {
      await play.command("in_play", {
          input: link_audio
        })
    })
  }
}
// play(vlc);
async function pause(vlcs){
   try{
      if(vlcs != null){
        vlcs.then(async pause => {
             await pause.command("pl_pause");
        })
      }
    }catch(err){
       console.log(err);
    }
  
}

async function stop(vlcs){
  try{
    if(vlcs != null){
      vlcs.then(async stop => {
        await stop.command("pl_stop");
      })
    }
  }catch(err){
    console.log(err);
  } 
}

// async function repeat(vlcs){
//   // vlcs = await vlc();
//   console.log("repeat");
//   try{
//    await vlcs.command("pl_repeat");
//  }catch(err){
//    console.log(err);
//  }
// }

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
  addToQueue(arr_socket, socket.id, status, null);
  console.log(arr_socket);

    socket.on('play', (link_audio) => {
        let checkStatus = checkStatusSocket(arr_socket, socket.id);
        if(checkStatus ){
          let vlcss =  play(vlc, link_audio, null);
          setVlc(arr_socket, socket.id, vlcss);
          setStatus(arr_socket, socket.id, true);
          console.log('first');
        }else{
         console.log('seconde');
          for(let i = 0; i < arr_socket.length; i++){
            if(arr_socket[i].socket_id == socket.id){
              console.log(arr_socket[i].vlc, 'stop before play');
              stop(arr_socket[i].vlc);
              let vlcss =  play(vlc, link_audio, arr_socket[i].vlc);
            } 
          }
          console.log('stop and play again');
       }
      console.log(arr_socket, 'after play');
    })
 

    socket.on('pause', (msg) => {
      for(let i = 0; i < arr_socket.length; i++){
          if(arr_socket[i].socket_id == socket.id){
            console.log(arr_socket[i].vlc, 'vlc');
            pause(arr_socket[i].vlc);
          }
          
        }
         console.log(arr_socket, 'after pause');
      })
     socket.on('stop', (msg) => {
         for(let i = 0; i < arr_socket.length; i++){
          if(arr_socket[i].socket_id == socket.id){
            console.log(arr_socket[i].vlc, 'vlc');
            stop(arr_socket[i].vlc);
          }
          
        }
        setStatus(arr_socket, socket.id, false);
         setVlc(arr_socket, socket.id, null);
          console.log(arr_socket, 'after stop');
      })
});
function addToQueue(arr, socket, status, vlc){
  if(arr.length > 0){
    let temp = arr.map((value, index) => value.socket_id);
    if(!temp.includes(socket)){
      arr.push({'socket_id':socket, 'status': status, 'vlc': vlc})
    } 
  }else{
     arr.push({'socket_id':socket, 'status': status, 'vlc': vlc})
  } 
}

function checkStatusSocket(arr, socket_id){
   let temp = arr.map((value, index) => value.socket_id);
  if(!temp.includes(socket_id)){
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
function setVlc(arr, socket_id, vlc){
   arr.forEach((element) => {
    if(element['socket_id'] == socket_id) element['vlc'] = vlc;
  })
}
// var server = app.listen( process.env.PORT || 3000, function(){
//   console.log('Listening on port ' + server.address().port);
// });
let port = 4000;
http.listen(port, () => {
  console.log(`listening on *:${port}`);
});