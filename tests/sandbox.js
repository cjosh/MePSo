//unclosured version of clientside eureca-wrapped functions
var playlistInfo;
//goal to get all artists into a separate array with their songs
//Artists - 1 :


var artists = [];

function getPlaylistF(playlist,option){
  var xhr = new XMLHttpRequest();
  xhr.open('GET', encodeURI('/playlists/'+playlist));
  //maybe doing too much. Break out?
  xhr.onload = function(){
    if (xhr.status === 200){
      playlistInfo = JSON.parse(xhr.responseText);
      switch(option){
        case undefined: listPlaylist(playlistInfo);
        break;
        case 0: sortPlaylistItems(playlistInfo,0);
        break;
      };
    }
    else{
      console.log('failed to get tracks - getPlaylistF('+playlist+')');
    }
  };
  xhr.send();
}


function sortPlaylistItems(playlistInfo,type){
  switch(type){
    case 1: //artist

      //sort first
      playlistInfo.Tracks.sort(function(a,b){
        if(a.trackInfo.Artist === null){
            a.trackInfo.Artist = "";
          }
        if(b.trackInfo.Artist === null){
            b.trackInfo.Artist = "";
          }
        if(a.trackInfo.Artist.toLowerCase().localeCompare(b.trackInfo.Artist.toLowerCase()) == -1){
          return -1;
        }
        if(a.trackInfo.Artist.toLowerCase().localeCompare(b.trackInfo.Artist.toLowerCase()) == 1){
          return 1;
        }
        return 0;
      });


      break;
  }
}

module.exports = {
  sortPlaylistItems: function(playlistInfo,type){
    sortPlaylistItems(playlistInfo,type);
  },
  getPlaylistF: function(playlist,option){
    getPlaylistF(playlist,option);
  }
}
