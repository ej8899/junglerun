//
// Get the canvas element and its 2d context
//
const canvas = document.getElementById("gameCanvas");
const c = canvas.getContext("2d");

//
// Game state & necessary globals
//
let isGameOver = false;
const gravity = 0.5;

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
  constructor() {
    this.x = canvas.width;
    this.y = canvas.height - 30;
    this.width = 30;
    this.height = 30;
    this.color = "#F00";
    this.speed = 4;
  }
  draw() {
    c.fillStyle = obstacle.color;
    c.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
  }
  update() {
    this.draw();
  }
};

const obstacle = new Obstacle();

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

// Update game state
function update() {
  if (isGameOver) {
    return; // Stop updating if the game is over
  }
  // Move obstacle
  obstacle.x -= obstacle.speed;

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

    // Draw player
    player.update();

    // Draw obstacle
    obstacle.update();

    platform.draw();
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
