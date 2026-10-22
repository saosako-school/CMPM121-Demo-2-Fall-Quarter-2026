const app = document.querySelector<HTMLElement>("#app")!;

const heading = document.createElement("h1");
heading.textContent = "D2 project";

const message = document.createElement("p");
message.textContent = "Your project starts here.";

const canvas = document.createElement("canvas");
canvas.width = 500;
canvas.height = 500;
canvas.style = "border: 2px solid black";
app.append(canvas);

const ctx = canvas.getContext("2d")!;

const buttonContainer = document.createElement("div");
app.append(buttonContainer);

const undoButton = document.createElement("button");
undoButton.textContent = "undo";
app.append(undoButton);

const redoButton = document.createElement("button");
redoButton.textContent = "redo";
app.append(redoButton);

interface CursorData {
  x: number;
  y: number;
  down: boolean;
}

interface Point {
  x: number;
  y: number;
}

interface Line {
  points: Point[];
}

interface LinesData {
  numLines: number;
  lines: Line[];
  redoLines: Line[];
}

const cursorData: CursorData = {
  x: 0,
  y: 0,
  down: false,
};

const linesData: LinesData = {
  numLines: 0,
  lines: [],
  redoLines: [],
};

let currentLine: Line | null = null;

canvas.addEventListener("mousedown", (mouse) => {
  cursorData.x = mouse.offsetX;
  cursorData.y = mouse.offsetY;
  currentLine = {
    points: [],
  };
  linesData.lines.push(currentLine);
  currentLine.points.push({ x: cursorData.x, y: cursorData.y });
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
    currentLine!.points.push({ x: cursorData.x, y: cursorData.y });
  }
});
canvas.addEventListener("mouseout", () => {
  cursorData.down = false;
  currentLine = null;
});
canvas.addEventListener("mouseup", () => {
  cursorData.down = false;
  currentLine = null;
});

app.append(heading, message);
