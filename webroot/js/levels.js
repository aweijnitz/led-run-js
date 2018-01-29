const RED = 0xff0000;
const GREEN = 0x00ff00;
const BLUE = 0x0000ff;
const YELLOW = 0xffff00;
const MILLIS = 1000;

let levels = [
    [
        [RED, 0.1 * MILLIS], [BLUE, 1.9 * MILLIS], [GREEN, 5.8 * MILLIS], [RED, 8.8 * MILLIS]
    ],
    [
        [YELLOW, 0.1 * MILLIS], [BLUE, 1.65 * MILLIS], [BLUE, 3 * MILLIS], [GREEN, 5.8 * MILLIS], [RED, 8.8 * MILLIS]
    ],
    [
        [YELLOW, 0.1 * MILLIS], [YELLOW, 0.95 * MILLIS], [BLUE, 1.85 * MILLIS], [BLUE, 3.1 * MILLIS], [GREEN, 5.8 * MILLIS], [RED, 8.8 * MILLIS]
    ],
    [
        [YELLOW, 0.1 * MILLIS], [YELLOW, 0.95 * MILLIS], [RED, 1.85 * MILLIS], [BLUE, 3.1 * MILLIS], [YELLOW, 5.8 * MILLIS], [RED, 7.5 * MILLIS]
    ]
];

export {RED, GREEN, BLUE, YELLOW, levels};