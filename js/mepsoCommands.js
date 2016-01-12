var playlistsContainer;
var listmaster = 'listmaster';
var screenArea = 'screen'; //swap this out if you want to change the app's screen div
var playlistInfo; //if no playlist, set to music db results
var categoryInfo;
var playlists;
var audioPlayer;
var currentlyPlaying = '';
var song;
var dir;
var fileBrowser;
var globalQuery = []


function buildQuery(qString){
  globalQuery.push(qString);
  return globalQuery;
}


function idHasClass(element, selector) { //quick and dirty borrow, don't know if I want to use jQuery yet
    if (typeof element != 'string') {
        return false;
    }
    var className = " " + selector + " ";
    if (document.getElementById(element).nodeType === 1 && (" " + document.getElementById(element).className + " ").replace(/[\n\t\r]/g, " ").indexOf(className) >= 0) {
        return true;
    }
    return false;
}







function resetScreen(){
  //console.log('clearing',document.getElementById(screenArea));
  document.getElementById(screenArea).innerHTML = '';
}


//shuffle feature requiring getPlaylist to run first. We must already be in a playlist
function shufflePlaylist(playlistInfo){
  if (!playlistInfo){
    return;
  }
  var newPlaylistInfo = playlistInfo;
  newPlaylistInfo.Tracks.map(function(){
    for(var i = playlistInfo.Tracks.length -1; i > 0; i--){
      var j = Math.floor(Math.random()*(i + 1));
      var temp = newPlaylistInfo.Tracks[i];
      newPlaylistInfo.Tracks[i] = newPlaylistInfo.Tracks[j];
      newPlaylistInfo.Tracks[j] = temp;
      }

  });
  listPlaylist(newPlaylistInfo);
}


if (typeof String.prototype.endsWith !== 'function') {
    String.prototype.endsWith = function(suffix) {
        return this.indexOf(suffix, this.length - suffix.length) !== -1;
    };
}


function toggleKeyboard(forceHide){
  if(forceHide){
    document.getElementById('keyboard').classList.add('hidden');
    return;
  }
  if(document.getElementById('keyboard').classList.contains('hidden')){
    //console.log('showing');
    document.getElementById('keyboard').classList.remove('hidden');
  }
  else{
    //console.log('hiding');
    document.getElementById('keyboard').classList.add('hidden');
  }
}
