#MePSo v0.1.0
Follow its development on https://joshuavany.com and read [this](https://joshuavany.com/2016/02/07/assembling-the-player/) to see this software in use.

###What is this?
MePSo (Media Playing Software) is mp3 player software built using Javascript for running on a Raspberry Pi (Although it can be run anything that supports Node).

###Why did you build this?
1. My iPod was getting full, and instead of just buying another iPod I looked into what it would take to build my own MP3 player.
2. I have a bunch of iTunes playlists that I wanted to save and reuse, so I wanted something that would also attempt to match iTunes playlists with their tracks and dump the data into a SQL database.
3. I have some DRM iTunes music from back in the day, so I also wanted the ability to flag those files so I could replace them later (have yet to implement).  
4. DIY mentality/Use for Raspberry Pi/Why not?/Learn Node and React

###What are the requirements to run this?
1. Computer
2. Node v4
3. Browser

###How does the program work?
It's essentially a web server that specializes in serving mp3 data JSON and an HTML page which serves as a UI. There are two folders, Loader and Music. Place the files you want to add to the mp3 player into the Loader folder and they can be synced (registers the files into the database and moves them to the music folder).

Three JavaScript files make up the bulk of the program.

**startMepso.js** serves as an entry point to the program. Running this file starts up a server which connects the user interface to the rest of the program.
Navigate to the project folder, open a terminal, install and run <code>node startMepso.js</code>, then navigate to localhost:8080/mepso.html in a browser to start using the program.

**backend.js** is the program's brains. This file holds all functions for processing data and managing configuration.

**mepsoUI.js** is reponsible for the user interface. Uses React, requires Babel because of ES6.


###API
There are several URL endpoints available to serve or manage data. GET requests return JSON.

**/playlists/ (GET)** - get a list of available playlists

**/playlists/{id}?{querystring} (GET, DELETE, PUT)** - retrieving/creating/editing a specific playlist. Query strings (album, artist, genre) may be appended for more specific results. The MP3 player manages tracks on a playlist basis and all tracks are served from a playlist. Playlists may be generated on the fly: queried tracks (ex: Find all tracks by X artist) are served as a playlist with an id of -1. Use an id of 0 to retrieve all tracks.

The ?tracks query string is used for rearranging playlist track orders. Its value should be a comma-separated list of song ids and is used only for PUT requests.

**/playlist/new (POST)** - creates a new playlist

**/category/{categoryType}?{querystring} (GET)** - retrieve a list of artists/albums/genres.

Category types:
<li>genre - 1</li>
<li>artist - 2</li>
<li>album - 3</li>

Category types are always queried in that order. The category type keeps track of what category is currently being queried, and the querystring adds the previous information.
The UI, for example, uses this when the user is navigating the 'by genre'/'by artist'/'by album' menus.
If a user browsed by genre and selected one, a list of artists would return from /category/2?genre=somegenre



###Bugs/issues
<li>The program uses web technologies, but in is current state is not meant to be used online. There are no security measures in place and the program is vulnerable to SQL injection.</li>
<li>Some music file names with punctuation or foreign characters may not handle well and the program will be unable to find them.</li>
<li>When naming a new playlist, the first on-screen keyboard button press will not register.</li>
<li>Playlists can not have zero entries, thus newly created playlists start with one track.</li>
<li>The edit playlist functionality is wonky and confusing at best.</li>
<li>There are certainly more bugs, but these are the one I remember off the top.</li>
###Future feature to-do/wishlist
<li>Flag/replace M4P files</li>
<li>Shuffle</li>
<li>Online safe</li>
<li>Audio EQ</li>
<li>Google Play/Spotify/Apple Music/{insert streaming service} integration</li>
