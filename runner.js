var gameStarted = false;
var showScore = false;
var highscore = 0;
var increasespeed = 0;
var checkspeed = 1;
var count = 1;
var floordepth = 140;
var ceildepth = 140;
var hasplayed = false;
mySound = document.getElementById("myaudio");
mySound.muted = false;
myfallSound = document.getElementById("mybump");
myfallSound.muted = false;
myfallSound.loop = false;
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
  function playGame(){
      document.getElementById("playButton").style.display="none"; 
      gameStarted = true;
      showScore = true;
      update();
    }
   function floor(x, width,height) {
      this.x = x;
      this.width = width;
      this.height = height;
    }
    function ceil(x, width,height) {
      this.x = x;
      this.width = width;
      this.height = height;
    }
    var world = {
      height: 480,
      width: 640,
      gravity: 10,
      speed: 5,
      highestGap: 150,
      highestceilGap:100,
      randomceilWidth:700,
      randomWidth: 700,
      autoScroll: true,
      floorTiles: [
        new floor(0,600,floordepth)
      ], 
      ceilTiles: [
        new ceil(0,1000,ceildepth)
      ],
      start: function() {
         this.end= window.setTimeout("update()", 1000/60);
      },
     stop: function() {
       this.autoScroll = false;
       player.scroll = false;
       showScore = false;
       topscorer(player.distanceTravelled);
       //stopfallsound();
       clearTimeout(this.end);
       document.getElementById("gameEnd").style.display="block";  
       document.getElementById("retryButton").style.display="block"; 
     },
      
      moveFloor: function() {
       for(index in this.floorTiles) {
          var tile = this.floorTiles[index];
          if (Math.floor(player.distanceTravelled/5000) > increasespeed){
             ++increasespeed;
             ++this.speed;
           } 
            tile.x += -this.speed;
       }
      },
       moveCeil : function() {
         for(index in this.ceilTiles) {
          var tile = this.ceilTiles[index];
          if (Math.floor(player.distanceTravelled/5000) > increasespeed){
             ++increasespeed;
             ++this.speed;
           } 
           tile.x += -this.speed;
        } 
      },
      addFutureTiles: function() {
        var previousTile = this.floorTiles[this.floorTiles.length - 1];
        var randomGap = Math.floor(Math.random() * (this.highestGap)) + 40;
        var leftValue = (previousTile.x + previousTile.width);
        var gapcheck = leftValue+randomGap;
          
        var previousceilTile = this.ceilTiles[this.ceilTiles.length - 1];
        var randomceilGap = Math.floor(Math.random() * this.highestceilGap) + 40;
        var leftceilValue = (previousceilTile.x + previousceilTile.width);
        var gapceilcheck = leftceilValue+randomceilGap;
        if ((leftceilValue >=leftValue ) && ((leftceilValue-leftValue)<=gapcheck+100) && (leftceilValue <= gapcheck)) {
          randomceilGap = 0;
           }
        if ((leftValue >= leftceilValue) && ((leftValue -leftceilValue)<= gapceilcheck+100) &&(leftValue <= gapceilcheck) ) {
          randomGap = 0;
         }
        var next = new floor(leftValue+randomGap,this.randomWidth,floordepth);
        this.floorTiles.push(next);
        var ceilnext = new ceil(leftceilValue+randomceilGap, this.randomceilWidth,ceildepth);
        this.ceilTiles.push(ceilnext);
      },
      
      cleanOldTiles: function() {
        for(index in this.floorTiles) {
          if(this.floorTiles[index].x <= -this.floorTiles[index].width) {
            this.floorTiles.splice(index, 1);
          }
        }
        for(index in this.ceilTiles) {
          if(this.ceilTiles[index].x <= -this.ceilTiles[index].width) {
            this.ceilTiles.splice(index, 1);
          }
        }
      },
      getDistanceToFloor: function(playerX) {
        for(index in this.floorTiles) {
          var tile = this.floorTiles[index];
          if(tile.x <= playerX && tile.x + tile.width >= playerX) {
            return tile.height;
          }
        }
        return -1;
      },
      
      getDistanceToCeil: function(playerX) {
        for(index in this.ceilTiles) {
          var tile = this.ceilTiles[index];
          if(tile.x <= playerX && tile.x + tile.width >= playerX) {
            return tile.height;
          }
        }
        return -1;
      },
      
      update: function() {
        if(!this.autoScroll) {
          return;
        }
        this.cleanOldTiles();
        this.addFutureTiles();
        this.moveFloor();
        this.moveCeil();
        },
       
      draw: function() {
        ctx.fillStyle = "black";
        ctx.fillRect (0, 0, this.width, this.height);
        for(index in this.floorTiles) {
          var tile = this.floorTiles[index];
          var y = world.height - tile.height;
          ctx.fillStyle = "khaki";
          ctx.fillRect(tile.x, y, tile.width, tile.height);
        }
         for(index in this.ceilTiles) {
          var tile = this.ceilTiles[index];
          var y = 0;
          ctx.fillStyle = "khaki";
          ctx.fillRect(tile.x, y, tile.width, tile.height);
        }
     },
    };
   
    var player = {
      height: 30,
      width: 30,
      x: 50,
      y: world.height - floordepth, 
      scroll: true,
      speed: 10,
      distanceTravelled: 0,
      getDistanceFor: function(x) {
      if(this.y>=(world.height - floordepth)) {
        var platform = world.getDistanceToFloor(x);
        return world.height - this.y - platform;
       }
       if(this.y<=(ceildepth+this.height)) {
         var platform = world.getDistanceToCeil(x);
         return this.y- platform-this.height;
       }  
      },
  
      applyGravity: function() {
        this.currentDistanceAboveplatform = this.getDistanceFor(this.x);
        var rightHandSideDistance = this.getDistanceFor(this.x + this.width);
        if(showScore) {
        this.distanceTravelled += player.speed;
        }
        if(this.y>=(world.height - floordepth)) {
          if(this.currentDistanceAboveplatform > 0 || rightHandSideDistance < 0)          {
           playfallsound(); 
           world.stop();
          }  
        }
        if(this.y<=(ceildepth+this.height)) {
           if(this.currentDistanceAboveplatform > 0 || rightHandSideDistance < 0)         {
               clear();
               playfallsound(); 
               world.stop();
           }  
        }
      },
      
      processGravity: function() {
        if(this.y>=(world.height - floordepth)) {
        this.y += world.gravity;
        var floorHeight = world.getDistanceToFloor(this.x, this.width);
        var topYofPlatform = world.height - floorHeight;
        if(this.y > topYofPlatform) {
          this.y = topYofPlatform;
        }
      }
       if(this.y<=ceildepth) {
        this.y -= world.gravity;
       var floorHeight = world.getDistanceToCeil(this.x, this.width);
        var topYofPlatform = floorHeight;
        if(this.y < topYofPlatform) {
          this.y = (topYofPlatform + this.height);
        }
       }  
      },

      update: function() {
        this.processGravity();
        this.applyGravity();
      },
      
     jump: function() {
     if(gameStarted) {
     if (player.scroll) {
       rotateRect();  
     if (count % 2 == 0) {
       player.x = player.x;
       player.y = (world.height - floordepth);
        rotateRect(); 
       count=count+1;
      }
     else  {
       player.x = player.x;
       player.y = ceildepth;
        rotateRect(); 
       count=count+1;
      }
    }
   }
   },

    score: function() {
        ctx.fillStyle = "red";
        ctx.font = "bolder 18px Lucida Handwriting";
        ctx.fillText("your score : " + (this.distanceTravelled ), 10, 75);
        ctx.fillText("Top score  : " + localStorage.getItem("bestscore"), 10, 45);
        ctx.fillText("Speed      : " + world.speed, 10, 105);
      },
      
      draw: function() {
        ctx.fillStyle = "red";
        ctx.fillRect(player.x, player.y - player.height, this.height, this.width);
      },
   
};
document.addEventListener('keydown', (e) => {
    if (e.code === "Space") {
         player.jump();
    }
  }); 

function topscorer(currentscore) {   
  highscore = localStorage.getItem("bestscore");
  if (currentscore >highscore) {    localStorage.setItem("bestscore",currentscore);
                   
        
    }
  }

function rotateRect() {
            ctx.save();
            ctx.translate(player.x+ player.width / 2 , player.y + player.height / 2 );
            ctx.rotate(Math.PI/4);
            ctx.fillStyle = 'red';
            ctx.fillRect(player.width / -2, player.height / -2, player.width, player.height);
            ctx.restore();
        }
 
function clear()
{
  player.x=player.x;
  player.y=player.height;
 }

function playsound() {
  mySound.play();
}

function stopsound() {
  mySound.muted = true;
}

function playfallsound() {
 if(!hasplayed) {
   mySound.muted = true;
   myfallSound.play();
   hasplayed =true;
}
}

function stopfallsound() {
  myfallSound.muted = true;
}

 function update() {
   if(localStorage.getItem("bestscore")==null) {   
           localStorage.setItem("bestscore",0);
   }
    world.draw();
    player.draw();
    player.score();
    if (gameStarted) {
     playsound();   
     player.update();
     world.update();
     world.start();
    } 
 }
update();


 