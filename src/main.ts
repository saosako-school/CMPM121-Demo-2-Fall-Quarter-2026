const app = document.querySelector<HTMLElement>("#app")!;

const heading = document.createElement("h1");
heading.textContent = "D2 project";

const message = document.createElement("p");
message.textContent = "Your project starts here.";

const canvas = document.querySelector<HTMLCanvasElement>("#drawingCanvas")!;
const ctx = canvas.getContext("2d")!;

const cursorData = {
  x: 0,
  y: 0,
  down: false,
};

canvas.addEventListener("mousedown", (mouse) => {
  cursorData.x = mouse.offsetX;
  cursorData.y = mouse.offsetY;
  cursorData.down = true;
});
canvas.addEventListener("mousemove", (mouse) => {
  if (cursorData.down) {
    ctx.beginPath();
    ctx.moveTo(cursorData.x, cursorData.y);
    ctx.lineTo(mouse.offsetX, mouse.offsetY);
    ctx.stroke();
    cursorData.x = mouse.offsetX;
    cursorData.y = mouse.offsetY;
  }
});
canvas.addEventListener("mouseout", () => {
  cursorData.down = false;
});
canvas.addEventListener("mouseup", () => {
  cursorData.down = false;
});

app.append(heading, message);
