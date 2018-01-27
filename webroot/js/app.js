//(function (window, document, PIXI) {

// Game constants
//

const NR_GAME_PIXELS = 1000;

const PLAYER_SEGMENTS = 3; // works as number of lives
const PIXELS_PER_SEGMENT = 5; // In game pixels (model pixels)

// Viewport
const VIEW_WIDTH = 300;
const VIEW_HEIGHT = 600;
const VIEW_PIXEL_RADIUS = 3;
const VIEW_TO_MODEL_RATIO = VIEW_HEIGHT / NR_GAME_PIXELS; // Gives the number of view pixels per game pixel


// START MODEL
//

let playerSpeed = -1 * (NR_GAME_PIXELS * 0.05); // Model pixels per second
let enemySpeed = (NR_GAME_PIXELS * 0.045); // Model pixels per second
//let ledStrip = makeStrip(NR_GAME_PIXELS);
let player = makePlayer(PLAYER_SEGMENTS, PIXELS_PER_SEGMENT);
let elapsedLevelTimeMS = 0;
let currentLevel = 0;
let nextEnemy = 0;
let enemiesInFlight = []; // array of arrays. [color, pos, speed]

function updateModel(dt) {
    // dt is the elapsedMS since last call

    elapsedLevelTimeMS += dt;

    updateEnemies(dt, elapsedLevelTimeMS);
    updatePlayer(dt);


}

function updatePlayer(dt) {
    dt = dt / 1000; // convert ms to seconds
    let ds = playerSpeed * dt;

    player.forEach(p => {
        p[0] += ds;
        //p[1] = animateColor(p[1], dt);
        //if(p[0] < 1)
        //  console.log('LEVEL COMPLETE');
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
    if (nextEnemy < levels[currentLevel].length && elapsedLevelTimeMS > levels[currentLevel][nextEnemy][1]) {
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
    console.log('ENEMY ENTERED')
}

function makeGamePixel(pos, color) {
    return [pos, color];
}

function makeStrip(nrPixels) {
    let ledStrip = [];
    for (let i = 0; i < nrPixels; i++) {
        ledStrip[i] = makeGamePixel(i, 0x000033);
    }
}

function makePlayer(segments, nrPixelsPerSegment) {
    let playerArray = [];
    let color = 0xaa0000;
    let index = 0;
    for (let i = 0; i < segments; i++) {
        for (let j = 0; j < nrPixelsPerSegment; j++) {
            playerArray[index++] = makeGamePixel(index, color);
        }
    }
    return playerArray.reverse();
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
    console.log('UP');
};

down.press = () => {
    console.log('DOWN');
};

key_w.press = () => {
    console.log('UP');
};

key_s.press = () => {
    console.log('DOWN');
};

space.press = () => {
    console.log('SPACE');
};


document.getElementById('viewport').appendChild(app.view);


let state;
let viewportPlayerArray;
let viewportEnemiesOnStage = [];


// SETUP
//

function setup() {
    //Set the game state
    state = play;

    drawVerticalStrip(app, VIEW_WIDTH >> 1, VIEW_PIXEL_RADIUS, VIEW_HEIGHT);
    viewportPlayerArray = toViewportPlayer(app, player);

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
    modelToViewUpdatePlayer(player, viewportPlayerArray);
    modelToViewUpdateEnemies(enemiesInFlight);
    viewportPlayerArray.forEach((item, i) => {

        if (item.y < 10)
            app.stop();
    });

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

    let devicePixelsPerModelPixel = Math.floor(VIEW_TO_MODEL_RATIO);
    if (devicePixelsPerModelPixel < 1) devicePixelsPerModelPixel = 1;
    let r = VIEW_PIXEL_RADIUS * devicePixelsPerModelPixel;
    let spacer = 1.2 * devicePixelsPerModelPixel;

    console.log('devicePixelsPerModelPixel ', devicePixelsPerModelPixel);


    for (let i = 0; i < 3; i++) {
        let circle = new PIXI.Graphics();
        circle.beginFill(color);
        circle.drawCircle(0, 0, r);
        circle.endFill();
        circle.x = VIEW_WIDTH >> 1;
        circle.y = -1 * (2 * r * spacer * i) * devicePixelsPerModelPixel;
        //console.log('segment ', -1 * (2 * r * spacer * i));
        enemyPixels.push(circle);
        app.stage.addChild(circle);
    }
    viewportEnemiesOnStage.push(enemyPixels);
    return enemyPixels;
}

function modelToViewUpdateEnemies(enemiesInFlight) {
    let devicePixelsPerModelPixel = Math.floor(VIEW_TO_MODEL_RATIO);
    if (devicePixelsPerModelPixel < 1) devicePixelsPerModelPixel = 1;

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

function toViewportPlayer(app, playerGamePixels) {
    let playerViewportPixles = [];

    let devicePixelsPerModelPixel = Math.floor(VIEW_TO_MODEL_RATIO);
    if (devicePixelsPerModelPixel < 1) devicePixelsPerModelPixel = 1;
    let r = VIEW_PIXEL_RADIUS * devicePixelsPerModelPixel;
    let spacer = 1.2 * devicePixelsPerModelPixel;

    console.log('devicePixelsPerModelPixel ', devicePixelsPerModelPixel);


    for (let i = 0; i < playerGamePixels.length; i++) {
        let circle = new PIXI.Graphics();
        // console.log('push', i);
        i === 0 ?
            circle.beginFill(0xffee00) : circle.beginFill(playerGamePixels[i][1]);
        circle.drawCircle(0, 0, r);
        circle.endFill();
        circle.x = VIEW_WIDTH >> 1;
        circle.y = VIEW_HEIGHT - (2 * r * spacer * i);
        playerViewportPixles.push(circle);
        app.stage.addChild(circle);
    }

    return playerViewportPixles.reverse();
}

function modelToViewUpdatePlayer(player, playerGamePixels) {

    let devicePixelsPerModelPixel = Math.floor(VIEW_TO_MODEL_RATIO);
    if (devicePixelsPerModelPixel < 1) devicePixelsPerModelPixel = 1;

    let spacer = 1.2 * devicePixelsPerModelPixel;
    let r = VIEW_PIXEL_RADIUS;

    for (let i = 0; i < player.length; i++) {
        let circle = playerGamePixels[i];
        circle.y = player[i][0] + VIEW_HEIGHT - (2 * r * spacer * i);
    }
}

setup();

//})(window, document, PIXI);
