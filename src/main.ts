// @deno-types="./asset-url.d.ts"
import hospitalURL from "./assets/hospital.png?no-inline";
// @deno-types="./asset-url.d.ts"
import cafeURL from "./assets/Cafe.png?no-inline";
// @deno-types="./asset-url.d.ts"
import skyscraperURL from "./assets/City_Building.png?no-inline";
const app = document.querySelector<HTMLElement>("#app")!;
const canvas = document.querySelector<HTMLCanvasElement>("#drawingCanvas")!;

const hospitalImage = document.createElement("img");
hospitalImage.src = hospitalURL;
canvas.append(hospitalImage);

const cafeImage = document.createElement("img");
cafeImage.src = cafeURL;
canvas.append(cafeImage);

const skyscraperImage = document.createElement("img");
skyscraperImage.src = skyscraperURL;
canvas.append(skyscraperImage);

const toolContainer = document.querySelector<HTMLDivElement>(
  "#toolContainer",
)!;
canvas.width = 500;
canvas.height = 500;
const ctx = canvas.getContext("2d")!;
ctx.imageSmoothingEnabled = false;

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

const lineTool: Tool = {
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
}

const hospitalStickerTool: Tool = {
  drawFunction: drawHospitalSticker,
  held: false,
};

function drawHospitalSticker(
  points: Point[],
  context: CanvasRenderingContext2D,
) {
  for (let i = 0; i < points.length; ++i) {
    context.drawImage(
      hospitalImage,
      points[i].x - 65.5,
      points[i].y - 49.35,
      131,
      98.5,
    );
  }
}

const cafeStickerTool: Tool = {
  drawFunction: drawCafeSticker,
  held: false,
};

function drawCafeSticker(
  points: Point[],
  context: CanvasRenderingContext2D,
) {
  for (let i = 0; i < points.length; ++i) {
    context.drawImage(
      cafeImage,
      points[i].x - 66.25,
      points[i].y - 50.5,
      132.5,
      101,
    );
  }
}

const skyscraperStickerTool: Tool = {
  drawFunction: drawSkyscraperSticker,
  held: false,
};

function drawSkyscraperSticker(
  points: Point[],
  context: CanvasRenderingContext2D,
) {
  for (let i = 0; i < points.length; ++i) {
    context.drawImage(
      skyscraperImage,
      points[i].x - 33.375,
      points[i].y - 49,
      66.75,
      98,
    );
  }
}

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

function switchTool(tool: Tool) {
  activeCommand.tool = tool;
  activeCommand.points = [];
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
  undoButton.textContent = "Undo";
  app.append(undoButton);

  const redoButton = document.createElement("button");
  redoButton.textContent = "Redo";
  app.append(redoButton);

  undoButton.addEventListener("click", () => {
    undoCommand(commandData);
  });

  redoButton.addEventListener("click", () => {
    redoCommand(commandData);
  });

  const lineToolButton = document.createElement("button");
  lineToolButton.textContent = "Line Tool";
  lineToolButton.className = "toolButton";
  toolContainer.append(lineToolButton);

  lineToolButton.addEventListener("click", () => {
    switchTool(lineTool);
  });

  const circleToolButton = document.createElement("button");
  circleToolButton.textContent = "Circle Tool";
  circleToolButton.className = "toolButton";
  toolContainer.append(circleToolButton);

  circleToolButton.addEventListener("click", () => {
    switchTool(circleTool);
  });

  const hospitalStickerButton = document.createElement("button");
  hospitalStickerButton.textContent = "Hospital Sticker";
  hospitalStickerButton.className = "toolButton";
  toolContainer.append(hospitalStickerButton);

  hospitalStickerButton.addEventListener("click", () => {
    switchTool(hospitalStickerTool);
  });

  const cafeStickerButton = document.createElement("button");
  cafeStickerButton.textContent = "Cafe Sticker";
  cafeStickerButton.className = "toolButton";
  toolContainer.append(cafeStickerButton);

  cafeStickerButton.addEventListener("click", () => {
    switchTool(cafeStickerTool);
  });

  const skyscraperStickerButton = document.createElement("button");
  skyscraperStickerButton.textContent = "Skyscraper Sticker";
  skyscraperStickerButton.className = "toolButton";
  toolContainer.append(skyscraperStickerButton);

  skyscraperStickerButton.addEventListener("click", () => {
    switchTool(skyscraperStickerTool);
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
    if (!activeCommand.tool.held) {
      activeCommand.points = [];
      redrawCanvas(ctx, canvas, commandData, activeCommand);
    }

    handleMouseUp(cursorData);
  });

  canvas.addEventListener("mouseup", () => {
    handleMouseUp(cursorData);
  });
}

setupButtons();
setupCanvas();
