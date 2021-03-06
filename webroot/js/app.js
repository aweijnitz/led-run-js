//(function (window, document, PIXI) {

// Game constants
//

import {RED, GREEN, BLUE, YELLOW, levels} from './levels.js';
import keyboard from './keyboardHandler';

const NR_GAME_PIXELS = 1000;

const PLAYER_SEGMENTS = 3; // works as number of lives
const PIXELS_PER_SEGMENT = 3; // In game pixels (model pixels)

// Viewport
const VIEW_WIDTH = 300;
const VIEW_HEIGHT = 600;
const VIEW_PIXEL_RADIUS = 4;
const VIEW_TO_MODEL_RATIO = VIEW_HEIGHT / NR_GAME_PIXELS; // Gives the number of view pixels per game pixel

let state;
let viewportPlayerArray;
let viewportEnemiesOnStage = [];


// START MODEL
//

let playerSpeed = -1 * (NR_GAME_PIXELS * 0.06); // Model pixels per second
let enemySpeed = (NR_GAME_PIXELS * 0.045); // Model pixels per second
//let ledStrip = makeStrip(NR_GAME_PIXELS);
let player = initializePlayer(PLAYER_SEGMENTS, PIXELS_PER_SEGMENT);
const playerColors = [RED, GREEN, BLUE, YELLOW];
let currentPlayerColor = 0;

let elapsedLevelTimeMS = 0;
let currentLevel = 0;
let nextEnemy = 0;
let enemiesInFlight = []; // array of arrays. [color, pos, speed]
let collidedEnemies = []; // Player and an enemy can only collide once. This prevents double collisions
let isGameOver = false;


function updateModel(dt) {
    // dt is the elapsedMS since last call

    elapsedLevelTimeMS += dt;

    updateEnemies(dt, elapsedLevelTimeMS);
    updatePlayer(dt);

    // Check collisions
    enemiesInFlight.forEach((enemy, index) => {
        if (isCollision(player, enemy, index) && playerColors[currentPlayerColor] != enemy[0]) {
            if (!removeSegment(player))
                isGameOver = gameOver();
        }
    });

    // Check level completed
    if (!isGameOver && player[0][0] <= 10)
        levelComplete(currentLevel);

}

function gameOver() {
    app.stop();
    console.log('GAME OVER');

    enemiesInFlight = [];

    return true;
}

function levelComplete(level) {
    console.log('LEVEL COMPLETE');

    app.stop();
    clearView();

    playerSpeed *= 1.2;
    elapsedLevelTimeMS = 0;
    currentPlayerColor = 0;
    player = initializePlayer(PLAYER_SEGMENTS, PIXELS_PER_SEGMENT);
    enemiesInFlight = [];
    collidedEnemies = [];
    nextEnemy = 0;
    currentLevel++;
    if(currentLevel >= levels.length) {
        isGameOver = gameOver();
        app.stop();
        console.log('GAME COMPLETED! GAME OVER');
    }
    viewportPlayerArray = renderPlayerFirstTime(app, player);
    viewportEnemiesOnStage = [];
    app.start();
}

function updatePlayer(dt) {
    dt = dt / 1000; // convert ms to seconds
    let ds = playerSpeed * dt;

    player.forEach(p => {
        p[0] += ds;
        //p[1] = animateColor(p[1], dt);
    });
}

function updateEnemies(dt, elapsedLevelTimeMS) {

    // Move on-screen enemies
    //
    dt = dt / 1000; // convert ms to seconds
    let ds = playerSpeed * dt;
    enemiesInFlight.forEach(enemy => { // [color, pos, speed]
        enemy[1] += enemy[2] * dt;
    });

    // Check if new enemies should enter the stage
    //

    // Note the order of the comparison is significant here, in order to prevent array-out-of-bounds
    if (!isGameOver && nextEnemy < levels[currentLevel].length && elapsedLevelTimeMS > levels[currentLevel][nextEnemy][1]) {
        console.log('LAUNCH ENEMY ' + nextEnemy, levels[currentLevel][nextEnemy]);
        // MODEL
        addEnemyInFlight(levels[currentLevel][nextEnemy]);
        // VIEW
        addEnemyToStage(levels[currentLevel][nextEnemy]);

        nextEnemy++;
    }
}

function addEnemyInFlight(enemy) {
    let startPos = 0;
    enemiesInFlight.push([enemy[0], startPos, enemySpeed]);
    console.log('ENEMY ENTERED ', enemy[0].toString(16));
}

function makeGamePixel(pos, color) {
    return [pos, color];
}


function isCollision(player, enemy, enemyIndex) {
    //console.log('isCollision ', player, enemy, enemyIndex);
    let result = false;
    let threshold = 1;

    if (collidedEnemies.indexOf(enemyIndex) >= 0 || player.length == 0) return false;

    if (Math.abs(player[0][0] - enemy[1]) < threshold) {
        collidedEnemies.push(enemyIndex);
        result = true;
    }
    //console.log('diff: ', Math.abs(player[0][0] - enemy[1]));

    return result;
}

// Returns false if the last segment was removed (game over)
function removeSegment(player) {
    let result = true;

    for (let i = 0; i < PIXELS_PER_SEGMENT; i++)
        player.pop();

    if (player.length <= 0)
        result = false;

    return result;

}

function initializePlayer(segments, pixelsPerSegment) {
    let playerArray = [];
    let color = 0xaa0000;
    let index = 0;
    for (let i = 0; i < segments; i++) {
        for (let j = 0; j < pixelsPerSegment; j++) {
            console.log(NR_GAME_PIXELS - i);
            playerArray[index] = makeGamePixel(NR_GAME_PIXELS - index, color);
            index++;
        }
    }
    return playerArray.reverse();
}

function increasePlayerColor() {
    currentPlayerColor = (++currentPlayerColor) % playerColors.length;
}

function decreasePlayerColor() {
    currentPlayerColor--;
    if (currentPlayerColor < 0)
        currentPlayerColor += playerColors.length;
}

// END MODEL


const app = new PIXI.Application({
    width: VIEW_WIDTH,
    height: VIEW_HEIGHT,
    antialias: true,
    resolution: 1
});

// Keyboard inputs
//
let key_w = keyboard(87); // See https://help.adobe.com/en_US/AS2LCR/Flash_10.0/help.html?content=00000520.html
let key_s = keyboard(83);
let space = keyboard(32);
//Capture the keyboard arrow keys
let left = keyboard(37),
    up = keyboard(38),
    right = keyboard(39),
    down = keyboard(40);

up.press = () => {
    increasePlayerColor();
};

down.press = () => {
    decreasePlayerColor();
};

key_w.press = () => {
    increasePlayerColor();
};

key_s.press = () => {
    decreasePlayerColor();
};

space.press = () => {
    console.log('SPACE');
};


document.getElementById('viewport').appendChild(app.view);


// SETUP
//

function setup() {
    //Set the game state
    state = play;

    drawVerticalStrip(app, VIEW_WIDTH >> 1, VIEW_PIXEL_RADIUS, VIEW_HEIGHT);
    viewportPlayerArray = renderPlayerFirstTime(app, player);

    //Start the game loop
    app.ticker.add(delta => gameLoop(delta));

    console.log('Setup complete');
}

function gameLoop(delta) {

    state(delta);
}


function play(delta) {

    // UPDATE STATE
    //
    updateModel(app.ticker.elapsedMS);

    // DRAW
    //
    trimPlayerSegments(player); // Update view, based on model changes
    renderPlayer(player, viewportPlayerArray);
    renderEnemies(enemiesInFlight);

}

function clearView() {
    viewportPlayerArray.forEach((item) => {
        app.stage.removeChild(item);
    });

    viewportEnemiesOnStage.forEach(enemy => {
        enemy.forEach(circle => {
            app.stage.removeChild(circle);
        })
    })
}

function trimPlayerSegments(player) {

    let diff = viewportPlayerArray.length - player.length;
    for (let i = 0; i < diff; i++) {
        app.stage.removeChild(viewportPlayerArray.pop());
    }
}

function drawVerticalStrip(app, middleX, width, height) {
    let color = 0x9a9a9a;

    let devicePixelsPerModelPixel = Math.floor(VIEW_TO_MODEL_RATIO);
    if (devicePixelsPerModelPixel < 1) devicePixelsPerModelPixel = 1;
    width = width * devicePixelsPerModelPixel;

    let lineWidth = 0.5 * devicePixelsPerModelPixel;
    let alpha = 1;

    let line = new PIXI.Graphics();
    line.lineStyle(lineWidth, color, alpha);
    line.moveTo(0, 0);
    line.lineTo(0, height);
    line.x = middleX - (width >> 1);
    line.y = 0;
    app.stage.addChild(line);

    line = new PIXI.Graphics();
    line.lineStyle(lineWidth, color, alpha);
    line.moveTo(0, 0);
    line.lineTo(0, height);
    line.x = middleX + (width >> 1);
    line.y = 0;
    app.stage.addChild(line);
}

// enemy -> [RED, 1.0 * MILLIS]
function addEnemyToStage(enemy) {
    let enemyPixels = [];
    let color = enemy[0];

    let devicePixelsPerModelPixel = VIEW_TO_MODEL_RATIO;
    let r = VIEW_PIXEL_RADIUS;
    let spacer = 1.2 * devicePixelsPerModelPixel;

    for (let i = 0; i < 3; i++) {
        let circle = new PIXI.Graphics();
        i === 0 ?
            circle.beginFill(lighter(color, 0.45)) : circle.beginFill(color);
        circle.drawCircle(0, 0, r);
        circle.endFill();
        circle.x = VIEW_WIDTH >> 1;
        circle.y = -1 * (2 * r * spacer * i) * devicePixelsPerModelPixel;
        enemyPixels.push(circle);
    }

    enemyPixels = enemyPixels.reverse();
    enemyPixels.forEach(p => {
        app.stage.addChild(p);
    });
    viewportEnemiesOnStage.push(enemyPixels);
    return enemyPixels;
}

function renderEnemies(enemiesInFlight) {
    let devicePixelsPerModelPixel = VIEW_TO_MODEL_RATIO;
//    if (devicePixelsPerModelPixel < 1) devicePixelsPerModelPixel = 1;

    let spacer = 1.2 * devicePixelsPerModelPixel;
    let r = VIEW_PIXEL_RADIUS;

    enemiesInFlight.forEach((modelEnemy, i) => {
        let viewEnemy = viewportEnemiesOnStage[i];
        viewEnemy.forEach((circle, j) => {
            circle.y = modelEnemy[1] * devicePixelsPerModelPixel + (2 * r * spacer * j);
            //console.log(viewEnemy[1]);
        });
    });

}

function renderPlayerFirstTime(app, playerGamePixels) {
    let playerViewportPixles = [];

    let devicePixelsPerModelPixel = VIEW_TO_MODEL_RATIO;
    let r = VIEW_PIXEL_RADIUS;
    let spacer = 1.2 * devicePixelsPerModelPixel;

    console.log('devicePixelsPerModelPixel ', devicePixelsPerModelPixel);

    for (let i = 0; i < playerGamePixels.length; i++) {
        let circle = new PIXI.Graphics();
        let color = playerGamePixels[i][1];

        i === 0 ?
            circle.beginFill(lighter(color, 0.65)) : circle.beginFill(color);
        circle.drawCircle(0, 0, r);
        circle.endFill();
        circle.x = VIEW_WIDTH >> 1;
        circle.y = (2 * r * spacer * i) + (playerGamePixels[i][0] * devicePixelsPerModelPixel);
        playerViewportPixles.push(circle);
        app.stage.addChild(circle);
    }
    console.log('renderFirstTime ', playerViewportPixles[0].y);
    return playerViewportPixles;
}


function renderPlayer(player, viewportPlayerArray) {

    let devicePixelsPerModelPixel = VIEW_TO_MODEL_RATIO;

    let spacer = 1.2 * devicePixelsPerModelPixel;
    let r = VIEW_PIXEL_RADIUS;

    for (let i = 0; i < player.length; i++) {
        let circle = viewportPlayerArray[i];
        circle.y = (2 * r * spacer * i) + (player[i][0] * devicePixelsPerModelPixel);

        i === 0 ?
            circle.beginFill(lighter(playerColors[currentPlayerColor], 0.65)) : circle.beginFill(playerColors[currentPlayerColor]);
        circle.drawCircle(0, 0, r);
        circle.endFill();
    }
}

function lighter(color, tintFactor) {
    let R = (color & 0xff0000) >> 16;
    let G = (color & 0x00ff00) >> 8;
    let B = color & 0x0000ff;

    let newR = R + (0xff - R) * tintFactor;
    let newG = G + (0xff - G) * tintFactor;
    let newB = B + (0xff - B) * tintFactor;

    return (newR << 16) | (newG << 8) | newB;
}

function darker(color, shadeFactor) {

    let R = (color & 0xff0000) >> 16;
    let G = (color & 0x00ff00) >> 8;
    let B = color & 0x0000ff;

    let newR = R * (1 - shadeFactor);
    let newG = G * (1 - shadeFactor);
    let newB = B * (1 - shadeFactor);

    return (newR << 16) | (newG << 8) | newB;
}

setup();

//})(window, document, PIXI);
