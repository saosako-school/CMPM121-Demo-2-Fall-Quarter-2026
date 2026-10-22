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

function drawLine(
  context: CanvasRenderingContext2D,
  line: Line,
) {
  context.moveTo(line.points[0].x, line.points[0].y);
  for (let i = 0; i < line.points.length - 1; ++i) {
    context.beginPath();
    context.moveTo(line.points[i].x, line.points[i].y);
    context.lineTo(line.points[i + 1].x, line.points[i + 1].y);
    context.stroke();
  }
}

function redrawCanvas(
  context: CanvasRenderingContext2D,
  canvasElement: HTMLCanvasElement,
  linesInfo: LinesData,
) {
  context.clearRect(0, 0, canvasElement.width, canvasElement.height);
  for (const line of linesInfo.lines) {
    drawLine(context, line);
  }
}

undoButton.addEventListener("click", () => {
  if (linesData.lines.length > 0) {
    linesData.redoLines.push(linesData.lines.pop()!);
  }
  redrawCanvas(ctx, canvas, linesData);
});

redoButton.addEventListener("click", () => {
  if (linesData.redoLines.length > 0) {
    linesData.lines.push(linesData.redoLines.pop()!);
  }
  redrawCanvas(ctx, canvas, linesData);
});

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
