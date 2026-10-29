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

interface Point {
  x: number;
  y: number;
}

interface CursorData {
  position: Point;
  down: boolean;
}
const cursorData: CursorData = {
  position: { x: 0, y: 0 },
  down: false,
};

interface Tool {
  drawFunction: (points: Point[], context: CanvasRenderingContext2D) => void;
}

const lineTool = {
  drawFunction: drawLine,
};

function drawLine(
  points: Point[],
  context: CanvasRenderingContext2D,
) {
  context.moveTo(points[0].x, points[0].y);
  for (let i = 0; i < points.length - 1; ++i) {
    context.beginPath();
    context.moveTo(points[i].x, points[i].y);
    context.lineTo(points[i + 1].x, points[i + 1].y);
    context.stroke();
  }
}

interface Command {
  tool: Tool;
  points: Point[];
}

interface CommandData {
  commands: Command[];
  undoneCommands: Command[];
}

const commandData: CommandData = {
  commands: [],
  undoneCommands: [],
};

let activeCommand: Command | null = null;

function redrawCanvas(
  context: CanvasRenderingContext2D,
  canvasElement: HTMLCanvasElement,
  commandInfo: CommandData,
  activeCommand: Command | null = null,
) {
  context.clearRect(0, 0, canvasElement.width, canvasElement.height);

  for (const command of commandInfo.commands) {
    command.tool.drawFunction(command.points, context);
  }
  activeCommand?.tool.drawFunction(activeCommand.points, context);
}

function undoCommand(commandInfo: CommandData) {
  if (commandInfo.commands.length > 0) {
    commandInfo.undoneCommands.push(commandInfo.commands.pop()!);
  }
  redrawCanvas(ctx, canvas, commandInfo);
}

function redoCommand(commandInfo: CommandData) {
  if (commandInfo.undoneCommands.length > 0) {
    commandInfo.commands.push(commandInfo.undoneCommands.pop()!);
  }
  redrawCanvas(ctx, canvas, commandInfo);
}

function handleMouseDown(cursorData: CursorData) {
  commandData.undoneCommands.splice(0, commandData.undoneCommands.length);

  activeCommand = {
    tool: lineTool,
    points: [],
  };
  activeCommand.points.push({
    x: cursorData.position.x,
    y: cursorData.position.y,
  });
  cursorData.down = true;
}

function handleMouseMove(cursorData: CursorData) {
  if (!cursorData.down) {
    return;
  }

  activeCommand!.points.push({
    x: cursorData.position.x,
    y: cursorData.position.y,
  });

  redrawCanvas(ctx, canvas, commandData, activeCommand);
}

function handleMouseUp(cursorData: CursorData) {
  cursorData.down = false;
  if (activeCommand) {
    commandData.commands.push(activeCommand);
    activeCommand = null;
  }

  redrawCanvas(ctx, canvas, commandData);
}

function updateCursorDataPosition(mouseEvent: MouseEvent) {
  cursorData.position.x = mouseEvent.offsetX;
  cursorData.position.y = mouseEvent.offsetY;
}

function setupButtons() {
  const buttonContainer = document.createElement("div");
  app.append(buttonContainer);

  const undoButton = document.createElement("button");
  undoButton.textContent = "undo";
  app.append(undoButton);

  const redoButton = document.createElement("button");
  redoButton.textContent = "redo";
  app.append(redoButton);

  undoButton.addEventListener("click", () => {
    undoCommand(commandData);
  });

  redoButton.addEventListener("click", () => {
    redoCommand(commandData);
  });
}

function setupCanvas() {
  canvas.addEventListener("mousedown", (mouseEvent) => {
    updateCursorDataPosition(mouseEvent);
    handleMouseDown(cursorData);
  });

  canvas.addEventListener("mousemove", (mouseEvent) => {
    updateCursorDataPosition(mouseEvent);
    handleMouseMove(cursorData);
  });

  canvas.addEventListener("mouseout", () => {
    handleMouseUp(cursorData);
  });

  canvas.addEventListener("mouseup", () => {
    handleMouseUp(cursorData);
  });
}

app.append(heading, message);
setupButtons();
setupCanvas();
