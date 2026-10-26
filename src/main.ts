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

interface Point {
  x: number;
  y: number;
}

interface CursorData {
  position: Point;
  down: boolean;
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
  position: { x: 0, y: 0 },
  down: false,
};

const linesData: LinesData = {
  numLines: 0,
  lines: [],
  redoLines: [],
};

let currentLine: Line | null = null;

function getMouseEventPoint(mouse: MouseEvent): Point {
  return { x: mouse.offsetX, y: mouse.offsetY };
}

function getLinePoint(line: Line, index: number): Point {
  return { x: line.points[index].x, y: line.points[index].y };
}
//function updateCursorPos(cursor: CursorData, newPos: Point) {
//  cursor.position.x = newPos.x;
//  cursor.position.y = newPos.y;
//}

function startNewLine(
  linesInfo: LinesData,
  cursorInfo: CursorData,
  mouse: MouseEvent,
) {
  linesInfo.redoLines.splice(
    0,
    linesInfo.redoLines.length,
  );
  cursorInfo.position = getMouseEventPoint(mouse);
  currentLine = {
    points: [],
  };
  linesInfo.lines.push(currentLine);
  currentLine.points.push({
    x: cursorInfo.position.x,
    y: cursorInfo.position.y,
  });
  cursorInfo.down = true;
}

function continueNewLine(
  cursorInfo: CursorData,
  context: CanvasRenderingContext2D,
  mouse: MouseEvent,
  newLine: Line,
) {
  if (cursorInfo.down) {
    context.beginPath();
    //ctx.moveTo(cursorData.position.x, cursorData.position.y);
    //ctx.lineTo(mouse.offsetX, mouse.offsetY);
    //ctx.stroke();
    drawLineSegment(context, cursorInfo.position, getMouseEventPoint(mouse));
    cursorInfo.position = getMouseEventPoint(mouse);
    //cursorData.x = mouse.offsetX;
    //cursorData.y = mouse.offsetY;
    newLine!.points.push({
      x: cursorInfo.position.x,
      y: cursorInfo.position.y,
    });
  }
}

function endNewLine(cursorInfo: CursorData) {
  cursorInfo.down = false;
  currentLine = null; // couldn't figure out a better way to do this, sorry
}

function drawLineSegment(
  context: CanvasRenderingContext2D,
  start: Point,
  end: Point,
) {
  context.moveTo(start.x, start.y);
  context.lineTo(end.x, end.y);
  context.stroke();
}

function drawLine(
  context: CanvasRenderingContext2D,
  line: Line,
) {
  context.moveTo(line.points[0].x, line.points[0].y);
  for (let i = 0; i < line.points.length - 1; ++i) {
    context.beginPath();
    drawLineSegment(context, getLinePoint(line, i), getLinePoint(line, i + 1));
    //context.moveTo(line.points[i].x, line.points[i].y);
    //context.lineTo(line.points[i + 1].x, line.points[i + 1].y);
    //context.stroke();
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
  startNewLine(linesData, cursorData, mouse);
  /*linesData.redoLines.splice(
    0,
    linesData.redoLines.length,
  );
  cursorData.position = getMouseEventPoint(mouse);
  currentLine = {
    points: [],
  };
  linesData.lines.push(currentLine);
  currentLine.points.push({
    x: cursorData.position.x,
    y: cursorData.position.y,
  });
  cursorData.down = true;*/
});

canvas.addEventListener("mousemove", (mouse) => {
  continueNewLine(cursorData, ctx, mouse, currentLine!);
  /*if (cursorData.down) {
    ctx.beginPath();
    //ctx.moveTo(cursorData.position.x, cursorData.position.y);
    //ctx.lineTo(mouse.offsetX, mouse.offsetY);
    //ctx.stroke();
    drawLineSegment(ctx, cursorData.position, getMouseEventPoint(mouse));
    cursorData.position = getMouseEventPoint(mouse);
    //cursorData.x = mouse.offsetX;
    //cursorData.y = mouse.offsetY;
    currentLine!.points.push({
      x: cursorData.position.x,
      y: cursorData.position.y,
    });
  }*/
});

canvas.addEventListener("mouseout", () => {
  //cursorData.down = false;
  //currentLine = null;
  endNewLine(cursorData);
});

canvas.addEventListener("mouseup", () => {
  //cursorData.down = false;
  //currentLine = null;
  endNewLine(cursorData);
});

app.append(heading, message);
