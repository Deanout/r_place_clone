import { Controller } from "@hotwired/stimulus";

const PIXEL_SIZE = 10; // Here's our new constant for pixel size.
const CANVAS_WIDTH = 1000;
const CANVAS_HEIGHT = 300;

// Let's define a utility function to extract x and y from the event.
function extractCoordinates(canvas, event) {
  let rect = canvas.getBoundingClientRect();
  let x = Math.floor((event.clientX - rect.left) / PIXEL_SIZE);
  let y = Math.floor((event.clientY - rect.top) / PIXEL_SIZE);
  return { x, y };
}

// Connects to data-controller="pixels"
export default class extends Controller {
  static targets = ["background", "canvas", "color"];
  connect() {
    this.ctx = this.backgroundTarget.getContext("2d");
    this.previewCtx = this.canvasTarget.getContext("2d");

    this.resizeCanvas();
    this.loadPixels();
    this.loadColor();
    document.addEventListener("pixelReceived", (event) =>
      this.drawPixel(event.detail)
    );
  }

  resizeCanvas() {
    // Set both canvas dimensions
    [this.canvasTarget, this.backgroundTarget].forEach((canvas) => {
      canvas.width = CANVAS_WIDTH; // Set width
      canvas.height = CANVAS_HEIGHT; // Set height
    });
  }

  loadColor() {
    this.currentColor = this.colorTarget.value;
  }

  loadPixels() {
    fetch("/pixels")
      .then((response) => response.json())
      .then((data) => data.forEach((pixel) => this.drawPixel(pixel)));
  }

  drawPixel({ x, y, color }) {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x * PIXEL_SIZE, y * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
  }

  mouseMove(event) {
    let { x, y } = extractCoordinates(this.canvasTarget, event);
    this.drawPreviewPixel(x, y, this.currentColor);
  }

  drawPreviewPixel(x, y, color) {
    this.previewCtx.clearRect(
      0,
      0,
      this.canvasTarget.width,
      this.canvasTarget.height
    );
    this.previewCtx.globalAlpha = 0.5;
    this.previewCtx.fillStyle = color;
    this.previewCtx.fillRect(
      x * PIXEL_SIZE,
      y * PIXEL_SIZE,
      PIXEL_SIZE,
      PIXEL_SIZE
    );
    this.previewCtx.globalAlpha = 1.0;
  }

  placePixel(event) {
    let { x, y } = extractCoordinates(this.canvasTarget, event);
    this.sendPixelData(x, y, this.currentColor);
  }

  sendPixelData(x, y, color) {
    const pixelData = {
      pixel: { x, y, color },
    };

    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": document.querySelector('[name="csrf-token"]').content,
      },
      body: JSON.stringify(pixelData),
    };

    fetch("/pixels", requestOptions)
      .then((response) => response.json())
      .then((data) => this.drawPixel(data));
  }
}
