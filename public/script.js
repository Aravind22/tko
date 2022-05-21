const socket = io('/') // Create our socket
const videoGrid = document.getElementById('video-grid') // Find the Video-Grid element

const myPeer = new Peer() // Creating a peer element which represents the current user
const myVideo = document.createElement('video')
myVideo.setAttribute("id", "myVideoID") // Create a new video tag to show our video
myVideo.muted = true // Mute ourselves on our end so there is no feedback loop
// Access the user's video and audio
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    addVideoStream(myVideo, stream) // Display our video to ourselves
    setTimeout(renderFrame, 1000 / 5)
    myPeer.on('call', call => { // When we join someone's room we will receive a call from them
        call.answer(stream) // Stream them our video/audio
        const video = document.createElement('video') // Create a video tag for them
        call.on('stream', userVideoStream => { // When we recieve their stream
            addVideoStream(video, userVideoStream) // Display their video to ourselves
        })
    })

    socket.on('user-connected', userId => { // If a new user connect
        connectToNewUser(userId, stream)
    })
})


myPeer.on('open', id => { // When we first open the app, have us join a room
    socket.emit('join-room', ROOM_ID, id)
})

function connectToNewUser(userId, stream) { // This runs when someone joins our room
    const call = myPeer.call(userId, stream) // Call the user who just joined
    // Add their video
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
    })
    // If they leave, remove their video
    call.on('close', () => {
        video.remove()
    })
}


function addVideoStream(video, stream) {
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => { // Play the video as it loads
        video.play()
    })
    videoGrid.append(video) // Append video element to videoGrid
}

var isMouseDown = false;
// var body = document.getElementsByTagName("body")[0];
var linesArray = [];
currentSize = 5;
var currentColor = "rgb(200,20,100)";
var currentBg = "black";

var canvas = document.getElementById('myCanvas');
var ctx = canvas.getContext('2d');
// canvas.width = parseInt(document.getElementById("sizeX").value);
// canvas.height = parseInt(document.getElementById("sizeY").value);
canvas.style.zIndex = 8;
canvas.style.position = "absolute";
canvas.style.border = "1px solid";
ctx.fillStyle = currentBg;
ctx.fillRect(0, 0, canvas.width, canvas.height);


function renderFrame() {
    video = myVideo;
    // re-register callback
    // requestAnimationFrame(renderFrame);
    // set internal canvas size to match HTML element size
    canvas.width = canvas.scrollWidth;
    canvas.height = canvas.scrollHeight;
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
        // scale and horizontally center the camera image
        var videoSize = { width: video.videoWidth, height: video.videoHeight };
        var canvasSize = { width: canvas.width, height: canvas.height };
        var renderSize = calculateSize(videoSize, canvasSize);
        var xOffset = (canvasSize.width - renderSize.width) / 2;
        ctx.drawImage(video, 0, 0, renderSize.width, renderSize.height);

        // var currentPosition = getMousePos(canvas, evt);
        // ctx.lineTo(currentPosition.x, currentPosition.y)
        // ctx.stroke();

        var faceArea = 500;
        var pX = canvas.width / 2 - faceArea / 2;
        var pY = canvas.height / 2 - faceArea / 2;

        ctx.rect(pX, pY, faceArea, faceArea);
        ctx.lineWidth = "6";
        ctx.strokeStyle = "red";
        ctx.stroke();


        setTimeout(renderFrame, 1000/5);
        
    }
}


canvas.addEventListener('mousedown', function () { mousedown(canvas, event); });
canvas.addEventListener('mousemove', function () { mousemove(canvas, event); });
canvas.addEventListener('mouseup', mouseup);

function calculateSize(srcSize, dstSize) {
    var srcRatio = srcSize.width / srcSize.height;
    var dstRatio = dstSize.width / dstSize.height;
    if (dstRatio > srcRatio) {
        return {
            width: dstSize.height * srcRatio,
            height: dstSize.height
        };
    } else {
        return {
            width: dstSize.width,
            height: dstSize.width / srcRatio
        };
    }
}

function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}

// ON MOUSE DOWN

function mousedown(canvas, evt) {
    var mousePos = getMousePos(canvas, evt);
    isMouseDown = true
    var currentPosition = getMousePos(canvas, evt);
    ctx.moveTo(currentPosition.x, currentPosition.y)
    ctx.beginPath();
    ctx.lineWidth = currentSize;
    ctx.lineCap = "round";
    ctx.strokeStyle = currentColor;

}

// ON MOUSE MOVE

function mousemove(canvas, evt) {
    if (isMouseDown) {
        var currentPosition = getMousePos(canvas, evt);
        ctx.lineTo(currentPosition.x, currentPosition.y)
        ctx.stroke();
    }
}

// ON MOUSE UP

function mouseup() {
    isMouseDown = false
}