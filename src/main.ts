const app = document.querySelector<HTMLElement>("#app")!;
const canvas = document.querySelector<HTMLCanvasElement>("#drawingCanvas")!;
canvas.width = 500;
canvas.height = 500;
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
  held: boolean;
}

/*const lineTool: Tool = {
  drawFunction: drawLine,
  held: true,
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
}*/

const circleRadius: number = 10;
const circleTool: Tool = {
  drawFunction: drawCircle,
  held: false,
};

function drawCircle(
  points: Point[],
  context: CanvasRenderingContext2D,
) {
  for (let i = 0; i < points.length; ++i) {
    context.beginPath();
    context.ellipse(
      points[i].x,
      points[i].y,
      circleRadius,
      circleRadius,
      0,
      0,
      2 * Math.PI,
    );
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

let activeCommand: Command = {
  tool: circleTool,
  points: [],
};

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

function pushActiveCommand() {
  commandData.undoneCommands.splice(0, commandData.undoneCommands.length);

  commandData.commands.push(activeCommand);
  activeCommand = {
    tool: activeCommand.tool,
    points: [],
  };

  redrawCanvas(ctx, canvas, commandData);
}

function handleMouseDown(cursorData: CursorData) {
  cursorData.down = true;

  activeCommand.points = [{
    x: cursorData.position.x,
    y: cursorData.position.y,
  }];

  if (!activeCommand.tool.held) {
    pushActiveCommand();
  }
}

function handleMouseMove(cursorData: CursorData) {
  if (!activeCommand.tool.held) {
    activeCommand.points = [{
      x: cursorData.position.x,
      y: cursorData.position.y,
    }];

    redrawCanvas(ctx, canvas, commandData, activeCommand);
    return;
  } else {
    if (!cursorData.down) {
      return;
    }

    activeCommand.points.push({
      x: cursorData.position.x,
      y: cursorData.position.y,
    });
    redrawCanvas(ctx, canvas, commandData, activeCommand);
  }
}

function handleMouseUp(cursorData: CursorData) {
  if (!cursorData.down) {
    return;
  }

  cursorData.down = false;

  if (activeCommand.tool.held) {
    pushActiveCommand();
  }
}

function updateCursorDataPosition(mouseEvent: MouseEvent) {
  cursorData.position.x = mouseEvent.offsetX;
  cursorData.position.y = mouseEvent.offsetY;
  //console.log("X: " + cursorData.position.x + "  Y: " + cursorData.position.y);
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

setupButtons();
setupCanvas();
