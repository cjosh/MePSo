"use strict";
var eurecaClient = new Eureca.Client();
var editMode = 0;
var playlistEdited;
var currentlyEditing = false;
eurecaClient.exports.toggleLoadingScreen = function (){
    //console.log('toggled');
    if (idHasClass('loading', 'active')) {
        //remove active class
        document.getElementById('loading').classList.remove("active");
    }
    else {
        //remove active class
        document.getElementById('loading').classList.add("active");
    }
}
eurecaClient.exports.toggleDoneMessage = function (){
  alert('done');
}
eurecaClient.ready(function(serverProxy){
  var screenArea = document.getElementById('screen');

  class Mepso extends React.Component{
    constructor(){
      super();
    }

    render(){
      return <div className="mepso">
                <div id="player">
                  <MepsoMediaControls />
                </div>
                <div id="main">
                  <MepsoMainMenu />
                </div>
                <div id="screen"></div>
                <div id="screen2"></div>
                <div id="loading"><img alt="loading" src="/Styles/Default/img/loading.svg"/></div>
                <div id="keyboard" className="hidden"></div>
              </div>
    }
  }

  class MepsoMediaControls extends React.Component {
    constructor(props){
      super(props);
      this.state = {hidden: false, explicitHide: false};
    }
    render(){

      return <div className="MepsoMediaControls">
          <CurrentlyPlaying/>
          <div className="audioContainer">
              <a href="#" id="prevSong">&laquo;</a>
              <audio controls id="audioPlayer" src=""></audio>
              <a href="#" id="nextSong">&raquo;</a>
          </div>
      </div>
    }

    componentDidMount(){

      this._addNavEventListeners();

      //onscreen keyboard
      //A new Oskar is created each time, may need to edit the script
      var oskar = document.createElement("script");
      oskar.type = "application/javascript";
      oskar.src = "/js/oskar.js";
      document.body.appendChild(oskar);
    }

    _addNavEventListeners(){
      document.getElementById('nextSong').addEventListener('click',function(e){
        e.preventDefault();
        checkIfNextSong();
      });
      document.getElementById('prevSong').addEventListener('click',function(e){
        e.preventDefault();
        //MepsoMediaControls.setState({songCurrentlyPlaying:3});
        if(audioPlayer.currentTime < 1.8){
          if(song > 0){
            changeSong(song - 1);playSong();
          }
          else{playSong();}
        }
        else{playSong();}
      });
    }
  }

  //need to find a way to pass song data in here
  class CurrentlyPlaying extends React.Component{
    constructor(){
      super();
      this.state = {hasRendered :false};
    }
    componentDidUpdate(){
      if(currentlyPlaying.length>0){
        curPlayClassToggle();
      }
    }
    render(){
      //cheat to get componentDidUpdate to fire on first go
      if(this.state.hasRendered == false){
        this.state.hasRendered = true;
        this.forceUpdate();
      }
      this.state = {songPlaying:currentlyPlaying.length > 0 ? currentlyPlaying : 'Nothing Currently Playing'}

      return <div className="currentlyPlaying" data-currenttrack={this.props.currenttrack != undefined ? playlistInfo.Tracks[this.props.currenttrack].trackId : ''}>{this.state.songPlaying}</div>
    }
  }

  class MepsoMainMenu extends React.Component{
    constructor(){
      super();
    }
    render(){
      //Es6 attribute spread is amazing, can pass in objects as attr
      return <div>
                <MainMenuButton {...menuStructure._0} className={"mainMenuButton"}/>
             </div>
    }
  }

  class MainMenuButton extends React.Component{
      constructor(props){
        super(props);
      }

      _clickAction(){
        this.props.function()
      }

      render(){
        var titleText = this.props.textName != undefined ? this.props.textName : this.props.name; //is a back button?
        return <div className={this.props.className} menuName={this.props.name} onClick={this._clickAction.bind(this)}>{titleText}
        </div>
      }
  }

  class Playlist extends React.Component{
    constructor(props){
      super();
    }

    _playAction(){
      getPlaylistF(this.props.playlistId,null);

    }

    _deleteAction(){
      delPlaylistF(this.props.playlistId);
      getPlaylistsF(0);
    }

    _editAction(){
      getPlaylistF(this.props.playlistId,null,true);
    }

    _action(){
      switch(this.props.mode){
        case 0:
          return this._deleteAction();
          break;
        case 1:
          editMode = 1;
          return this._editAction();
          break;
        default: return this._playAction();
      }

    }

    render(){

      return <div className={"playlist"}>
        <a onClick={this._action.bind(this)} mode={this.props.mode}>{this.props.playlistName}</a>
      </div>
    }

  }


  var draggedObject;
  class Song extends React.Component{
    constructor(props){
      super(props);
      this.state = {isPlaying:false,dragMode:editMode == 1 ? true : false,eligibleToDrag: true};
      //this.dragStart = this.dragStart.bind(this);
    }

    _clickAction(){

      if(this.state.dragMode == false){
        changeSong(this.props.arrIndex); //-1 because of db indices vs playlists array
        playSong();
      }
    }

    dragStart(e){

      if(e.currentTarget.parentNode.parentNode.id == 'screen'){
        Array.prototype.every.call(document.getElementById('screen2').getElementsByClassName('track'),function(e1){

          if(e1.getAttribute('data-songid') == e.currentTarget.getAttribute('data-songid')){

            this.setState({eligibleToDrag:false});
            e.currentTarget.classList.add('ineligible'); //since we're not really using the virtualdom here
            return false;
          }
          else{
            e.currentTarget.classList.remove('ineligible');

            return true;
          }
          //  e.target.parentNode.insertBefore(draggedObject,e.target.nextElementSibling);
        },this);
      }

      if(e.currentTarget.parentElement.parentElement.id=="screen"){
        e.dataTransfer.effectAllowed = 'copy';
      }
      if(e.currentTarget.parentElement.parentElement.id=="screen2"){
        e.dataTransfer.effectAllowed = 'move';
      }
      draggedObject = e.currentTarget;
      e.dataTransfer.setData("text/html",e.currentTarget);
    }

    dragEnd(e){
      e.preventDefault();
      //console.log('end drag');
    }

    dragOver(e){
      e.preventDefault();
      var relY = e.clientY - e.target.offsetTop;
      var height = e.target.offsetHeight / 2;
      //console.log("ready",this.state.eligibleToDrag);
      if(e.target.parentNode.parentNode.id == 'screen2' && !draggedObject.classList.contains('ineligible')){
        //console.log(this);

        if(draggedObject.parentNode.parentNode.id == 'screen'){
          var clone = draggedObject.cloneNode(true);
          var cloneSibling = draggedObject.nextElementSibling;
          draggedObject.parentNode.insertBefore(clone,cloneSibling);
        }
        if(relY > height ){
          e.target.parentNode.insertBefore(draggedObject,e.target.nextElementSibling);
        }
        else if(relY < height ){
          e.target.parentNode.insertBefore(draggedObject,e.target);
        }
      }
      else if(e.target.parentNode.parentNode.id == 'screen' && draggedObject.parentNode && draggedObject.parentNode.parentNode.id == 'screen2' && document.getElementById('screen2').getElementsByClassName('track').length > 1){
        draggedObject.remove();
        //e.stopPropagation();
      }
      return;

    }
    render(){
      var isDragMode = this.state.dragMode == true;
      if(isDragMode){
        document.getElementById('screen').classList.add("drag");
        document.getElementById('screen2').classList.add("drag");
      }
      else{
        document.getElementById('screen').classList.remove("drag");
        document.getElementById('screen2').classList.remove("drag");
      }

      return <div data-songid={this.props.trackInfo.Id} onClick={this._clickAction.bind(this)} className={"track"} draggable={isDragMode ?  "true": "false"} onDragEnd={isDragMode ? this.dragEnd.bind(this) : ''} onDragOver={isDragMode ? this.dragOver.bind(this) : ''} onDragStart={isDragMode ? this.dragStart.bind(this) : ''}>
        <span draggable={"false"}>{this.props.trackInfo.Title}</span><br draggable={"false"} />
        <span draggable={"false"}><i draggable={"false"}>{this.props.trackInfo.Artist}</i></span>
      </div>
    }

  }

  class Category extends React.Component{
      constructor(props){
        super(props);
      }

      _clickAction(){
        switch(this.props.type){
          case undefined:
            listCategory(categoryInfo);
            break;
          case 1:
            buildQuery("genre="+this.props.listItem);
            getCategory(2);
            break;
          case 2:
            buildQuery("artist="+this.props.listItem);
            getCategory(3);
            break;
          case 3:
            var finalQuery = buildQuery("album="+this.props.listItem);
            getPlaylistF(-1,getCategory());
  			break;
        }
      }

      render(){
        return <div onClick={this._clickAction.bind(this)} className="category">
          <span>{this.props.listItemName}</span>
        </div>
      }
  }

  class NewPlaylistInput extends React.Component{
    constructor(props){
      super(props);
    }

    _clickAction(){
      createPlaylist();
      alert("playlist created");
    }

    _inputTouchAction(){
        //toggle on screen keyboard here
    }

    componentDidMount(){
      console.log('mounted');
      //make textbox react component
      this.addEventListeners();
    }

    componentWillUnmount(){
      console.log('unmounting');

    }

    addEventListeners(){
      document.getElementById('newPlaylist').addEventListener("focus", function( event ) {
          console.log(document.activeElement);
          toggleKeyboard();
      }, true);
    }

    _onComplete(){
        //finishing action, message etc. here. Maybe this should be a state.
    }

    render(){
      return <div className="newPlaylist">
        <p>Enter a playlist name</p>
        <input type="text" id="newPlaylist" placeholder="Create a new playlist"/>
        <input type="submit" value="create playlist" onClick={this._clickAction.bind(this)}/>
      </div>
    }
  }

  function listPlaylist(playlistInfo,editMode){
    var listOfSongs = [];
    var editListOfSongs = [];
    for(var i = 0;i < playlistInfo.Tracks.length;i++){
      listOfSongs.push(<Song {...playlistInfo.Tracks[i]} key={i} arrIndex={i}/>);
      if(editMode){
        editListOfSongs.push(<Song {...playlistInfo.Tracks[i]} key={i+'_'+i} arrIndex={i}/>);
      }
    }
    React.render(<div key={'screen'+12}>{listOfSongs}</div>,document.getElementById('screen'));
    if(editMode){
      editListOfSongs.unshift(<div key={'screen2Menu'}><h3>Edit playlist:</h3><div key={'screen2Menua1'} id="doneEdit" onClick={doneEdit}>Done</div> <div key={'screen2Menua2'} id="cancelEdit" onClick={cancelEdit}>Cancel</div></div>);
      React.render(<div key={'screen2'+12}>{editListOfSongs}</div>,document.getElementById('screen2'));
    }
    curPlayClassToggle();
  }

  function listCategory(categoryInfo,categoryType){
    var sortedCategories = categoryInfo.sort(function(a,b){
      if(a == null){
        return 1;
      }
      if(b == null){
        return -1;
      }
      return a.toLowerCase().localeCompare(b.toLowerCase());
    });

    var listOfCategories = [];
    var nullCategoryAdded = false;
    for (var i = 0; i < sortedCategories.length; i++){
  		switch(categoryType){
  			default:
          if(sortedCategories[i] == null){
            nullCategoryAdded = true;
          }
  				listOfCategories.push(<Category type={categoryType} listItem={sortedCategories[i]} listItemName={sortedCategories[i] == null ? 'ALL' : sortedCategories[i]} key={i} isNull={sortedCategories[i] == null}/>);
  				break;
  		}
    }
    if(!nullCategoryAdded){ //'ALL' option
      listOfCategories.push(<Category type={categoryType} listItem={null} listItemName={'ALL'} key={-1} isNull={true}/>);
    }
    React.render(<div>{listOfCategories}</div>,document.getElementById('screen'));
  }

  function createPlaylist(){
    var xhr = new XMLHttpRequest();
    var playlistCreateRequest = encodeURI(document.getElementById('newPlaylist').value);

    xhr.open('POST','/playlist/new',true);
    xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    xhr.onreadystatechange = function(){
      //ready state is staying at 1...
      if(xhr.readyState == 4 && xhr.status == 200){
        console.log(playlistCreateRequest+' playlist created');
      }
    }
      if(playlistCreateRequest.length > 0){
        xhr.send(playlistCreateRequest);
        document.getElementById('newPlaylist').value = '';
      }
  }

  function getPlaylistF(playlist,option,editMode){
    if(!option){
      option = '';
    }
    var xhr = new XMLHttpRequest();
    var urlPath = '/playlists/'
    option = option.split('/').join('%2f'); //should be queryString or something, option is not a good name
    xhr.open('GET', encodeURI(urlPath+playlist+option));
    //maybe doing too much. Break out?
    xhr.onload = function(){
      if (xhr.status === 200){
        playlistInfo = JSON.parse(xhr.responseText);
        if(!editMode){
          listPlaylist(playlistInfo);
        }
        else{
          listPlaylist(playlistInfo,true);

          if(playlistInfo.Id > 0 && !currentlyEditing){
            playlistEdited = playlistInfo.Id;
            currentlyEditing = true;
          }
        }
      }
      else{
        console.log('failed to get tracks - getPlaylistF('+encodeURI(playlist)+')');
      }
    };
    xhr.send();
  }


  function getPlaylistsF(mode){
    var chosenFunction;
    switch(mode){
      case undefined:
        chosenFunction = '';
        break;
      case 0:
        chosenFunction = '';
        break;
    }
    var xhr = new XMLHttpRequest();
    xhr.open('GET', encodeURI('/playlists/'));
    xhr.onload = function(){
      if (xhr.status === 200){
        playlists = JSON.parse(xhr.responseText);
        //resetScreen();
        var listOfPlaylists=[];
        for(var i = 0; i < playlists.ids.length; i++){
          listOfPlaylists.push(<Playlist mode={mode} data-playlistId={playlists.ids[i]} playlistId={playlists.ids[i]} playlistName={playlists.playlistNames[i]} key={i}/>)
        }
        React.render(<div>
          {listOfPlaylists}
          </div>,document.getElementById('screen')
        );

      }
      else{
        console.log('failed to get playlists - getPlaylistsF()');
      }
    };
    xhr.send();
  }

  function getCategory(type){
    //currently also retrieves custom queries
    var xhr = new XMLHttpRequest();
    var queryString = '?';
    var localQuery = globalQuery.slice();
    //console.log('GLOBAL QUERY!',globalQuery);
  	for(var i = localQuery.length-1; i > -1; i--){
  		if(i == 0){
        console.log('==',localQuery[i]);
        queryString += localQuery[i];
      }
      else{
        queryString += localQuery[i]+'&';
      }
      if(localQuery.length > 0){
        localQuery.pop();
      }
      //console.log('-QUERYSTRING',queryString);

  	}
    console.log('typeof',typeof type);
    if(type == null || type == undefined){

      return queryString;
    }
    queryString = queryString.split('/').join('%2f');
    xhr.open('GET', encodeURI('/category/'+type.toString()+queryString));

    xhr.onload = function(){
      if(xhr.status === 200){
        categoryInfo = JSON.parse(xhr.responseText);
        listCategory(categoryInfo,type);
      }
      else{
        console.log('failed to query by '+type);
      }
    }
    xhr.send();
  }

  function getArtists(genre){
	  var xhr = new XMLHttpRequest();
	  switch(genre){
	    case undefined:
			xhr.open('GET', encodeURI('/category/2'));
			break;
		default:
			xhr.open('GET', encodeURI('/category/2'+'?genre='+genre));
		}

	  xhr.onload = function(){
		  if(xhr.status === 200){
			  categoryInfo = JSON.parse(xhr.responseText);
			  listCategory(categoryInfo,2);

		  }
		  else{
			  console.log('failed to retrieve artists');
		  }
	  }
	  xhr.send();
  }

  function getGenres(){
	  var xhr = new XMLHttpRequest();
	  xhr.open('GET', encodeURI('/category/1'));
	  xhr.onload = function(){
		  if(xhr.status === 200){
			  categoryInfo = JSON.parse(xhr.responseText);
			  listCategory(categoryInfo,1);

		  }
		  else{
			  console.log('failed to retrieve genres');
		  }
	  }
	  xhr.send();
  }

  function delPlaylistF(x){
    if(confirm("Are you sure you want to delete this playlist?") == true){
      var xhr = new XMLHttpRequest();
      xhr.open('DELETE', encodeURI('/playlists/'+x));
      xhr.onload = function(){
        if (xhr.status === 200){
          alert("playlist deleted");
        }
        else{

        }
      };
      xhr.send();
    }
    else{

    }
  }

  function cleanQuery(){
    console.log('cleaning query');
	  globalQuery = [];
  }

  function changeSong(q){
    song = q;
    //React.render(<CurrentlyPlaying/>,document.getElementsByClassName('currentlyPlaying')[0]);
  }

  function playSong(){
    audioPlayer = document.getElementById("audioPlayer");
    //console.log('song: '+song);
    if(playlistInfo.Tracks[song].trackInfo.Locations == null){
      checkIfNextSong(song);
    }
    else{
      var songAddress = playlistInfo.Tracks[song].trackInfo.Locations;
      var address = songAddress.substring(songAddress.indexOf('/Music/'));
      audioPlayer.setAttribute("src",address);
      audioPlayer.play();
      currentlyPlaying = playlistInfo.Tracks[song].trackInfo.Title + ' by ' + playlistInfo.Tracks[song].trackInfo.Artist;
      React.render(<CurrentlyPlaying currenttrack={song}/>,document.getElementsByClassName('currentlyPlaying')[0]);
      timeUpdate();

    }
  }

  function curPlayClassToggle(){
    var cur = document.getElementsByClassName('currentlyPlaying')[document.getElementsByClassName('currentlyPlaying').length-1].attributes['data-currenttrack'].value;
    Array.prototype.forEach.call(document.getElementsByClassName("track"),function(n){
      if(n.getAttribute('data-songid') == cur){ //n.classList.contains('playing')
        n.classList.add('playing');
      }
      else{
        n.classList.remove('playing');
      }
    });
  }

  //I'm sure this code doesn't need to be repeated, need to address later
  function selFileClassToggle(i){
    Array.prototype.forEach.call(document.getElementsByClassName("fileBrowse"),function(n){
      if(n.classList.contains('sel') && n.id != "file-"+i){ //n.classList.contains('playing')
        n.classList.remove('sel');
      }
    });
  }

  function checkIfNextSong(){
      //console.log(song);
      if(playlistInfo.Tracks[song+1] != null){
        console.log(playlistInfo.Tracks[song+1].trackInfo.Title + " up next");
        song++;
        playSong(song);
        return true;
      }
  }
  function timeUpdate(){
    audioPlayer.removeEventListener("timeupdate",true);
    audioPlayer.addEventListener("timeupdate",function(){
      //console.log(audioPlayer.currentTime,audioPlayer.duration)
      if(audioPlayer.currentTime == audioPlayer.duration){
        //console.log('made it',song);
        audioPlayer.setAttribute("src","");
        checkIfNextSong(song);
        return;
      }
    },true);
  }

  function doneEdit(){

    if(confirm("Save playlist edits?") == true){
      var newOrder = [];
      Array.prototype.forEach.call(document.getElementById('screen2').getElementsByClassName('track'),function(i){
        newOrder.push(i.getAttribute('data-songid'));

      });
      if(newOrder.length < 1){
        alert("you need at least one track");
        return;
      }
      currentlyEditing = false;
      var xhr = new XMLHttpRequest();
      xhr.open('PUT', encodeURI('/playlists/'+playlistEdited+'?tracks='+newOrder.toString()));
      xhr.onload = function(){
        if (xhr.status === 200){
          alert("playlist edited");
          cancelEdit();
        }
        else{

        }
      };
      xhr.send();

    }
  }
  function cancelEdit(){
      editMode = 0;
      resetScreen();
      document.getElementById('screen2').innerHTML = "";
      document.getElementById('screen2').classList.remove('drag');
      document.getElementById('screen').classList.remove('drag');
  }
  serverProxy.sendDir().onReady(function(result){dir = result;console.log(dir);});

  var menuStructure = {
    _0 : {
                "key": "_0",
                "name": "Main Menu",
                "function": function(){resetScreen();getNextMenu(this.nextButtons,this.backButton)},
                get nextButtons (){
                  return [menuStructure._00,menuStructure._10]
                },
                get backButton (){
                  return []
                }
              },
    _00 : {
                "key": "_00",
                "name": "Listen",
                "function": function(){resetScreen();cleanQuery();getNextMenu(this.nextButtons,this.backButton)},
                get nextButtons (){
                  return [menuStructure._01,menuStructure._02,menuStructure._03,menuStructure._04,menuStructure._05]
                },
                get backButton (){
                  return [menuStructure._0]
                }
              },
    _01 : {
                "key": "_01",
                "name": "By Track",
                "function": function(){resetScreen();getPlaylistF(0);getNextMenu(this.nextButtons ,this.backButton)},
                "nextButtons" : [],
                get backButton (){
                  return [menuStructure._00]
                }
              },
    _02 : {
                "key": "_02",
                "name": "By Artist",
                "function": function(){getCategory(2);getNextMenu(this.nextButtons ,this.backButton)},
                "nextButtons" : [],
                get backButton (){
                        return [menuStructure._00]
                }
              },
    _03 : {
                "key": "_03",
                "name": "By Album",
                "function": function(){getCategory(3);getNextMenu(this.nextButtons ,this.backButton)},
                "nextButtons" : [],
                get backButton (){
                return [menuStructure._00]
                }
              },
    _04 : {
                "key": "_04",
                "name": "By Genre",
                "function": function(){getCategory(1);getNextMenu(this.nextButtons ,this.backButton)},
                "nextButtons" : [],
                get backButton (){
                  return [menuStructure._00]
                }
              },
    _05 : {
                "key": "_05",
                "name": "By Playlist",
                "function": function(){getPlaylistsF();getNextMenu(this.nextButtons ,this.backButton)},
                "nextButtons" : [],
                get backButton (){
                  return [menuStructure._00]
                }
              },
    _10 : {
                "key": "_10",
                "name": "Manage",
                "function": function(){getNextMenu(this.nextButtons,this.backButton)},
                get nextButtons (){
                  return [menuStructure._12,menuStructure._13]
                },
                get backButton (){
                  return [menuStructure._0]
                }
              },
    _11 : {
                "key": "_11",
                "name": "Manage Tracks",
                //for swapping out m4ps
                "function": function(){resetScreen();getNextMenu(this.nextButtons,this.backButton)},
                get nextButtons (){
                  return []
                },
                get backButton (){
                  return [menuStructure._10]
                }
              },
    _12 : {
                "key": "_12",
                "name": "Manage Playlists",
                "function": function(){resetScreen();getNextMenu(this.nextButtons,this.backButton)},
                get nextButtons (){
                  return [menuStructure._120,menuStructure._121,menuStructure._122,menuStructure._123]
                },
                get backButton (){
                  return [menuStructure._10]
                }
              },
    _13 : {
                "key": "_13",
                "name": "Manage Music",
                "function": function(){resetScreen();getNextMenu(this.nextButtons,this.backButton)},
                get nextButtons (){
                  return [menuStructure._130,menuStructure._131,menuStructure._132,menuStructure._133,menuStructure._134]
                },
                get backButton (){
                  return [menuStructure._10]
                }
              },

    _120 : {
                "key": "_120",
                "name": "Create Playlist",
                "function": function(){getNextMenu(this.nextButtons,this.backButton);React.render(<NewPlaylistInput />,document.getElementById('screen'));},
                get nextButtons (){
                  return []
                },
                get backButton (){
                  return [menuStructure._12,toggleKeyboard()]
                }
              },
    _121 : {
                "key": "_121",
                "name": "Edit Playlist",
                "function": function(){getNextMenu(this.nextButtons,this.backButton);getPlaylistsF(1);},
                get nextButtons (){
                  return []
                },
                get backButton (){
                  return [menuStructure._12]
                }
              },
    _122 : {
                "key": "_122",
                "name": "Delete Playlist",
                "function": function(){getPlaylistsF(0);getNextMenu(this.nextButtons,this.backButton);},
                get nextButtons (){
                  return []
                },
                get backButton (){
                  return [menuStructure._12]
                }
              },
    _123 : {
                "key": "_123",
                "name": "Import iTunes Playlist",
                "function": function(){fileBrowse(dir,1,serverProxy.addITunesPlaylist);getNextMenu(this.nextButtons,this.backButton);},
                get nextButtons (){
                  return []
                },
                get backButton (){
                  return [menuStructure._12]
                }
              },
    _130 : {
                "key": "_130",
                "name": "Create Music Database",
                "function": function(){resetScreen();serverProxy.createDBs();alert('Music database OK');getNextMenu(this.nextButtons,this.backButton);},
                get nextButtons (){
                  return []
                },
                get backButton (){
                  return [menuStructure._13]
                }
              },
    _131 : {
                "key": "_131",
                "name": "Sync Music",
                "function": function(){if(confirm("Sync music to database?") == true){serverProxy.syncMusic(true)};getNextMenu(this.nextButtons,this.backButton);},
                get nextButtons (){
                  return []
                },
                get backButton (){
                  return [menuStructure._13]
                }
              },
    _132 : {
                "key": "_132",
                "name": "import iTunes Library XML",
                "function": function(){fileBrowse(dir,2,serverProxy.importITunesMusic);getNextMenu(this.nextButtons,this.backButton);},
                get nextButtons (){
                  return []
                },
                get backButton (){
                  return [menuStructure._13]
                }
              },
    _133 : {
                "key": "_133",
                "name": "Set Music Folder Location",
                "function": function(){fileBrowse(dir,3,serverProxy.setConfigValues);getNextMenu(this.nextButtons,this.backButton);},
                get nextButtons (){
                  return []
                },
                get backButton (){
                  return [menuStructure._13]
                }
              },
    _134 : {
                "key": "_134",
                "name": "Set Loader Folder Location",
                "function": function(){fileBrowse(dir,4,serverProxy.setConfigValues);getNextMenu(this.nextButtons,this.backButton);},
                get nextButtons (){
                  return []
                },
                get backButton (){
                  return [menuStructure._13]
                }
              },
  }
  //this oughta be broken out into react components but for now it'll do.
  function fileBrowse(directory,doAfterType,doAfter){
      var folder;
      serverProxy.browseListFiles(directory).onReady(function(result){
        fileBrowser = result;
        resetScreen();
        var xmlPlaylistsInFolder = [];
        var selectedFile;
        document.getElementById('screen').insertAdjacentHTML('beforeEnd','<div id="back">Back</div>');
        document.getElementById('back').addEventListener('click',function(e){
                                //"error catching" (read ignoring) done in backend.js, if statement not needed
                                 if(directory.toString() != /*dir.toString()*/undefined){
                                   console.log(directory.toString());
                                   fileBrowse(directory.substring(0, directory.lastIndexOf('/')),doAfterType,doAfter);
                                 }
                               });
         for(var i = 0;i < fileBrowser.length; i++){
           (function(i){
             var j = fileBrowser[i].isDir == true ? 'folder' : 'file';
             document.getElementById('screen').insertAdjacentHTML('beforeEnd','<div id="file-'+i+'" ftype="'+j+'" class="fileBrowse">'+fileBrowser[i].file+'</div>');
             var k = document.getElementById('file-'+i);
             if(j == 'folder'){
               k.addEventListener('click',function(e){
                 console.log('folder',fileBrowser[i].dir+'/'+fileBrowser[i].file);

                 fileBrowse(fileBrowser[i].dir+'/'+fileBrowser[i].file,doAfterType,doAfter);
               });
             }
             else{
               //send to backend to see if playlist already added
               if (fileBrowser[i].file.endsWith('.xml') && doAfterType != 3 && doAfterType != 4){
                 xmlPlaylistsInFolder.push({listIndex:i,fileName:fileBrowser[i].file});
                 k.addEventListener('click',function(e){
                   /*
                   if xml file, show submit button/class toggle (in the future, send to a playlist check function to support more file formats)
                   selected file
                   */
                   //if do after type is ...
                   if(k.getAttribute('reg') == null){
                     [].forEach.call(document.querySelectorAll('sel'), function(el){
                       el.classList.remove('sel');
                     })
                     k.classList.toggle('sel');
                     selFileClassToggle(k.id.split('-')[1]);
                     selectedFile = fileBrowser[i];
                   }
                 });
               }
             }
           }(i));
           folder = fileBrowser[i].dir+'/';
         }

         document.getElementById('screen').insertAdjacentHTML('beforeEnd','<div id="fbSub">Submit</div>');
         var l = document.getElementById('fbSub');
         l.addEventListener('click',function(e){
           switch(doAfterType){
             case 1: // MAY IMPLEMENT DIFFERENTLY - if doAfterType is importItunesPlaylist - function is anon so can't tell from doAfter alone.
               doAfter(selectedFile.dir+'/'+selectedFile.file);
               break;
             case 2:
               if(confirm("Sync iTunes music data (not the tracks themselves) to database? (may take a while)") == true){
                 doAfter(selectedFile.dir+'/'+selectedFile.file);
               }
               break;
             case 3:
               //currently is not checking id DB can accomodate those values first
               if(confirm("Set Music Folder to "+folder+"?") == true){
                 doAfter("MusicDir",folder);
                 resetScreen();
               }
               break;
             case 4:
               //currently is not checking id DB can accomodate those values first
               if(confirm("Set Loader Folder to "+folder+"?") == true){
                 doAfter("LoadDir",folder);
                 resetScreen();
               }
               break;
           }
         });
         serverProxy.checkRegisteredPlaylists(xmlPlaylistsInFolder).onReady(function(result){result.forEach(function(s){
           if(doAfterType == 1){
             document.getElementById('file-'+s.listIndex).setAttribute('reg','true');
           }
          });
         });
        });
      }

  //should be in a separate file, but react calls in here are messing with that, will investigate later.


  function getNextMenu(menu, back){
      var buttons = [];
      var backButton = [];
      if(menu.length > 0){
        for(var i = 0; i < menu.length;i++){
          buttons.push(<MainMenuButton key={"menu-"+i} className="mepButton" {...menu[i]}/>);
        }
      }
      if(back.length > 0){
        backButton.push(<MainMenuButton key={"back"} className="goBack" textName="back" {...back[0]}/>);
      }
      console.log(menu[0],back[0]);
        React.render(
          <div>
            {buttons}

            {backButton}
            <MainMenuButton key={"home"} className="goHome" onclick={toggleKeyboard(true)}textName="home" {...menuStructure._0}/>

          </div>,document.getElementById("main")
        )
    }

  React.render(<Mepso />,document.body);
});


//mdn polyfill

if (!Array.prototype.includes) {
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
