//Implementing functionality to search by artist
var path = require('path');
var assert = require('assert');
//var should = require('chai').should();
//win friendly?
var sandbox = require(path.resolve(__dirname,'sandbox.js'));
var pmpBackend = path.join(path.resolve(__dirname,'..'),'backend.js');
var backend = require(pmpBackend);
var playlistInfo;
//./node_modules/mocha/bin/mocha tests




describe('make sure we are using the test database\n\n',function(){
  /*  before(function(done){
      backend.checkForOrCreateConfig(backend.getConfigValues);
      done();
    });*/
    var oldDbSetting;
    before(function(done){
      backend.readDB(function(result){
        //so we can put this back later
        oldDbSetting = result;
        console.log('oldDbSetting',oldDbSetting);
      });
      backend.setDB(path.join('tests','test.db'),function(result){
        assert(result == path.join('tests','test.db'));
        done();
      });
    });

    describe('database switch functionality: \n  backend.readDB/setDB', function(){
      it('prove we are in the testdb',function(done){
        backend.testDBFunction(function(result){
          assert(result == 'TEST');
          done();
        });
      });
      it('should switch to the normal db',function(done){
        backend.setDB(oldDbSetting,function(result){
          assert(result == (oldDbSetting));
          done();
        });
      });
      /* it('prove we are NOT in the testdb',function(done){
        backend.testDBFunction(function(result){
          assert(result == null);
          done();
        });
      }); */ //only works when data is in the music db
    });
  describe('working with custom playlists/category searches: \n  backend.getByUnique:',function(){
    var theProdigyCount = 0;
    it('should be bringing back only distinct results', function(done){
      backend.getByUnique('2','genre=Electronic', function(results){
        for(var i = 0; i < results.length; i++){
          //if 'The Prodigy' is found, increment
          if(results[i] == 'The Prodigy'){
            theProdigyCount++;
          }
        }
        done();
        assert(theProdigyCount == 1);
      });
    });
    it('retest with a null additional parameter', function(done){
      backend.getByUnique('2',null, function(results){
        for(var i = 0; i < results.length; i++){
          //if 'The Prodigy' is found, increment
          if(results[i] == 'The Prodigy'){
            theProdigyCount++;
          }
        }
        done();
        assert(theProdigyCount == 2);
      });
    });
    /*it('should callback an array of results as long as null is not passed in',function(done){
      backend.getByUnique('1',null,function(results){
        //console.log(results);
        assert(results.length > 0);
        assert(typeof results == 'object');
        done();
      });
    });*/ //only works when data is in the music db
    it('should otherwise return a string',function(done){
      backend.getByUnique(undefined,null,function(results){
        //console.log(results);
        assert(typeof results == 'string');
        done();
      });
    });
  });

  describe('building custom/queried playlists on the fly: \n  backend.buildCatPlaylist:',function(){
    it('should callback an array',function(done){
      backend.buildCatPlaylist('genre=electronic',function(results){
        //console.log('r',results);
        assert(typeof results == 'string');
        done();
      });
    });
  });

  describe('  Search By Artist Functionality: \n  backend.getPlaylistAjax',function(){
    it('should bring back a playlist to work with',function(done){
      backend.getPlaylistAJAX(0,null,function(result){
        playlistInfo = JSON.stringify(result[0],null,3);
        done();
        assert(playlistInfo.Name == 'All Tracks');
        assert(playlistInfo.length > 0);//proves we've got a playlist to work with
      });
    });
  });
});
