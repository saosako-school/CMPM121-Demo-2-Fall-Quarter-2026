import { Tool, tools } from "./tools.ts";

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

export interface Point {
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
  tool: tools[0],
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
