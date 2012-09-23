/* Demo for class presentation only */
var Tron = {};

function Point(x, y) {
   this.x = Math.floor(x);
   this.y = Math.floor(y);
}

function Player(id, color, x, y, direction) {
   this.id = id;
   this.color = color;
   this.location = new Point(x, y);
   this.dir = direction;
   this.visited = [];
   this.restrict = "";
   
   this.setDirection = function(direction) { this.dir = direction; };
   
   /* draw on the main context */
   this.draw = function(ctx) {
      ctx.save(); 
      ctx.fillStyle = this.color;

      for (var i = 0; i < this.visited.length; i++)
        ctx.fillRect(this.visited[i].x * blocksize, 
                     this.visited[i].y * blocksize, 9, 9);

      ctx.restore();
   };
  
   /* update the location and path of the player */
   this.update = function() {
      var opposite = { 'up' : 'down', 'down' : 'up',
                       'left' : 'right','right' : 'left' };
      // prevent 'reverse' move
      this.dir = (this.dir == this.restrict) ? opposite[this.restrict] : this.dir;
      if (this.dir == "up")     this.location.y -= 1;
      if (this.dir == "down")   this.location.y += 1;
      if (this.dir == "left")   this.location.x -= 1;
      if (this.dir == "right")  this.location.x += 1;
      this.restrict = opposite[this.dir];
      
      var x = this.location.x; 
      var y = this.location.y;
      
      if ( this.checkCollision (x, y) ) {
        gameover = true; 
      } else {
        map[x][y] = this.id;
        this.visited.push(new Point(x, y));
      }
   };

   /* check if coordinate (x, y) is already occupied */
   this.checkCollision = function (x, y) {
      
      // out of bound, hit wall, hit other player, hit itself
      if (x < 0 || x > room_size || y < 0 || y > room_size ||
          map[x][y] != undefined ) 
      { 
        whodie = this.id; 
        return true;
      }
      return false;
   };
}

Tron.game = (function() {
  
  /* initialize the game */
  function init() {
    room_size = 40; 
    blocksize = 10;     // size of each single block pixel in canvas
    canvas_size = blocksize * room_size;

    gameover = false; 
    whodie = 0;
    
    // representation of objects in world map
    wall = 0;
    p1 = 1; 
    p2 = 2;
    
    player1 = new Player(p1, "#EE2C2C", room_size / 4, room_size / 2, "right");
    player2 = new Player(p2, "#1E90FF", 2 * room_size / 3, room_size / 2, "left");
    
    // represent the game world as a 2D array
    map = new Array(room_size);
    for (var i = 0; i < room_size; i++)
       map[i] = new Array(room_size);   

    canvas = document.createElement("canvas");
    canvas.width = canvas_size; 
    canvas.height = canvas_size; 
    document.body.appendChild(canvas);

    ctx = canvas.getContext("2d");

    drawWall();
    attachKeyboard();
    gameLoop();
  }

  function killgame() {
    ctx.save(); 
    ctx.fillStyle = '#000';
    ctx.fillRect(0,0, canvas.width, canvas.height);
    
    ctx.fillStyle = "#FFF";
    ctx.font = "16px Helvetica";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    
    var cx = canvas.width / 2; 
    var cy = canvas.height / 2; 
    
    var txt = "Player " + whodie + " lost";
    txt = new String(txt);     // quick hack as whodie keep updating
    
    ctx.fillText(txt, cx, cy);
    ctx.fillText('Press space to restart', cx, cy + 20);
  }
  
  function attachKeyboard() {    
    
    addEventListener("keydown", function (e) {

      //player 1 (wasd)
      if (e.keyCode == 87)  player1.setDirection("up");
      if (e.keyCode == 83)  player1.setDirection("down");
      if (e.keyCode == 65)  player1.setDirection("left");
      if (e.keyCode == 68)  player1.setDirection("right");

      //player 2 (arrow keys)
      if (e.keyCode == 38)  player2.setDirection("up");
      if (e.keyCode == 40)  player2.setDirection("down");
      if (e.keyCode == 37)  player2.setDirection("left");
      if (e.keyCode == 39)  player2.setDirection("right");

      //space bar to restart
      if (e.keyCode == 32)  restart();
     }, false);
  }
  
  /* restart the game */
  function restart() {
    clearTimeout(timeout);
    document.body.removeChild(canvas);
    // TODO: learn how to deallocate memory
    Tron.game.init();
  }
  
  /* draw the wall */
  function drawWall() {
    ctx.fillStyle = "#FFFFFF";
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#000";

    // x-axis: top and bottom
    for (var x = 0; x < room_size; x++) {
      addWall (x, 0);
      addWall (x, room_size -1);
    }
    // y-axis: left and right
    for (var y = 0; y < room_size; y++) {
      addWall (0, y);
      addWall (room_size - 1, y);
    }

    function addWall(x, y) {
      map[x][y] = wall; // TODO: write test to make sure this logic is right
      ctx.fillRect(x * blocksize, y * blocksize, 9, 9);
    }
  }

  /* Game Engine */
  function gameLoop() {
    
    player1.draw(ctx);
    player2.draw(ctx);
    player1.update();
    player2.update();
    
    if (gameover) 
      killgame();
    else 
      timeout = setTimeout(gameLoop, 100);
  }
  
  return {
    init: init
  };
  
})();

Tron.game.init(); // dispatch the game