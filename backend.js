module.exports = { };
var http = require('http');
var sqlite3 = require('sqlite3').verbose();
var mm = require('musicmetadata');
var path = require('path');
var fs = require('fs');
var util = require('util');
var cpr = require('cpr');
var recursive = require('recursive-readdir');
var inspect = require('util').inspect;
var exec = require('child_process').exec;
var libxmljs = require('libxmljs');
var date = new Date();
var consoledebugmode = false;
var stmt,configstmt;
var basedir = __dirname;
config = "config.db";
music = "music.db";
var musicdb = new sqlite3.Database(music);
var configdb = new sqlite3.Database(config);
var loadDir = "";
var musDir = "";
var playlist = {name: null, list : []};//needs to be keypair. object with playlist name and array.
var async = require('async');
var necessaryColumns = "Id, Name, Title, AlbumArtist, TrackNumber, TrackNumberOf,Time, Artist, Album, genre, composer, producer, plays, DateAdded, Size, SampleRate, BitRate, Flag1, Flag2, Flag3, Flag4, ITunesId,FileType, Locations, PlayCount, year, rating, TrackType, Normalization, BPM, libpersid, persid";


//Includes polyfill straight from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/includes
if (![].includes) {
  Array.prototype.includes = function(searchElement /*, fromIndex*/ ) {
    'use strict';
    var O = Object(this);
    var len = parseInt(O.length) || 0;
    if (len === 0) {
      return false;
    }
    var n = parseInt(arguments[1]) || 0;
    var k;
    if (n >= 0) {
      k = n;
    } else {
      k = len + n;
      if (k < 0) {k = 0;}
    }
    var currentElement;
    while (k < len) {
      currentElement = O[k];
      if (searchElement === currentElement ||
         (searchElement !== searchElement && currentElement !== currentElement)) {
        return true;
      }
      k++;
    }
    return false;
  };
}


function getPersistentId(marker, index){
//for use in addITunesPlaylist, not nested since variables are independent. Might come in handy for something else.
  var pidIndex = null;
  for(var w = 0; w < marker[index].find('*').length; w++ ){
    if(marker[index].find('*')[w]){
        if(marker[index].find('*')[w].text() == 'Persistent ID'){
          pidIndex = w+1;
          return pidIndex;
        }
      }
    }
  }

module.exports = {
  addITunesPlaylist: function (playlistToAdd,callback){
    console.time('addiTunesPlaylist');
    addITunesPlaylist(playlistToAdd,callback);
  },
  //replaces db, currently requires
   importITunesMusic: function (pathToFile, performOperation, callback){
     console.time('importItunesMusic');
     importITunesMusic(pathToFile, performOperation, callback);
  },
  //Looks for song in database. If found, matches with file, otherwise add to Music db
  attemptMatch: function(file){
    //placed outside since cross used in other functions
    attemptMatch(file);
  },
  loadMusic: function (replace,callback){
      loadMusic(replace,callback);
  },
  syncMusic: function(loadMusicAfter, callback){ //syncMusic after importiTunes music
    console.time('syncMusic');
    syncMusic(loadMusicAfter,callback);
  },
  deleteTableFromDb: function deleteTableFromDb(db){
      musicdb.run("DELETE FROM " +db);
    },
  createDBs: function createDBs(){
    fs.stat('music.db', function(err,callback){
      if(err){console.log(err);}
            musicdb.serialize(function(){
      			     musicdb.run("CREATE TABLE if not exists PREMUSIC (Id INTEGER PRIMARY KEY, Name TEXT, Title TEXT, SortingTitle TEXT, AlbumArtist TEXT, TrackNumber INTEGER, TrackNumberOf INTEGER,Time INTEGER, Artist TEXT, SortingArtist TEXT, Album TEXT, SortingAlbum TEXT, genre TEXT, composer TEXT, producer TEXT, plays INTEGER, DateAdded TEXT, Size INTEGER, SampleRate INTEGER, BitRate INTEGER, AlbumArt BLOB, Flag1 INTEGER, Flag2 INTEGER, Flag3 INTEGER, Flag4 TEXT, ITunesId INTEGER, Comments TEXT, FileType TEXT, Locations TEXT, PlayCount TEXT, year INTEGER, rating TEXT, TrackType TEXT, Normalization TEXT, BPM TEXT, libpersid TEXT, persid TEXT)");
                 musicdb.run("CREATE TABLE if not exists MUSIC (Id INTEGER PRIMARY KEY, Name TEXT, Title TEXT, SortingTitle TEXT, AlbumArtist TEXT, TrackNumber INTEGER, TrackNumberOf INTEGER,Time INTEGER, Artist TEXT, SortingArtist TEXT, Album TEXT, SortingAlbum TEXT, genre TEXT, composer TEXT, producer TEXT, plays INTEGER, DateAdded TEXT, Size INTEGER, SampleRate INTEGER, BitRate INTEGER, AlbumArt BLOB, Flag1 INTEGER, Flag2 INTEGER, Flag3 INTEGER, Flag4 TEXT, ITunesId INTEGER, Comments TEXT, FileType TEXT, Locations TEXT, PlayCount TEXT, year INTEGER, rating TEXT, TrackType TEXT, Normalization TEXT, BPM TEXT, libpersid TEXT, persid TEXT)");
      			     musicdb.run("CREATE TABLE if not exists PLAYLISTS (Id INTEGER PRIMARY KEY, Name TEXT, Tracks TEXT, Path TEXT)");
                 musicdb.run("CREATE TABLE if not exists LOADER (Id INTEGER PRIMARY KEY, TrackId TEXT, PersId TEXT)");
                });
            });
    },
  testDBFunction: function(testDBFunctionVariable1){
    testDBFunction(testDBFunctionVariable1);
  },
  addTrackToPlaylist: function(){
    //should already be in a playlist
    addTrackToPlaylist(playlist,getActiveTrackId());
  },
  getPlaylists: function(c,callback){
    getPlaylists(c, callback);
  },
  getPlaylistAJAX: function(id,query,callback){
    getPlaylistAJAX(id,query,callback);
  },
  getTrackAddress: function(trackIndex,callback){
    getTrackAddress(trackIndex,callback);
  },
  checkRegisteredPlaylists: function(xmlPlaylistsInFolder,callback){
    checkRegisteredPlaylists(xmlPlaylistsInFolder,callback);
  },
  browseListFiles: function(directory,callback){
    browseListFiles(directory,callback);
  },
  addNewPlaylist: function(name, callback){
    addNewPlaylist(name,callback);
  },
  removePlaylist: function(playlistToRemove){
    removePlaylist(playlistToRemove);
  },
  getByUnique: function(mode,additional,callback){
    getByUnique(mode,additional,callback);
  },
  setDB: function(path,callback){
    setDB(path,callback);
  },
  readDB: function(callback){
    readDB(callback);
  },
  buildCatPlaylist: function(query,callback){
    buildCatPlaylist(query,callback);
  },
  checkForOrCreateConfig: function (callback){
    checkForOrCreateConfig(callback);
  },
  getConfigValues: function(callback){
    getConfigValues(callback);
  },
  setConfigValues: function(column,value,callback){
    setConfigValues(column,value,callback);
  },
  editPlaylist: function(id,queryString,callback){
    editPlaylist(id,queryString,callback);
  }

}

function removeLoader(){
  exec('rm -r ' + __dirname + loadDir +'* ' , function (error,stdout, stderr){
  });
  console.log('removed');

}

//ITunes library xml
function processForDB(x){
	switch(x){
  	case "Track ID":
  	return "ITunesId";
  	case "Name":
  	return "Title";
  	case "Artist":
  	return "Artist";
  	case "Album Artist":
  	return "AlbumArtist";
  	case "Album":
  	return "Album";
  	case "Genre":
  	return "genre";
  	case "Bit Rate":
  	return "bitRate";
  	case "Sort Album Artist":
  	return "SortingAlbum";
  	case "Total Time":
  	return "Time";
  	case "Track Number":
  	return "TrackNumber";
  	case "Track Count":
  	return "TrackNumberOf";
  	case "Composer":
  	return "Composer";
  	case "Kind":
  	return "FileType";
  	case "Date Added":
  	return "DateAdded";
  	case "Sample Rate":
  	return "sampleRate";
  	case "Play Count":
  	return "PlayCount";
  	case "Size":
  	return "Size";
  	case "Comments":
  	return "Comments";
  	case "Year":
  	return "Year";
    case "Persistent ID":
    return "persid";
    case "Rating":
    return "rating";
    case "Track Type":
    return "TrackType";
    case "Normalization":
    return "Normalization";
    case "BPM":
    return "BPM";
  	default:
  	return "Flag4";
	}
}


function attemptMatch(file){
var parser = mm(fs.createReadStream(file),  { duration: true}, 		function (err, metadata){
  if (err){ console.log(file);throw err ;}
  var song = musicdb.get("SELECT * FROM MUSIC WHERE Size=" +fs.statSync(file)['size'], function(err, row){
    if (err){throw err}
    if (row){
      if(metadata.duration = Math.ceil(parseInt(row.Time/1000)) || Math.ceil(parseInt(row.Time/1000)) + 1 || Math.ceil(parseInt(row.Time/1000)) -1)
      {
        //console.log(__dirname + musDir + path.basename(file));
        stmt = musicdb.prepare("UPDATE MUSIC SET Locations = (?) WHERE Id="+ row.Id );
        stmt.run(musDir + path.normalize(file).toString().split(loadDir)[1]);
        if (metadata.picture[0]){
          stmt = musicdb.prepare("UPDATE MUSIC SET AlbumArt = (?) WHERE Id="+ row.Id );
          stmt.run(metadata.picture[0].data);
        }

      }
    }
    else
    {
      stmt = musicdb.prepare("INSERT OR REPLACE INTO MUSIC(Artist, Title, AlbumArtist, Album, Year, TrackNumber,TrackNumberOf,genre,AlbumArt,Time,Size,Locations,DateAdded) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)");
      var a,b,c,d,e,f,g,h,i,j,k;
      if(metadata.artist[0]){a = metadata.artist[0]}else{a = null}
      if(metadata.title){b = metadata.title}else{b = null}
      if(metadata.albumartist[0]){c = metadata.albumartist[0]}else{c = null}
      if(metadata.album){d = metadata.album}else{d = null}
      if(metadata.year){e = metadata.year}else{e = null}
      if(metadata.track.no){f = metadata.track.no}else{g = null}
      if(metadata.track.of){g = metadata.track.of}else{h = null}
      if(metadata.genre[0]){h = metadata.genre[0]}else{i = null}
      if(metadata.picture[0]){i = metadata.picture[0].data}else{i = null}
      if(metadata.duration){j = metadata.duration * 1000}else{j = null} //until I find out how to get musicmetadata to give exact amounts.
      k = fs.statSync(file)['size'];
      l = __dirname + musDir + path.normalize(file).toString().split('/Loader/')[1];
      m = Date();
      stmt.run(a,b,c,d,e,f,g,h,i,j,k,l,m);

    }

  });
});}

//directory moving
function loadMusic(replace,callback)    {
  cpr(__dirname + loadDir,__dirname + musDir, {
      deleteFirst: false,
      overwrite: replace,
      confirm: true
    }, function(err, files){
      if(err){ throw error }
      console.timeEnd('syncMusic');
      removeLoader();
      callback();
    });
}
function syncMusic(andLoad,callback){
      var allowedTypes = ['.mp3','.wav', '.ogg', '.flac', '.m4a', '.m4p'];
      recursive(__dirname + loadDir, function (err, files){
        if (err) { throw err; }
        var count = 0;
        files.forEach(function(file){
          if(allowedTypes.includes(path.extname(file)) && loadDir && file.indexOf('__MACOSX')  == -1){
            attemptMatch(file);
          }
        });

        if(andLoad){
          loadMusic(false,function(){callback();});
        }
      });
}
//needs to check for dupes
function importITunesMusic(pathToFile, performOperation, callback){

  fs.readFile(pathToFile, {encoding: 'utf-8'}, function(err, data){
      var xml = libxmljs.parseXml(data);
      var currentEntry;
      var currentCount = 0;
      var address = xml.root().childNodes()[1].find('dict')[0].find('dict');
      if (performOperation){
          musicdb.serialize(function(){
              musicdb.run("DELETE FROM PREMUSIC");
              for(var u = 0; u < address.length; u++) //each song - starting with 1 since sqlite does
              {
              stmt = musicdb.prepare("INSERT OR REPLACE INTO PREMUSIC(Id) VALUES(NULL) "); //this will create blank entries if your run again
              stmt.run();
              }
              for(var x = 1; x < address.length + 1; x++) //each song - starting with 1 since sqlite does
              {
                  for(var y = 0; y < address[x-1].find('*').length; y++) //each entry per song
                  {
                    if(address[x-1].find('*')[y].name() == 'key' && address[x-1].find('*')[y].text() != 'Compilation' && address[x-1].find('*')[y].text() != 'Purchased' && address[x-1].find('*')[y].text() != 'Protected'){ //compilation, purchased, and protected are self closing tags
                        currentEntry = processForDB(address[x-1].find('*')[y].text());
                        stmt = musicdb.prepare("UPDATE PREMUSIC SET "+currentEntry+" = (?) WHERE Id = "+ x );
                        stmt.run(address[x-1].find('*')[y].nextSibling().text()); //sanitize this!
                    }
                  }
                  stmt = musicdb.prepare("UPDATE PREMUSIC SET libpersid = (?) WHERE Id = "+x );
                  stmt.run(xml.root().childNodes()[1].find('string')[2].text()); //persistant library id. !!Assuming third string field consistency.
              }
              musicdb.serialize(function(){
                musicdb.run("INSERT INTO MUSIC( Name, Title, SortingTitle, AlbumArtist, TrackNumber, TrackNumberOf, Time, Artist, SortingArtist, Album, SortingAlbum, genre, composer, producer, plays, DateAdded, Size, SampleRate, BitRate, AlbumArt, Flag1, Flag2, Flag3, Flag4, ITunesId, Comments, FileType, Locations, PlayCount, year, rating, TrackType, Normalization, BPM, libpersid, persid) SELECT Name, Title, SortingTitle, AlbumArtist, TrackNumber, TrackNumberOf, Time, Artist, SortingArtist, Album, SortingAlbum, genre, composer, producer, plays, DateAdded, Size, SampleRate, BitRate, AlbumArt, Flag1, Flag2, Flag3, Flag4, ITunesId, Comments, FileType, Locations, PlayCount, year, rating, TrackType, Normalization, BPM, libpersid, persid FROM PREMUSIC", function (e) { if (e) { console.log(e);} callback(); console.timeEnd('importItunesMusic'); });
              });
            });

          }
    });

      }

function addITunesPlaylist(pathToFile,callback){
  //will not work unless music db has the tracks. consider importitunesmusic first if having problems.
  musicdb.serialize(function(){

        stmt = musicdb.prepare('DELETE FROM LOADER');
        stmt.run();
        fs.readFile(pathToFile, {encoding: 'utf-8'}, function(err, data){
          var xml = libxmljs.parseXml(data);
          var playListToAdd = [];
          var playListOrder = [];
          for(var x = 0; x < xml.root().childNodes()[1].find('dict')[0].find('key').length; x++) //each song
          {
            stmt = musicdb.prepare("INSERT INTO LOADER (TrackId, PersId) VALUES (?,?)");
            var gpi = getPersistentId(xml.root().childNodes()[1].find('dict')[0].find('dict'), x);
            stmt.run(xml.root().childNodes()[1].find('dict')[0].find('dict')[x].find('integer')[0].text(),xml.root().childNodes()[1].find('dict')[0].find('dict')[x].find('*')[gpi].text());
          }

          for(var z = 0; z < xml.root().childNodes()[1].find('array')[0].find('dict')[0].find('array')[0].find('dict').length; z++) //each song
          {
            playListOrder[z] = xml.root().childNodes()[1].find('array')[0].find('dict')[0].find('array')[0].find('dict')[z].find('integer')[0].text(); //pers id
          }

          var order = 0;
          //Async is a strange beast. Recursion to the rescue
          function loaderToPlaylistRecursion(order){
                stmt = 'SELECT PersId FROM LOADER WHERE TrackId = '+playListOrder[order]+' LIMIT 1';
                musicdb.each(stmt, function(err, row){
                  if (err){throw err;}
                    playListToAdd[order] = row.PersId;

                    order++;
                    if(playListToAdd.length == playListOrder.length){

                      findLocalId(playListToAdd,0);

                  }
                  if(playListToAdd.length != playListOrder.length){

                    loaderToPlaylistRecursion(order++);
                  }
                });
              }

          function findLocalId(playListToAdd,startIndex){
            //find the Music DB ID, since that's the ID the program will use
            order = startIndex;
            stmt = 'SELECT id FROM MUSIC WHERE Persid = "'+playListToAdd[order]+'" LIMIT 1';
            musicdb.each(stmt, function(err, row){
              if (err){console.log(row);throw err;}
              playListToAdd[order] = row.Id;
              order++;
              if(order < playListToAdd.length ){
                findLocalId(playListToAdd, order);
              }
              if(order == playListToAdd.length){
                //once we finish going through the playlist, add the Music IDs to the playlist db
                stmt = musicdb.prepare("INSERT INTO PLAYLISTS (Name,Tracks,Path) VALUES (?,?,?)");
                stmt.run(path.basename(pathToFile, '.xml'), playListToAdd.toString(), pathToFile, function (e) { if (e) { console.log(e);} callback(); console.timeEnd('addiTunesPlaylist'); });
              }
            });
          }
              //clear loader library before copying playlist
              loaderToPlaylistRecursion(order);
        });
      });
    }


//this and the next function aren't in use
/*function addTrackToPlaylist(activePlaylist,trackId){
  musicdb.serialize(function(){
  console.log(activePlaylist);
  stmt = "SELECT Tracks FROM PLAYLISTS WHERE NAME = '" + activePlaylist.name.toString() +"' LIMIT 1";
  console.log(stmt);
  activePlaylist.list.push(trackId);
  var currentContents =  [];
  musicdb.each(stmt, function(err, row){
    if(err){throw err}
    currentContents.push(row.Tracks);
    currentContents.push(activePlaylist.list.toString())
    console.log(currentContents.toString());
    musicdb.run("UPDATE PLAYLISTS SET Tracks = ? WHERE Name = ?",currentContents.toString(), activePlaylist.name); //auto sanitizes
  });
});
}

function getActiveTrackId(){
  var trackId = "3";
  return trackId;
}

//to fill into playlist variable
function getActivePlaylist(playlist){
  var playlistContent = [];
  return;
}*/

function testDBFunction(testDBFunctionVariable1){
  musicdb.serialize(function(){
    stmt = "SELECT NAME FROM MUSIC WHERE Id = 1";
    musicdb.each(stmt, function(err, row){
      testDBFunctionVariable1(row.Name);
    });
  })
}

//C stands for container, as in the object that will hold the playlist info
function getPlaylists(c, callback){
  var playlistInfo = {
    ids: null,
    playlistNames: null,
    playlistTracks: null,
  }
  var _ids = [];
  var _playlistNames = [];
  var _playlistTracks = [];
  stmt = "SELECT * FROM PLAYLISTS";
  var count = 0;
  musicdb.each(stmt, function(err,row){
        _ids.push(row.Id);
        _playlistNames.push(row.Name);
        _playlistTracks.push(row.Tracks);
        playlistInfo.ids = _ids;
        playlistInfo.playlistNames =  _playlistNames;
        playlistInfo.playlistTracks = _playlistTracks;
      },function(){
        //console.log(playlistInfo);
        callback(playlistInfo);});
}

//gets one playlist
function getPlaylistAJAX(id, query, callback){
  var queryString = query ? query : '';
  if(id == 0){
	   stmt = "SELECT "+necessaryColumns+" FROM MUSIC"; //all music
  }
  else if (id < 0){
    //uses getbyunique to build a querystring, then buildcatplaylist to get custom playlist
    buildCatPlaylist(queryString,function(result){
      queryString = result;
      stmt = "SELECT " + necessaryColumns + " FROM MUSIC " +queryString; //custom/generated playlist
    });


  }
  else{
	   stmt = "SELECT ID, NAME, TRACKS FROM PLAYLISTS WHERE ID = "+id; //get specific id
  }
  var data,songObj, temp;
  musicdb.serialize(function(){
  musicdb.all(stmt,function(err,rows){
      if (id < 1){
        data = [{
          Id: id,
          Name: Array.isArray(id) ? id[0] : "All Tracks"+queryString,
        }];
        data[0].Tracks = [];
        musicdb.each(stmt,function(err,row){
          var trackListData = {}
          tracklistData = row;
          songObj = {trackId:row.Id,trackInfo:row}
          data[0].Tracks.push(songObj);
        },function(){callback(data)});
      }
      if(id > 0){
        if(rows[0].Tracks != null){
          data = rows;
          data[0].Tracks = data[0].Tracks.split(",");
          loopAssign(0);
        }
      }


      function loopAssign(i){
          var trackListData, trackListContainer = [];
          temp = data[0].Tracks[i];
            stmt = "SELECT "+necessaryColumns+" FROM MUSIC WHERE ID =" +data[0].Tracks[i];
          musicdb.each(stmt,function(err,row){
            trackListData = {};
            trackListData = row;
            songObj = {trackId:temp,trackInfo:trackListData}
            data[0].Tracks[i] = songObj;
          },function(){
            i++;
            if(i==data[0].Tracks.length){
            callback(data)
            }
            else{
              loopAssign(i);
            }
            });
      }
      });
  });
}



function getByUnique(mode,additional,callback){
  //additional is a query string
  //also gets used by buildCatPlaylist()
  var results = [];
  var column;
  var additionalParam = '';
  var modeMap = ["FILETYPE","GENRE","ARTIST","ALBUM"];
  switch(mode){
    case '1': //genre
      column = modeMap[1];
      break;
    case '2': //artist
      column = modeMap[2];
      break;
    case '3': //album
      column = modeMap[3];
      break;
    default:
      column = modeMap[0]; //for bogus arguments
      break;
  }

  if(additional){
    additionalParam = ' WHERE ';
    var query = additional;
    query = query.replace('&artist=','artist=');
    query = query.replace('artist=',' artist=');
    query = query.replace('&genre=',' genre=');
    query = query.replace('&album=','album=');
    query = query.replace('album=', ' album=');
    var queryComponents = query.split(' ');
    if(queryComponents[0].charAt(0) == '?'){
      queryComponents[0] = queryComponents[0].substring(1);
    }
    if(queryComponents[0].length < 1){ //SHITTY CHECK
      queryComponents.splice(0,1);
    }

    for (var i = queryComponents.length - 1; i > -1; i--) {
        var endQuoteNeeded = true;
        queryComponents[i] = decodeURIComponent(queryComponents[i]);
        queryComponents[i] = queryComponents[i].split('%2f').join('/');
        if (queryComponents[i].endsWith('=null')) {
            queryComponents[i] = "("+queryComponents[i].split('=null').join(' LIKE "%" OR '+queryComponents[i].split('=null')[0]+' IS NULL)');
            endQuoteNeeded = false;
        }
        queryComponents[i] = queryComponents[i].replace('=','="');
        if(endQuoteNeeded){
          queryComponents[i]+= '"';
        }
        if(i < 1){
            additionalParam += queryComponents[i];
        }
        else{
            additionalParam += queryComponents[i]+' AND ';
        }
        queryComponents.pop();
    }
  }

    stmt = 'SELECT DISTINCT ' + column + ' COLLATE NOCASE FROM MUSIC' + additionalParam;
    musicdb.each(stmt, function(err,row){
    results.push(row[column+' COLLATE NOCASE']);
  },function(){callback(mode ? results : additionalParam)});
}

function getTrackAddress(trackIndex, callback){
    var trackAddress;
    stmt = "SELECT LOCATIONS FROM MUSIC WHERE ID = "+trackIndex;
    musicdb.each(stmt, function(err,row){
      trackAddress = row.Locations;
    },function(){callback(trackAddress)});
}

function browseListFiles(directory,callback){
  var fileStatsBox = [];
  var i = 0;
  fs.readdir(directory, function(err, files){
    if (err){
      console.log(err);
    }
    else{
      //prevents crashing when going back too far
      files.forEach(function(file){
        fs.stat(path.join(directory,file), function(err,stats){
          if(err){
            console.log(err);
            return;
          }
          var data ={
            dir: directory,
            file: file,
            isDir: stats.isDirectory()
          };
          fileStatsBox.push(data);
          i++;
          if(i == files.length){
          callback(fileStatsBox)
          }
        });
      });
  }
  });
}

function checkRegisteredPlaylists(xmlPlaylistsInFolder,callback){
  var xpif = [];
  stmt = "SELECT * FROM PLAYLISTS";
  musicdb.each(stmt,function(err,row){
    if(err){console.log(err);}
    xmlPlaylistsInFolder.forEach(function(p, index, array){
      if (row.Path && row.Path.toString().endsWith(p.fileName)){
          xpif.push({listIndex:p.listIndex,fileName:p.fileName});
      }
      if(index == array.length - 1){
        callback(xpif);
      }
    });
  });
}

function addNewPlaylist(name, numAppend, callback){
  musicdb.serialize(function(){
    if(numAppend != undefined){
      name = name+'('+numAppend+')';
    }
    else{
      numAppend = 0;//Name is free
    }
    musicdb.get("SELECT ID FROM PLAYLISTS WHERE NAME = ?",name,function(err,row){
      if (err){console.log(err);}
      if(typeof row === 'undefined'){
        stmt = musicdb.prepare("INSERT INTO PLAYLISTS(NAME) VALUES(?)",name);
        stmt.run(function(){
          musicdb.get("SELECT ID FROM PLAYLISTS WHERE NAME = ?",name,function(err,row){
            editPlaylist(row.Id,"1"); //PLAYLISTS MUST HAVE AT LEAST 1 SONG
          });
        });

      }
      else{
        var reg = /\((\d+)\)/;
        if(name.toString().lastIndexOf("(") > -1){
          var nAstart = name.toString().substr(name.lastIndexOf("("));
          if(reg.test(nAstart)){
            name = name.substr(0,name.lastIndexOf('('));
          }
        }
        numAppend++;
        addNewPlaylist(name,numAppend);
      }
    });
  })
}

function removePlaylist(playlistToRemove){
  stmt = musicdb.prepare("DELETE FROM PLAYLISTS WHERE ID = (?)",playlistToRemove);
  stmt.run();
}

if (typeof String.prototype.endsWith !== 'function') {
    String.prototype.endsWith = function(suffix) {
        return this.indexOf(suffix, this.length - suffix.length) !== -1;
    };
}

function buildCatPlaylist(query,callback){
  getByUnique(null,query,function(result){
    callback(result);
  });

}

function setDB(path,callback){
  if(path == undefined){
    music = music;
    musicdb = new sqlite3.Database(music);
    callback(music);
  }
  else if(path == 0){
    music = 'music.db';
    musicdb = new sqlite3.Database(music);
    callback(music);
  }
  else{
    //console.log('setting new musicDir',path);
    setConfigValues('MUSICDBLoc',path.toString(),function(){
      musicdb = new sqlite3.Database(music);
      callback(music);
    });

  }

}

function readDB(callback){
  getConfigValues(function(row){
    callback(row.MUSICDBLoc);
  });
}

function checkForOrCreateConfig(callback){
  fs.stat('config.db', function(err,stats){
      if(err){console.log(err);}
      configdb.serialize(function(){
        configdb.run("CREATE TABLE if not exists CONFIG (Id INTEGER PRIMARY KEY, MusicDir TEXT, LoadDir TEXT, MUSICDBLoc TEXT)");
        callback();
      });
    });
  };

function setConfigDefaults(callback){
    configdb.serialize(function(){
        configstmt = configdb.prepare("INSERT OR REPLACE INTO CONFIG(Id,MusicDir,LoadDir,MUSICDBLoc) VALUES(1,'/Music/','/Loader/', 'music.db')");
        configstmt.run();
        if(callback){callback();}
    });
}

function getConfigValues(callback){
  configdb.serialize(function(){
    configdb.get("SELECT * FROM CONFIG WHERE ID = 1",function(err,row){
      if (err){console.log(err,err.errno);}
      if(!callback){
        if(row == undefined){
          //config hasn't been set, so set them
          setConfigDefaults(assignConfigSettings)
        }
        else{
          assignConfigSettings();
        }
      }
      else{
        callback(row);
      }
    });
  });
}

function setConfigValues(column,value,callback){
  if(column == "MusicDir" || column == "LoadDir" || column == "MUSICDBLoc"){
    //console.log('path',value);
    configdb.serialize(function(){
      configstmt = configdb.prepare("UPDATE CONFIG SET "+column+" = (?) WHERE Id = 1");
      configstmt.run(value);
      assignConfigSettings(function(){
        if(callback){callback();}
      });
    });
  }
  else{
    return;
  }
}

function assignConfigSettings(callback){
  configdb.serialize(function(){
    configdb.get("SELECT * FROM CONFIG WHERE ID = 1",function(err,row){
      if (err){throw(err);}
          musDir = row.MusicDir;
          loadDir = row.LoadDir;
          music = row.MUSICDBLoc;
          if(callback){callback();}
      });
  });
}

function editPlaylist(id,queryString,callback){
  if (id < 1 || typeof queryString != 'string'){
    return;
  }
  musicdb.serialize(function(){
    stmt = musicdb.prepare("UPDATE PLAYLISTS SET TRACKS = (?) WHERE ID = "+id);
    stmt.run(queryString);
    if(callback){callback();}
  });

}
checkForOrCreateConfig(getConfigValues);
//setConfigDefaults();
//getConfigValues();
//assignConfigSettings();
