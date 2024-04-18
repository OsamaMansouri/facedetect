const socket = io();
const video = document.getElementById("camera");
const overlay = document.getElementById("overlay");
const takeScreenshotButton = document.getElementById("takeScreenshotButton");

// Function to initialize the camera stream
const initCamera = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
    video.play();
    takeScreenshotButton.disabled = false; // Enable the button after camera initialization

    // Load Face-api.js models
    await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
    await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
    await faceapi.nets.faceRecognitionNet.loadFromUri("/models");
    await faceapi.nets.faceExpressionNet.loadFromUri("/models");

    // Start face detection
    detectFaces();
  } catch (error) {
    console.error("Error accessing camera:", error);
  }
};

// Function to detect faces in real-time
const detectFaces = async () => {
  const displaySize = { width: video.width, height: video.height };
  faceapi.matchDimensions(overlay, displaySize);

  setInterval(async () => {
    const detections = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions();
    const resizedDetections = faceapi.resizeResults(detections, displaySize);

    // Clear previous drawings
    const context = overlay.getContext("2d");
    context.clearRect(0, 0, overlay.width, overlay.height);

    // Draw face bounding boxes
    faceapi.draw.drawDetections(overlay, resizedDetections);
    faceapi.draw.drawFaceLandmarks(overlay, resizedDetections);
    faceapi.draw.drawFaceExpressions(overlay, resizedDetections);
  }, 100); // Adjust detection frequency as needed
};

// Call the function to initialize the camera stream
initCamera();

// Function to take a screenshot
//const takeScreenshot = () => {
// const canvas = document.createElement("canvas");
//const context = canvas.getContext("2d");
//canvas.width = video.videoWidth;
//canvas.height = video.videoHeight;
//context.drawImage(video, 0, 0, canvas.width, canvas.height);
//const screenshotData = canvas.toDataURL("image/jpeg");
//socket.emit("takeScreenshot", screenshotData);
//};

// Function to take a screenshot
const takeScreenshot = async () => {
  try {
    const detections = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptors();

    if (detections.length > 0) {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      const displaySize = {
        width: video.videoWidth,
        height: video.videoHeight,
      };
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const face = detections[0].detection.box;
      const faceCanvas = document.createElement("canvas");
      const faceContext = faceCanvas.getContext("2d");

      faceCanvas.width = face.width;
      faceCanvas.height = face.height;

      faceContext.drawImage(
        canvas,
        face.x,
        face.y,
        face.width,
        face.height,
        0,
        0,
        face.width,
        face.height
      );

      const screenshotData = faceCanvas.toDataURL("image/jpeg");
      socket.emit("takeScreenshot", screenshotData);
    }
  } catch (error) {
    console.error("Error capturing screenshot:", error);
  }
};

// Event listener for the screenshot button
takeScreenshotButton.addEventListener("click", () => {
  takeScreenshot();
});

// Listen for screenshot event from the server
socket.on("screenshot", (screenshotPath) => {
  const screenshotImg = document.createElement("img");
  screenshotImg.src = screenshotPath;
  document.body.appendChild(screenshotImg);
});
