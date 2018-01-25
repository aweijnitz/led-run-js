(function (window, document, PIXI) {

    // Game constants
    //

    const NR_GAME_PIXELS = 512;
    const DEVICE_PIXELS_PER_GAME_PIXEL = 5;

    const PLAYER_SEGMENTS = 3; // works as number of lives
    const PIXELS_PER_SEGMENT = 1; // In game pixels (model pixels)


    // START MODEL
    //

    let ledStrip = makeStrip(NR_GAME_PIXELS);
    let player = makePlayer(PLAYER_SEGMENTS, PIXELS_PER_SEGMENT);

    function makeGamePixel(pos, color) {
        return [pos, color];
    }

    function makeStrip(nrPixels) {
        let ledStrip = [];
        for(let i = 0; i < nrPixels; i++) {
            ledStrip[i] = makeGamePixel(i, 0x000033);
        }
    }

    function makePlayer(segments, nrPixelsPerSegment) {
        let playerArray = [];
        let color = 0xaa0000;
        let index = 0;
        for(let i = 0; i < segments; i++) {
            for(let j = 0; j < nrPixelsPerSegment; j++) {
                playerArray[index++] = makeGamePixel(index, color);
            }
        }
        return playerArray;
    }

    // END MODEL

    // Viewport
    const VIEW_WIDTH = 300;
    const VIEW_HEIGHT = 600;
    const VIEW_PIXEL_RADIUS = 2;


    const app = new PIXI.Application({
        width: VIEW_WIDTH,
        height: VIEW_HEIGHT,
        antialias: true,
        resolution: 1
    });

    // Keyboard inputs
    //
    let key_w = keyboard(119); // See https://help.adobe.com/en_US/AS2LCR/Flash_10.0/help.html?content=00000520.html
    let key_s = keyboard(115);
    let space = keyboard(32);
    //Capture the keyboard arrow keys
    let left = keyboard(37),
        up = keyboard(38),
        right = keyboard(39),
        down = keyboard(40);

    document.getElementById('viewport').appendChild(app.view);


    let state;
    let viewportPlayerArray;

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

        //Update the current game state:
        state(delta);
    }

    function play(delta) {

    }


    function drawVerticalStrip(app, middleX, width, height) {
        let color = 0x9a9a9a;
        let lineWidth = 0.5;
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


    function toViewportPlayer(app, playerGamePixels) {
        let playerViewportPixles = [];
        let r = VIEW_PIXEL_RADIUS;

        for (let i = 0; i < playerGamePixels.length * DEVICE_PIXELS_PER_GAME_PIXEL; i++) {
            let circle = new PIXI.Graphics();
            circle.beginFill(0xaa0000); // playerGamePixels[i][1]
            circle.drawCircle(0, 0, r);
            circle.endFill();
            circle.x = VIEW_WIDTH >> 1;
            circle.y = VIEW_HEIGHT - (2*r * i);
            playerViewportPixles.push(circle);
            app.stage.addChild(circle);
        }

        return playerViewportPixles;
    }

    setup();

})(window, document, PIXI);
