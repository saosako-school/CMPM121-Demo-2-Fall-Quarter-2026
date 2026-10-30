import { Point } from "./main.ts";

// @deno-types="./asset-url.d.ts"
import grassURL from "./assets/Grass.png?no-inline";
// @deno-types="./asset-url.d.ts"
import hospitalURL from "./assets/hospital.png?no-inline";
// @deno-types="./asset-url.d.ts"
import cafeURL from "./assets/Cafe.png?no-inline";
// @deno-types="./asset-url.d.ts"
import skyscraperURL from "./assets/City_Building.png?no-inline";

const grassImage = document.createElement("img");
grassImage.src = grassURL;
//canvas.append(skyscraperImage);

const hospitalImage = document.createElement("img");
hospitalImage.src = hospitalURL;
//canvas.append(hospitalImage);

const cafeImage = document.createElement("img");
cafeImage.src = cafeURL;
//canvas.append(cafeImage);

const skyscraperImage = document.createElement("img");
skyscraperImage.src = skyscraperURL;
//canvas.append(skyscraperImage);

export interface Tool {
  drawFunction: (points: Point[], context: CanvasRenderingContext2D) => void;
  name: string;
  column: 1 | 2;
  held: boolean;
}

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

const grassTool: Tool = {
  drawFunction: drawGrass,
  name: "Grass Tool",
  column: 1,
  held: true,
};

function drawGrass(points: Point[], context: CanvasRenderingContext2D) {
  context.save();

  const pattern = context.createPattern(grassImage, "repeat");
  if (!pattern) {
    return;
  }

  context.fillStyle = pattern; //"rgb(82, 172, 79)";
  context.lineWidth = 0;
  context.fillRect(
    Math.min(points[0].x, points[points.length - 1].x),
    Math.min(points[0].y, points[points.length - 1].y),
    Math.abs(points[0].x - points[points.length - 1].x),
    Math.abs(points[0].y - points[points.length - 1].y),
  );

  context.restore();
}

const roadTool: Tool = {
  drawFunction: drawRoad,
  name: "Road Tool",
  column: 1,
  held: true,
};

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

export const tools: Tool[] = [
  grassTool,
  roadTool,
  hospitalStickerTool,
  cafeStickerTool,
  skyscraperStickerTool,
];
