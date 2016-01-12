
var loadDir = "/Loader/";
var pmpBackend = "./backend.js";
var backend = require(pmpBackend);
var testFunctionParam1 = 14;
var playlists;
var trackAddress;
var basedir = __dirname;
var http = require('http');
var fs = require('fs');
var url = require('url');
var path = require('path');
var serveStatic = require('serve-static');
var finalhandler = require('finalhandler');
var serve = serveStatic(__dirname,{'index': ['index.html', 'index.html']})

var server = http.createServer(function(req, res){
  if(req.url != '/favicon.ico'){
	  var done = finalhandler(req, res);
	  var playlistUrl = 0; //no longer an appropriate var name
	  var queryString = '';
	  playlistUrl = req.url.toString().substring(req.url.toString().lastIndexOf('/')+1);
	  queryString = playlistUrl.indexOf('?') > -1 ? playlistUrl.substring(playlistUrl.indexOf('?'),playlistUrl.length) : queryString;
	  playlistUrl = playlistUrl.indexOf('?') > -1 ? playlistUrl.substring(0,playlistUrl.indexOf('?')) : playlistUrl;
    //queryString = queryString.split('%2f').join('/');
	  //console.log("playlist Data:"+playlistUrl.indexOf('?') > -1 +"\nplaylistUrl: "+playlistUrl,queryString);
    //console.log('Q:',playlistUrl,queryString);
	  switch(req.url){
		case "/playlists/":
		  var c;
		  //console.log(req.method);
		  res.writeHead(200, {"Content-Type": "application/json"});
		  backend.getPlaylists(c, function(result){
			c = result;
			res.write(JSON.stringify(c,null,3));
			res.end();
		  });
		  break;
		case "/playlists/"+playlistUrl+queryString:
		  if(req.method == 'GET'){
        //console.log('playlist url',playlistUrl,queryString)
  			res.writeHead(200, {"Content-Type": "application/json"});
  			backend.getPlaylistAJAX(playlistUrl,queryString == '' ? null : queryString,function(result){
  			  res.write(JSON.stringify(result[0],null,3));
  			  res.end();
  			});
		  }
		  if(req.method == 'DELETE'){
  			backend.removePlaylist(playlistUrl);
  			//console.log('playlist id ' +playlistUrl+ ' removed.');
  			res.end();
		  }
      if(req.method == 'PUT'){
        if(queryString.startsWith('?tracks')){
          queryString = queryString.substring(8);
        }
        res.writeHead(200, {"Content-Type": "application/json"});
        backend.editPlaylist(playlistUrl > 0 ? playlistUrl : -1 ,queryString.length > 0 ? queryString : null,function(result){
          //res.write(JSON.stringify(result,null,3));
          res.end();
        });
      }
		  break;

		case "/playlist/new":
		  var playlistName = '';
		  if(req.method == 'POST'){
  			req.on('data', function(data){
  			  playlistName += data;
  			});
  			req.on('end',function(){
  			  backend.addNewPlaylist(playlistName);
  			});
  			res.writeHead(200,{'Content-Type': 'text/html'});
  			res.end();
		  }
		  break;
    case "/playlist/temp"+queryString:
      //build a query string through search by artist/album
      //console.log('cat url',queryString);
      if(req.method == 'GET'){
  			res.writeHead(200, {"Content-Type": "application/json"});
  			backend.buildCatPlaylist(queryString,function(result){
  			  res.write(JSON.stringify(result[0],null,3));
  			  res.end();
  			});
		  }
      break;
		case "/category/"+playlistUrl+queryString:
		  if(req.method == 'GET'){
        if(queryString.charAt(0) == '?'){
          queryString = queryString.substring(1);
        }
  			res.writeHead(200, {"Content-Type": "application/json"});
  			backend.getByUnique(playlistUrl,queryString.length > 0 ? queryString :null,function(result){
  			  res.write(JSON.stringify(result,null,3));
  			  res.end();
  			});
		  }
		  break;


		default:
		  serve(req, res, done);
		  }
	  }

  });

server.listen(8080);

//bringing these backend functions to the frontend via Eureca/sockets. Using
//functions like adding music etc. For managing data on the frontend, switching to
//AJAX
var Eureca = require('eureca.io');
var eurecaServer = new Eureca.Server({allow:['clientEcho','toggleLoadingScreen','showKeyboard','toggleDoneMessage']});
eurecaServer.attach(server);

eurecaServer.exports.addITunesPlaylist = function(playlist){
  var context = this;
  context.async = true;
  var client = this.clientProxy;
  client.toggleLoadingScreen();
  backend = require(pmpBackend,playlist);
  backend.addITunesPlaylist(playlist, function () { client.toggleLoadingScreen();});
}
eurecaServer.exports.addTrackToPlaylist = function(){
  backend = require(pmpBackend);
  backend.addTrackToPlaylist();
}
eurecaServer.exports.attemptMatch = function(file){
  backend = require(pmpBackend,file);
  backend.attemptMatch(file);
}
eurecaServer.exports.browseListFiles = function(dir,callback){
  dir = typeof dir !== "undefined" ? dir : __dirname;
  var context = this;
  context.async = true;
  backend = require(pmpBackend,dir,callback);
  backend.browseListFiles(dir,function(result){
    context.return(result);
  });
}
eurecaServer.exports.createDBs = function(){
  backend = require(pmpBackend);
  backend.createDBs();
}
eurecaServer.exports.deleteTableFromDb = function(db){
  backend = require(pmpBackend,db);
  backend.deleteTableFromDb(db);
}
eurecaServer.exports.getPlaylists = function(playlistsContainer,callback){
  var context = this;
  context.async = true;
  callback = typeof callback !== "undefined" ? callback : function(result){
    playlists = result;
  }
  backend = require(pmpBackend);
  backend.getPlaylists(playlistsContainer,function(result){
    playlistsContainer = result;
    context.return(playlistsContainer);
  });
}

eurecaServer.exports.checkRegisteredPlaylists = function(xmlPlaylistsInFolder,callback){
  var context = this;
  context.async = true;
  backend = require(pmpBackend);
  backend.checkRegisteredPlaylists(xmlPlaylistsInFolder,function(result){
    context.return(result);
  });
}

eurecaServer.exports.getTrackAddress = function(trackIndex,callback){ //NOT YET WORKING
  var context = this;
  context.async = true;
  callback = typeof callback !== "undefined" ? callback : function(result){
    trackAddress = result;
  }
  backend = require(pmpBackend);
  backend.getTrackAddress(trackIndex, function(result){
    trackIndex = result;
    context.return(trackIndex);
  });
}
eurecaServer.exports.importITunesMusic = function (playlist){
  var context = this;
  context.async = true;
  var client = this.clientProxy;
  client.toggleLoadingScreen();
  backend = require(pmpBackend,playlist,true);
  backend.importITunesMusic(playlist,true, function () { client.toggleLoadingScreen(); });
}
eurecaServer.exports.loadMusic = function(replace){
  replace = typeof replace !== "undefined" ? replace : false;
  backend = require(pmpBackend,replace);
  backend.loadMusic(replace);
}
eurecaServer.exports.sendDir = function(){
  return basedir;
}

eurecaServer.exports.syncMusic = function(loadMusicAfter){
  var context = this;
  context.async = true;
  var client = this.clientProxy;
  client.toggleLoadingScreen();
  backend = require(pmpBackend,loadMusicAfter);
  backend.syncMusic(loadMusicAfter, function () { client.toggleLoadingScreen(); });
}

eurecaServer.exports.setConfigValues = function(column,value,callback){
  var context = this;
  context.async = true;
  var client = this.clientProxy;
  backend = require(pmpBackend,column,value);
  backend.setConfigValues(column,value,function(){ client.toggleDoneMessage(); });
}

eurecaServer.exports.editPlaylist = function(id,queryString,callback){
  backend = require(pmpBackend,id,queryString);
  backend.editPlaylist(id,queryString,callback);
}
eurecaServer.onConnect(function(socket){
    var client = socket.clientProxy;
});

if (!String.prototype.startsWith) {
  String.prototype.startsWith = function(searchString, position) {
    position = position || 0;
    return this.indexOf(searchString, position) === position;
  };
}
