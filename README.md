# Mini City Painter

App Link:
https://saosako-school.github.io/CMPM121-Demo-2-Fall-Quarter-2026/

## How to play:

- The tool buttons switch your selected tool. You can then click on the canvas to draw using that tool.
- Click the "Undo" or "Redo" buttons to go back and forth in your drawing history.
- You can export the current canvas by clicking the "Export" button.
- Click the "Create Custom Tool" button to make your own stamp tool.
  - Fill out the tool's name and what text the tool should paste (emojis work best) to make the tool.

## To run:

- Clone the respository to your computer
- Install Deno and run these commands in project directory:
  - `deno task setup`
  - `deno task dev`
- The app should open in a tab on your default browser. If not, copy the ip given in console into a new tab.
- Subsequent runs only require `deno task dev`

## Developer Documentation:

### Code Structure:

- `main.ts` - Handles most game functionality, including drawing and button functionality
- `tools.ts` - Defines the built in tools for the app, which are used by main.ts
- `index.html` - Website structure
- `styles.css` - Website UI format and styling

### Tool Creation:

- To create a new tool, first create a constant variable of type `Tool` in `tools.ts`
- Then define the tool details in the object. The fields are:
  - drawFunction: A function which takes in a list of points and a canvas context. It should use that list of points to draw something to the canvas.
  - name: The tool's name. Appears on its button.
  - column: Which column the button is in. Can be 1 or 2.
  - held: Whether this tool is held down, continually adding points to the list, or clicked once, drawing at a single point.
- Once the tool variable is finished, add it to the `tools` list at the bottom of `tools.ts`.
- Undo/Redo functionality, exports, button creation, and canvas input are all automatically handled once your tool is in the `tools` list, and do not need to be changed.

### Example Drawfunction:

Say you want to implement a new line tool that makes sidewalks. This would just involve a call to the `drawLine` function.

```ts
function drawSidewalk(
  points: Point[],
  context: CanvasRenderingContext2D,
) {
  const sparsePoints: Point[] = makeSparsePointsCopy(points, 10);
  drawLine(sparsePoints, context, 15, "gray");
}
```

## Credits

All artwork used was made specifically for this project.

Tooling adapted from the [CMPM 121 Fall 2026 D1 starter](https://github.com/ucsc-cmpm-121-f26/d1-starter/tree/d949e744b0f9fb7c133a5316f86f2b7fe54529ad), derived from the [S01 starter](https://github.com/ucsc-cmpm-121-f26/s01-starter/tree/8974888efb6537be82e8eb069db139ea885039da). Those repositories have no explicit repository license; no new license is assigned to that material. The D2 scaffold was authored with OpenCode/OpenAI GPT-6.1 Sol assistance. Dependencies retain their respective licenses.
