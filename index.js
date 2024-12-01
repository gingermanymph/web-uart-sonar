let width;
let height;
let scale = 2;
let maxDepth = 300;
let minDepth = 300;
let lengthOfHistoryData = 5;
let last_data = Array(lengthOfHistoryData);
let performanceTime;

last_data = [200, 200, 300, 400, 450];
function test() {
    for (let i = 0; i < last_data.length; i++) {
        if (Math.floor(Math.random() * 2)) {
            if (i == 0 || i == 2) {
                last_data[i] = last_data[i] + (Math.random() * 1);
            } else {
                last_data[i] = last_data[i] + (Math.random() * 2);
            }
        } else {
            if (i == 0 || i == 2) {
                last_data[i] = last_data[i] - (Math.random() * 1);
            } else {
                last_data[i] = last_data[i] - (Math.random() * 2);
            }
        }
    }
}
let basementSize = 500;
let step = 5;
let lineWidth = 1;
let lineHeight = 1;
let coefficients;
let imgData;
let getImagePixel = 1;
let lefthShift = 45;

let realDataTimer;
let demoTimer;

let toMilimeters = 1000; // to mm

let options;
// document.querySelectorAll('[id=theme]>option')[1].selected
const theme = document.getElementById('theme');
theme.addEventListener('change', e => {
    options = [...e.target.getElementsByTagName('option')];
    options.forEach(e => {
        if (e.selected) {
            switch (e.value) {
                case 'default':
                    canvas.setAttribute('style', 'filter:none;');
                    break;
                case 'dark':
                    canvas.setAttribute('style', 'filter:invert(1);');
                    break;
                case 'sepia':
                    canvas.setAttribute('style', 'filter:sepia(1)');
                    break;
                default: console.log('No cases');
            }

        }
    });
})

const demoLabel = document.getElementById('demoLabel');
const splitter = document.getElementById('splitter');


const maxDepthValue = document.getElementById('maxDepthValue');
maxDepthValue.addEventListener('change', e => {
    maxDepth = Number(maxDepthValue.value * toMilimeters);
})

const zeroValue = document.getElementById('zeroValue');
// zeroValue.addEventListener('click', e => {});
const showLines = document.getElementById('showLines');
// showLines.addEventListener('click', e => {});
const showBottom = document.getElementById('showBottom');
// showBottom.addEventListener('click', e => {});
const depthRange = document.getElementById('depthRange');
depthRange.addEventListener('click', e => {
    maxDepthValue.disabled = !maxDepthValue.disabled;
});

const levelTableCells = document.querySelectorAll('[id=tableLevle] > span');

const canvas = document.getElementById('plotCanvas');
const ctx = canvas.getContext('2d');

// const map = document.getElementById('maps');

function setSize() {
    width = canvas.width = Math.round(innerWidth);
    height = canvas.height = Math.round(innerHeight); // - 50
    ctx.fillStyle = "rgb(255, 255, 255)";
    ctx.fillRect(0, 0, width, height);
}

// Drawing part

function setCurrentLevelPosition(x, y, data) {
    let currentLevel = document.getElementById('currentLevel');
    currentLevel.setAttribute('style', `top: ${Math.round(x + 25)}px; left: ${y - 20}px; color:red;`);
    currentLevel.innerText = data / 100;
}

function setTableLevelPosition(width, height) {
    splitter.setAttribute('style', `left: ${width - lefthShift}px; height:${height}px`);
    const couner = 10;
    let step = height / couner;
    let levels = (maxDepth / couner) / toMilimeters; // Deviding by 1000 converts mm to meters
    let level = 0;
    let position = 0;
    for (let i = 0; i < levelTableCells.length; i++) {
        let currentCell = levelTableCells[i];
        let cellHeight = currentCell.clientHeight;
        let cellWidth = currentCell.clientWidth;
        currentCell.innerText = `${level.toFixed(2)}m-`;
        currentCell.setAttribute('style', `top: ${position + cellHeight}px; left: ${width - cellWidth}px;`);
        level += levels
        position += step;
    }
}

function getCoefficients(distances) {
    // Calculate the coefficients of difference
    return distances.map((value, index, array) => {
        const check = e => {
            if (isNaN(e)) return 0
            if (e === Infinity || e === -Infinity) return 0
            if (e >= 0) return e
        }
        if (index !== array.length - 1) {
            let absoluteDifference = Math.abs(array[index + 1] - value);
            return check(absoluteDifference / value)
        } else if (index === array.length - 1 && index > 0) {
            // Compare the last element to the penultimate element
            let absoluteDifference = Math.abs(value - array[index - 1]);
            return check(absoluteDifference / value);
        }
        return 0; // Default value for the first element
    });
}

function drawPlot() {
    let length = last_data.length;
    let currentMaxDepth = Math.max(...last_data);
    let currentMinDepth = Math.min(...last_data);
    let depthPosition;

    coefficients = getCoefficients(last_data);
    if (currentMaxDepth >= maxDepth) {
        maxDepth = currentMaxDepth + basementSize;
        maxDepthValue.value = maxDepth / toMilimeters;
    }
    // TODO: fix auto scale
    // else if (currentMinDepth > minDepth) {
    //     maxDepth = currentMinDepth + basementSize;
    // }
    // or 
    else if (currentMaxDepth < minDepth) {
        maxDepth = minDepth + basementSize;
        maxDepthValue.value = maxDepth / toMilimeters;
    }

    setTableLevelPosition(width, height);

    imgData = ctx.getImageData(getImagePixel, 0, width - lefthShift, height);
    ctx.fillStyle = "rgb(255, 255, 255)";
    ctx.fillRect(0, 0, width, height);
    ctx.putImageData(imgData, 0, 0);

    for (let i = 0; i < length; i++) {
        depthPosition = height / (maxDepth / last_data[i]);

        let valueInCm = Math.floor(last_data[i] / 10);
        appendToOutput(valueInCm); // Debug output 

        if (showBottom.checked) {
            // Draw bottom layer based on max depth as Rect
            if (last_data[i] === currentMaxDepth) {
                setCurrentLevelPosition(depthPosition, width, valueInCm);
                ctx.fillStyle = `hsla(${250 + (coefficients[i]) * 10},80%, 55%, 0.5)`;
                ctx.fillRect(width - lefthShift, depthPosition, lefthShift, height - depthPosition);
            }
            // Draw bottom layer based on max depth as Pixels
            // if (last_data[i] === currentMaxDepth) {
            //     for (let i = Math.round(depthPosition); i <= height; i += 2) {
            //         ctx.beginPath();
            //         ctx.lineWidth = 1;
            //         ctx.strokeStyle = `hsla(${250 + (i / 100)}, 80%, 50%, ${0.5 - (i / toMilimeters)})`;
            //         ctx.moveTo(width - lefthShift, i);
            //         ctx.lineTo(width - lefthShift, i + 1);
            //         ctx.stroke();
            //     }
            // }
        }

        if (showLines.checked) {
            if (last_data[i] === currentMaxDepth) {
                ctx.strokeStyle = 'red';
                lineHeightForLast = lineHeight * 2;
                ctx.lineWidth = lineWidth * 2;
            } else {
                ctx.strokeStyle = `hsla(${250 + (coefficients[i]) * 10}, 100%, 50%, 1)`;
                lineHeightForLast = lineHeight;
                ctx.lineWidth = lineWidth;
            }

            ctx.beginPath();
            ctx.moveTo(width - lefthShift, depthPosition);
            ctx.lineTo(width, depthPosition);
            ctx.stroke();
        }
    }
}

// Communication part
async function connectSerial() {
    try {
        let port;
        port = await navigator.serial.requestPort();
        await port.open({ baudRate: 9600 });
        const reader = port.readable.getReader();

        if (demoTimer) {
            // Turn off demo
            stopDrawing(demoTimer);
            last_data = Array(lengthOfHistoryData);
            ctx.clearRect(1, 0, canvas.width, canvas.height);
            demoLabel.style = 'display:none'
            runDrawing(realDataTimer);
        }

        // This array collects bytes for construction single packet. For some reasone data is received from 1 to 4 bytes
        var array_data = [];
        // In format 0xff 0xAA 0xBB 0x00 where 0x00 is a check sum of 0xAA & 0xBB 

        // Main loop for reading data from sensor
        while (true) {
            const { value, done } = await reader.read();
            if (done) break;

            const hexData = Array.from(value, byte => '0x' + byte.toString(16).padStart(2, '0'));
            array_data = array_data.concat(hexData);

            // Length must be 4 bytes
            if (array_data.length == 4) {
                if (array_data[0] != '0xff') { continue }
                // If the packet starts with 0xFF don't leave this loop
                const msb = Number(array_data[1]);
                const lsb = Number(array_data[2]);
                const checksum = Number(array_data[3]);

                // Check if checksum is correct
                if (((msb + lsb) - 1) === checksum) {
                    // Convert to human-readable value
                    const value = (msb * 256) + lsb;
                    // shifting from left to right coz drawing loop starts from 0
                    last_data.unshift(value);
                    last_data.pop()
                } else {
                    // Check if checksum is incorrect in cases:
                    // 1. The signal is lost because the trip is longer than the max range (600 cm in air)
                    // 2. The signal is lost because the distance is less than the min range (~20-22 cm in air)
                    const value = (msb * 256) + lsb;
                    console.warn(`MIN/MAX distance error: CS=${value} != ${checksum}, data=${array_data}`);
                    if (!zeroValue.checked) {
                        last_data.push(value);
                        last_data.shift();
                    }
                }
                array_data = [];
            }
        }
    } catch (error) {
        console.error('Error connecting to serial device:', error);
    }
}

// Helpers part
function appendToOutput(data) {
    const level = document.getElementById('level');
    level.innerText = data + 'cm';
}

function runDrawing(timer, isDemo = false) {
    timer = setInterval(() => {
        drawPlot();
        if (isDemo) { test(); }
    }, 100);

    if (isDemo) {
        demoTimer = timer;
    } else {
        realDataTimer = timer;
    }
}

function stopDrawing(timer) {
    clearInterval(timer);
}

document.getElementById('startButton').addEventListener('click', connectSerial);

setSize();
// Run Demo drawing
runDrawing(demoTimer, true);