// @deno-types="./asset-url.d.ts"
import hospitalURL from "./assets/hospital.png?no-inline";
// @deno-types="./asset-url.d.ts"
import cafeURL from "./assets/Cafe.png?no-inline";
// @deno-types="./asset-url.d.ts"
import skyscraperURL from "./assets/City_Building.png?no-inline";
const app = document.querySelector<HTMLElement>("#app")!;
const toolContainer1 = document.querySelector<HTMLDivElement>(
  "#toolContainer1",
)!;
const toolContainer2 = document.querySelector<HTMLDivElement>(
  "#toolContainer2",
)!;

const canvasSize: number = 500;
const canvas = document.querySelector<HTMLCanvasElement>("#drawingCanvas")!;
canvas.width = canvasSize;
canvas.height = canvasSize;
const ctx = canvas.getContext("2d")!;

const hospitalImage = document.createElement("img");
hospitalImage.src = hospitalURL;
canvas.append(hospitalImage);

const cafeImage = document.createElement("img");
cafeImage.src = cafeURL;
canvas.append(cafeImage);

const skyscraperImage = document.createElement("img");
skyscraperImage.src = skyscraperURL;
canvas.append(skyscraperImage);

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
  name: string;
  column: 1 | 2;
  held: boolean;
}

const grassTool: Tool = {
  drawFunction: drawGrass,
  name: "Grass Tool",
  column: 1,
  held: true,
};

function drawGrass(points: Point[], context: CanvasRenderingContext2D) {
  context.save();
  context.fillStyle = "lime";
  context.lineWidth = 0;
  context.fillRect(
    Math.min(points[0].x, points[points.length - 1].x),
    Math.min(points[0].y, points[points.length - 1].y),
    Math.abs(points[0].x - points[points.length - 1].x),
    Math.abs(points[0].y - points[points.length - 1].y),
  );
  context.restore();
}

function drawLine(
  points: Point[],
  context: CanvasRenderingContext2D,
  strokeWidth: number,
  color: string | CanvasGradient | CanvasPattern,
) {
  context.save();

  context.lineWidth = strokeWidth;
  context.strokeStyle = color;

  context.beginPath();
  context.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; ++i) {
    context.lineTo(points[i].x, points[i].y);
    context.stroke();
  }

  context.restore();
}

const roadTool: Tool = {
  drawFunction: drawRoad,
  name: "Road Tool",
  column: 1,
  held: true,
};

function makeSparsePointsCopy(points: Point[], minDistance: number): Point[] {
  const pointsCopy: Point[] = [];
  let previousPoint: Point = points[0];
  for (const point of points) {
    if (pointsCopy.length === 0) {
      pointsCopy.push(point);
      continue;
    }

    const distanceToLastPoint = Math.sqrt(
      (point.x - previousPoint.x) ** 2 + (point.y - previousPoint.y) ** 2,
    );
    if (distanceToLastPoint > minDistance) {
      pointsCopy.push(point);
      previousPoint = point;
    }
  }
  return pointsCopy;
}

function drawRoad(
  points: Point[],
  context: CanvasRenderingContext2D,
) {
  const sparsePoints: Point[] = makeSparsePointsCopy(points, 10);

  context.save();

  drawLine(sparsePoints, context, 20, "black");

  context.setLineDash([8, 20]);
  drawLine(sparsePoints, context, 4, "white");

  context.restore();
}

const hospitalStickerTool: Tool = {
  drawFunction: drawHospitalSticker,
  name: "Hospital Sticker",
  column: 1,
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
  name: "Cafe Sticker",
  column: 1,
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
  name: "Skyscraper Sticker",
  column: 1,
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

const tools: Tool[] = [
  grassTool,
  roadTool,
  hospitalStickerTool,
  cafeStickerTool,
  skyscraperStickerTool,
];

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
  tool: roadTool,
  points: [],
};

function redrawCanvas(
  context: CanvasRenderingContext2D,
  canvasElement: HTMLCanvasElement,
  commandInfo: CommandData,
  activeCommand: Command | null = null,
  clear: boolean = true,
) {
  if (clear) {
    context.clearRect(0, 0, canvasElement.width, canvasElement.height);
  }

  for (const command of commandInfo.commands) {
    command.tool.drawFunction(command.points, context);
  }
  activeCommand?.tool.drawFunction(activeCommand.points, context);
}

const canvasExportUpscale: number = 2;
function exportCanvas() {
  const canvas = document.createElement("canvas");
  canvas.width = canvasSize * canvasExportUpscale;
  canvas.height = canvasSize * canvasExportUpscale;

  const context = canvas.getContext("2d");
  if (!context) {
    return;
  }
  applyDefaultCanvasSettings(context);

  context.scale(canvasExportUpscale, canvasExportUpscale);
  context.save();
  context.fillStyle = "white";
  context.fillRect(
    0,
    0,
    canvasSize * canvasExportUpscale,
    canvasSize * canvasExportUpscale,
  );
  context.restore();
  redrawCanvas(context, canvas, commandData, null, false);

  canvas.toBlob((blob) => {
    if (!blob) {
      return;
    }

    const tempLink = document.createElement("a");
    const url = URL.createObjectURL(blob);
    tempLink.href = url;
    tempLink.download = "CanvasExport.png";
    tempLink.click();
    URL.revokeObjectURL(url);
  });
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

function makeCustomStickerTool(name: string, content: string): Tool {
  return {
    name: name,
    column: 2,
    held: false,

    drawFunction: (
      points: Point[],
      context: CanvasRenderingContext2D,
    ) => {
      context.save();

      context.font = "40px sans-serif";
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillStyle = "black";

      for (const point of points) {
        context.fillText(content, point.x, point.y);
      }

      context.restore();
    },
  };
}

function createToolButton(tool: Tool) {
  const newButton = document.createElement("button");
  newButton.textContent = tool.name;
  newButton.className = "toolButton";

  if (tool.column === 1) {
    toolContainer1.append(newButton);
  } else {
    toolContainer2.append(newButton);
  }

  newButton.addEventListener("click", () => {
    switchTool(tool);
  });
}

function createCustomTool() {
  const nameInput = prompt("Name your new tool:");

  if (nameInput === null || nameInput.trim() === "") {
    return;
  }

  const contentInput = prompt(
    "Enter an emoji or short text for your sticker:",
  );

  if (contentInput === null || contentInput.trim() === "") {
    return;
  }

  const newTool = makeCustomStickerTool(
    nameInput.trim(),
    contentInput.trim(),
  );

  tools.push(newTool);

  createToolButton(newTool);
}

function setupButtons() {
  const buttonContainer = document.createElement("div");
  app.append(buttonContainer);

  const undoButton = document.createElement("button");
  undoButton.textContent = "Undo";
  app.append(undoButton);

  undoButton.addEventListener("click", () => {
    undoCommand(commandData);
  });

  const redoButton = document.createElement("button");
  redoButton.textContent = "Redo";
  app.append(redoButton);

  redoButton.addEventListener("click", () => {
    redoCommand(commandData);
  });

  const exportButton = document.createElement("button");
  exportButton.textContent = "Export";
  app.append(exportButton);

  exportButton.addEventListener("click", () => {
    exportCanvas();
  });

  const createToolButtonElement = document.createElement("button");
  createToolButtonElement.textContent = "Create Custom Tool";
  app.append(createToolButtonElement);

  createToolButtonElement.addEventListener("click", () => {
    createCustomTool();
  });

  for (const tool of tools) {
    createToolButton(tool);
  }
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

function applyDefaultCanvasSettings(context: CanvasRenderingContext2D) {
  context.imageSmoothingEnabled = false;
  context.lineJoin = "round";
}

setupButtons();
applyDefaultCanvasSettings(ctx);
setupCanvas();
