// Imports


//
// Get the canvas element and its 2d context
//
const canvas = document.getElementById("gameCanvas");
const c = canvas.getContext("2d");

//
// Game state & necessary globals
//
let isGameOver = false;
let score = 0;
const gravity = 0.5;

const pixelFont = new FontFace('PixelFont', 'url(./PressStart2P-vaV7.ttf)');
pixelFont.load().then((font) => {
  document.fonts.add(font);
});


//
// sprites
//
const signRight = new Image();
signRight.src = './sprites/pointer-right.png';

const coinSheet = new Image();
coinSheet.src = './sprites/Coin.png';
const coinSprite = {
  x: 0, // Starting X-coordinate of the first frame
  y: 0, // Starting Y-coordinate of the first frame
  width: 10, // Width of each frame
  height: 10, // Height of each frame
  currentFrame: 0, // The current frame index
  active: false, // You can include other properties based on your needs
};
const coinFrames = [
  { x:  0, y: 0, width: 10, height: 10 },
  { x: 10, y: 0, width: 10, height: 10 },
  { x: 20, y: 0, width: 10, height: 10 },
  { x: 30, y: 0, width: 10, height: 10 },
];

// Player object
class Player  {
    constructor() {
      this.position = {
        x: 150,
        y: 100,
      };
      this.velocity = {
        x: 0,
        y: 0,
      }
      this.width = 30;
      this.height = 30;
      this.color = "#00F";
      this.speed = 5;
      this.jumpHeight = 120;
      this.jumpSpeed = 6;
      this.isJumping = false;
      this.jumpStartY = 0;
      this.gravity = gravity;
    }
    draw() {
      c.fillStyle = this.color;
      c.fillRect(this.position.x, this.position.y, this.width, this.height);
    }
    update() {
      this.position.y += this.velocity.y;
      
      if (this.position.y + this.height >= canvas.height) {
        this.position.y = canvas.height - this.height;
        this.isJumping = false;
        this.gravity = 0;
        this.velocity.y = 0;
    } else {
        this.velocity.y += gravity;
    }
      this.draw();
    }
};

const player = new Player();

// Obstacle object
class Obstacle {
  constructor(x,y,width = 30,height = 30,speed = 4,color = '#F00') {
    this.x = canvas.width;
    this.y = canvas.height - 30;
    this.width = width;
    this.height = height;
    this.color = color;
    this.speed = speed;
  }
  draw() {
    c.fillStyle = this.color;
    c.fillRect(this.x, this.y, this.width, this.height);
    // c.drawImage();
  }
  update() {
    this.draw();
  }
};

const obstacle = new Obstacle();

class CollectibleObstacle extends Obstacle {
  constructor(x, y, width, height, sprite, speed, points) {
    super(x, y, width, height, speed, "#FFD700");
    this.points = points;
    this.sprite = sprite;
    this.frameCounter = 0;
  }

  draw() {
    const frameIndex = Math.floor(Date.now() / 150) % coinFrames.length;
    c.drawImage(
      coinSheet,
      coinFrames[frameIndex].x,
      coinFrames[frameIndex].y,
      coinFrames[frameIndex].width,
      coinFrames[frameIndex].height,      
      this.x,
      this.y,
      this.width *2.5,
      this.height *2.5
    );
  }

  update(frameDelay = 0) {
    this.x -= this.speed;

    // Check if the obstacle has moved off-screen, reset its position
    if (this.x <= -this.width) {
      this.x = canvas.width;
      this.y = Math.random() * (canvas.height - this.height);
    }
    //this.sprite.currentFrame = (this.sprite.currentFrame + 1) % coinFrames.length;
    this.frameCounter = (this.frameCounter + 1) % (coinFrames.length * frameDelay);

    if (this.frameCounter % frameDelay === 0) {
      this.sprite.currentFrame = (this.sprite.currentFrame + 1) % coinFrames.length;
    }
  }
}
// const treasureItem = new CollectibleObstacle(700, canvas.height - 50, 30, 30, '#FFD700', 2, 10);
//const treasureItem = new CollectibleObstacle(100, 100, 30, 30, '#FFD700', 2, 10);
const treasureItem = new CollectibleObstacle(700, 50, 10, 10, coinSprite, 2, 10);
const treasures = [];

class Platform {
  constructor() {
    this.position = {
      x: 200,
      y: 100,
    }
    this.width = 200;
    this.height = 20;
  }
  draw() {
    c.fillStyle = 'green';
    c.fillRect(this.position.x, this.position.y, this.width, this.height);
  }
}
const platform = new Platform();

function createImage(imageSource) {
  const image = new Image();
  image.src = imageSource
  return image;
}

class Background {
  constructor(imgSrc, speed, scale) {
    this.img = new Image();
    this.img.src = imgSrc;
    this.speed = speed;
    this.scale = scale;
    this.x = 0;
    this.y = 0;
    this.width = canvas.width * this.scale;
    this.height = canvas.height;
  }

  draw() {
    c.drawImage(this.img, this.x, this.y, this.width, this.height);
    c.drawImage(this.img, this.x + this.width, this.y, this.width, this.height);
  }

  update() {
    this.x -= this.speed;

    // Check if the image has moved off-screen, reset its position
    if (this.x <= -this.width) {
      this.x = 0;
    }
  }
}
const backgroundLayers = [ 
  new Background('./images/plx-1.png', 0.0, 1.5),
  new Background('./images/plx-2.png', 0.2, 1.5),
  new Background('./images/plx-3.png', 0.4, 1.5),
  new Background('./images/plx-4.png', 0.6, 1.5),
  new Background('./images/plx-5.png', 0.9, 1.5)
];


class ScrollingItem {
  constructor(image, speed, y) {
    if (!y) {
      this.y = Math.random() * (canvas.height - this.height);
    } else this.y = y;
    this.image = image;
    this.width = 40; // Adjust the width as needed
    this.height = 40; // Adjust the height as needed
    this.x = canvas.width; // Start off-screen to the right
    this.speed = speed;
  }

  draw() {
    c.drawImage(this.image, this.x, this.y, this.width, this.height);
  }

  update(y) {
    this.x -= this.speed;

    // Check if the item has moved off-screen, reset its position
    if (this.x <= -this.width) {
      this.x = canvas.width;
      if (!y) {
        this.y = Math.random() * (canvas.height - this.height);
      } else this.y = y;
    }
  }
}
const scrollingItem = new ScrollingItem(signRight, 2, canvas.height-39);


//
// Event listeners
//
addEventListener("keydown", (e) => {
  if ((e.key === "D" || e.key === 'd') && player.position.x + player.width < canvas.width) {
    // RIGHT (D)
      player.position.x += player.speed;
  } else if ((e.key === "A" || e.key == 'a') && player.position.x > 0) {
      // LEFT (A)
      player.position.x -= player.speed;
  } else if ((e.key === 'W' || e.key ==='w') && !player.isJumping) {
      // W pressed and player is not currently jumping
      player.isJumping = true;
      player.jumpStartY = player.position.y;
      player.velocity.y = -player.jumpSpeed;
  } else if ((e.key === 'S' || e.key ==='s')) {
    // S key press
    // boost perhaps?
  } else if ((e.key === 'X' || e.key === 'x')) {
    // TODO quit game
  }
});
addEventListener("keyup", (e) => {
  if ((e.key === "D" || e.key === 'd') && player.position.x + player.width < canvas.width) {
    // RIGHT (D)
      //player.position.x += player.speed;
  } else if ((e.key === "A" || e.key == 'a') && player.position.x > 0) {
      // LEFT (A)
      //player.position.x -= player.speed;
  } else if ((e.key === 'W' || e.key ==='w') && !player.isJumping) {
      // W pressed and player is not currently jumping
      player.isJumping = false;
      player.velocity.y = 0;
  } else if ((e.key === 'S' || e.key ==='s')) {
    // S key press
    // boost perhaps?
  } else if ((e.key === 'X' || e.key === 'x')) {
    // TODO quit game
  }
});

function updateScore() {
  if (isGameOver) return;
  score += 0.01;
  c.fillStyle = "white";
  c.font = "20px PixelFont";
  c.fillText("Score: " + parseInt(score), 10, 30);
}

//
// Update game state
//
function update() {
  if (isGameOver) {
    return; // Stop updating if the game is over
  }
  // Move obstacle
  obstacle.x -= obstacle.speed;
  treasureItem.update(5);

  // Check for collision with player
  if (
    player.position.x < obstacle.x + obstacle.width &&
    player.position.x + player.width > obstacle.x &&
    player.position.y < obstacle.y + obstacle.height &&
    player.position.y + player.height > obstacle.y
) {
    // Player hit by obstacle, game over
    isGameOver = true;
    console.log("Game Over");
    return;
}

  // Player jump
  if (player.isJumping) {
    // Apply gravity to the jump
    player.position.y -= player.jumpSpeed;

    // Check if the player has reached the jump height
    if (player.position.y <= player.jumpStartY - player.jumpHeight || player.position.y >= canvas.height - player.height) {
        player.isJumping = false;
    }
    } else if (player.position.y < canvas.height - player.height) {
        // Player is in the air, apply gravity
        player.position.y += player.gravity;
        // Increase the gravity to make the fall faster than the jump
        player.gravity += gravity;

        // Check if player is back on the ground
        if (player.position.y >= canvas.height - player.height) {
            player.position.y = canvas.height - player.height;
            player.gravity = gravity; // Reset gravity when landing
            player.velocity.y = 0;
            player.isJumping = false;
        }
    }

    // Check for collision with player
    if (
        player.position.x < obstacle.x + obstacle.width &&
        player.position.x + player.width > obstacle.x &&
        player.position.y < obstacle.y + obstacle.height &&
        player.position.y + player.height > obstacle.y
    ) {
        // Collision detected, reset the obstacle position
        obstacle.x = canvas.width;
    }

    // Check if obstacle moved offscreen, reset its position
    if (obstacle.x + obstacle.width < 0) {
        obstacle.x = canvas.width;
    }


    // Check for collision with player for collectible items
    for (let i = treasures.length - 1; i >= 0; i--) {
      treasures[i].update(10);
  
      if (
        player.position.x < treasures[i].x + treasures[i].width &&
        player.position.x + player.width > treasures[i].x &&
        player.position.y < treasures[i].y + treasures[i].height &&
        player.position.y + player.height > treasures[i].y
      ) {
        // Player collects the treasure, add points or perform other actions
        score += 1;
        treasures.splice(i, 1); // Remove collected treasure from the array
      }
    }
  
    // add coins
    if (Math.random() < 0.02) {
      const newTreasure = new CollectibleObstacle(
        canvas.width,
        Math.random() * (canvas.height - treasureItem.height),
        10,
        10,
        coinSprite,
        2,
        10
      );
      treasures.push(newTreasure);
    }


    // platform handler
    if (player.position.y + player.height <= platform.position.y) {
      player.isJumping = false;
      player.gravity = 0;
    }
}

//
// Draw everything
//
function draw() {
    // Clear the canvas
    c.clearRect(0, 0, canvas.width, canvas.height);

    backgroundLayers.forEach(background => {
      background.update();
      background.draw();
    });

    // Draw player
    player.update();

    // Draw obstacle
    obstacle.update();


    treasures.forEach((treasure) => {
      treasure.draw();
    });

    platform.draw();

    scrollingItem.update(canvas.height-39);
    scrollingItem.draw();

    updateScore();
}


//
// Game loop
//
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

//
// Start the game loop
//
gameLoop();
