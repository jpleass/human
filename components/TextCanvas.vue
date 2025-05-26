<script lang="ts" setup>
import { load, Font } from "opentype.js";

const { topColor, bottomColor } = useColor();
const { text } = useText();

const ASPECT_RATIO = 2000 / 1000;
const WIDTH = 2000;
const HEIGHT = 1000;

const svgRef = ref<SVGSVGElement | null>(null);
const font = ref<Font | null>(null);

function render() {
  const canvasWidth = WIDTH;
  const canvasHeight = HEIGHT;
  const splitPercent = 0.755; // Where to split text for two-tone effect
  const leftMargin = WIDTH * 0.01; // Add some padding to account for negative bearings

  if (!font.value) return;

  // Step 1: Calculate optimal font size and line breaks
  const { fontSize, textLines } = calculateOptimalTextLayout(
    canvasWidth - leftMargin * 2, // Account for padding on both sides
    canvasHeight
  );

  // Step 2: Prepare SVG canvas
  const svg = prepareSvgCanvas(canvasWidth, canvasHeight);
  if (!svg) return;

  // Step 3: Calculate text positioning
  const metrics = calculateTextMetrics(fontSize, textLines.length);

  // Step 4: Find the width of the widest line to center the text block
  const maxLineWidth = findMaxLineWidth(textLines, fontSize);
  const blockLeftMargin = (WIDTH - maxLineWidth) / 2 + leftMargin; // Center the text block with padding

  // Step 5: Create clip paths for two-tone effect
  createClipPaths(svg);

  // Step 6: Render each line of text with the calculated left margin
  renderTextLines(
    svg,
    textLines,
    metrics,
    blockLeftMargin,
    fontSize,
    splitPercent
  );
}

// Helper function to find the width of the widest line
function findMaxLineWidth(lines: string[], fontSize: number): number {
  if (!font.value) return 0;

  let maxWidth = 0;

  for (const line of lines) {
    const lineWidth = measureTextWidth(font.value as Font, line, fontSize);
    maxWidth = Math.max(maxWidth, lineWidth);
  }

  return maxWidth;
}

function calculateOptimalTextLayout(maxWidth: number, maxHeight: number) {
  // Create a canvas context for text measurement
  const ctx = document.createElement("canvas").getContext("2d");
  if (!ctx || !font.value) return { fontSize: 0, textLines: [] };

  let fontSize = 10;
  let textLines: string[] = [];
  let minSize = 10;
  let maxSize = maxHeight;

  // Binary search to find optimal font size
  while (minSize <= maxSize) {
    const testSize = Math.floor((minSize + maxSize) / 2);

    // Instead of using canvas font property, use the loaded opentype font for measurement
    const { lines, fitsCanvas } = calculateLineBreaksWithFont(
      font.value as Font,
      text.value,
      maxWidth,
      testSize
    );

    if (!fitsCanvas || lines.length * testSize * 1.2 > maxHeight) {
      // Text is too big, try smaller size
      maxSize = testSize - 1;
    } else {
      // Text fits, this is a candidate size
      fontSize = testSize;
      textLines = lines;
      minSize = testSize + 1;
    }
  }

  return { fontSize, textLines };
}

// New helper function that uses the loaded font for measurement
function calculateLineBreaksWithFont(
  font: Font,
  inputText: string,
  maxWidth: number,
  fontSize: number
) {
  // Split the input text by newline characters first
  const paragraphs = inputText.split(/\n|\r\n/);
  const lines: string[] = [];

  // Process each paragraph separately
  for (const paragraph of paragraphs) {
    // If paragraph is empty, add an empty line
    if (paragraph.trim() === "") {
      lines.push("");
      continue;
    }

    const words = paragraph.split(" ");
    let currentLine = "";

    // Process each word in the paragraph
    for (const word of words) {
      // Measure width using opentype.js
      const wordWidth = measureTextWidth(font, word, fontSize);

      // Check if single word is too wide for canvas
      if (wordWidth > maxWidth) {
        // Handle oversized words by breaking them into chunks
        const chars = word.split("");
        let chunk = "";

        for (const char of chars) {
          const testChunk = chunk + char;
          const testChunkWidth = measureTextWidth(font, testChunk, fontSize);

          if (testChunkWidth > maxWidth) {
            // Current chunk is full, push it and start a new one
            if (chunk) lines.push(chunk);
            chunk = char;
          } else {
            chunk = testChunk;
          }
        }

        // Add the last chunk if it exists
        if (chunk) {
          if (currentLine) {
            // Try to add to current line first
            const testLine = `${currentLine} ${chunk}`;
            const testLineWidth = measureTextWidth(font, testLine, fontSize);

            if (testLineWidth <= maxWidth) {
              currentLine = testLine;
            } else {
              lines.push(currentLine);
              currentLine = chunk;
            }
          } else {
            currentLine = chunk;
          }
        }
        continue;
      }

      // Try adding the word to the current line
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const testLineWidth = measureTextWidth(font, testLine, fontSize);

      if (testLineWidth > maxWidth) {
        // Line would be too wide, add current line and start new one
        lines.push(currentLine);
        currentLine = word;
      } else {
        // Word fits, add it to the current line
        currentLine = testLine;
      }
    }

    // Add the last line of the paragraph if it exists
    if (currentLine) {
      lines.push(currentLine);
    }
  }

  return { lines, fitsCanvas: true };
}

// Helper function to measure text width using opentype.js
function measureTextWidth(font: Font, text: string, fontSize: number): number {
  let width = 0;
  const glyphs = font.stringToGlyphs(text);

  // Sum up the widths of all glyphs
  for (const glyph of glyphs) {
    if (!glyph.advanceWidth) {
      console.warn(`Glyph ${glyph.name} has no advance width`);
      continue;
    }
    width += (glyph.advanceWidth / font.unitsPerEm) * fontSize;
  }

  return width;
}

// Helper function to prepare the SVG canvas
function prepareSvgCanvas(width: number, height: number) {
  if (!svgRef.value) {
    console.error("SVG element not found");
    return null;
  }

  const svg = svgRef.value;
  svg.innerHTML = ""; // Clear existing content
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  return svg;
}

// Helper function to calculate text metrics for positioning
function calculateTextMetrics(fontSize: number, lineCount: number) {
  if (!font.value) throw new Error("Font not loaded");

  const ascent = (font.value.ascender / font.value.unitsPerEm) * fontSize;
  const descent =
    (Math.abs(font.value.descender) / font.value.unitsPerEm) * fontSize;
  const lineHeight = (ascent + descent) * 0.95; // 20% line height increase for spacing
  const totalTextHeight = lineCount * lineHeight;

  return {
    ascent,
    descent,
    lineHeight,
    totalTextHeight,
    verticalOffset: (HEIGHT - totalTextHeight) / 2, // Center text vertically
  };
}

// Helper function to create clip paths for two-tone effect
function createClipPaths(svg: SVGSVGElement) {
  const defs = document.createElementNS(svg.namespaceURI, "defs");
  svg.appendChild(defs);
  return defs;
}

// Helper function to render text lines with two-tone effect
function renderTextLines(
  svg: SVGSVGElement,
  lines: string[],
  metrics: { ascent: number; lineHeight: number; verticalOffset: number },
  blockLeftMargin: number,
  fontSize: number,
  splitPercent: number
) {
  if (!font.value) return;

  // Process each line of text
  lines.forEach((line, lineIndex) => {
    const yPosition =
      metrics.verticalOffset + metrics.ascent + lineIndex * metrics.lineHeight;
    const clipId = `clip-${lineIndex}`;

    // Use the block left margin for all lines (keeps them left-aligned within the centered block)
    const xPosition = blockLeftMargin;

    // Apply color rules based on line position
    if (lineIndex === 0) {
      // First row: split color, top/bottom
      createLineClipPath(
        svg,
        clipId,
        yPosition,
        fontSize,
        splitPercent,
        "top-bottom"
      );
    } else if (lineIndex === lines.length - 1) {
      // Last row: split color, bottom/top
      createLineClipPath(
        svg,
        clipId,
        yPosition,
        fontSize,
        splitPercent,
        "bottom-top"
      );
    } else {
      // All other rows: solid bottom color
      createLineClipPath(svg, clipId, yPosition, fontSize, 0, "all-bottom");
    }

    // Render the glyphs for this line
    renderLineGlyphs(svg, line, xPosition, yPosition, fontSize, clipId);
  });
}

// Helper function to create a clip path for a line
function createLineClipPath(
  svg: SVGSVGElement,
  clipId: string,
  y: number,
  fontSize: number,
  splitPercent: number,
  colorRule: "top-bottom" | "bottom-top" | "all-bottom"
) {
  const defs = svg.querySelector("defs");
  if (!defs) return;

  // Create clip path for color portions
  const clip = document.createElementNS(svg.namespaceURI, "clipPath");
  clip.setAttribute("id", clipId);

  // Rectangle that defines where second color shows
  const rect = document.createElementNS(svg.namespaceURI, "rect");

  if (colorRule === "top-bottom") {
    // First row: Top portion is topColor, bottom portion is bottomColor
    rect.setAttribute("x", "0");
    rect.setAttribute("y", (y - fontSize + fontSize * splitPercent).toString());
    rect.setAttribute("width", WIDTH.toString());
    rect.setAttribute(
      "height",
      (fontSize * (1 - splitPercent) + fontSize * 0.25).toString()
    );
  } else if (colorRule === "bottom-top") {
    // Last row: Bottom portion is topColor, top portion is bottomColor
    rect.setAttribute("x", "0");
    rect.setAttribute("y", (y - fontSize).toString());
    rect.setAttribute("width", WIDTH.toString());
    rect.setAttribute("height", (fontSize * splitPercent).toString());
  } else if (colorRule === "all-bottom") {
    // Middle rows: All bottomColor
    rect.setAttribute("x", "0");
    rect.setAttribute("y", (y - fontSize).toString());
    rect.setAttribute("width", WIDTH.toString());
    rect.setAttribute("height", (fontSize * 1.25).toString()); // Full height plus a bit extra
  }

  clip.appendChild(rect);
  defs.appendChild(clip);
}

// Helper function to render glyphs in a line
function renderLineGlyphs(
  svg: SVGSVGElement,
  line: string,
  startX: number,
  y: number,
  fontSize: number,
  clipId: string
) {
  if (!font.value) return;

  let xPosition = startX;
  const glyphs = font.value.stringToGlyphs(line);

  // Process each glyph in the line
  glyphs.forEach((glyph) => {
    if (!font.value) {
      return console.error("Font not loaded");
    }

    if (!glyph.advanceWidth) {
      console.warn(`Glyph ${glyph.name} has no advance width`);
      return;
    }
    // Create the SVG path for this glyph
    const path = glyph.getPath(xPosition, y, fontSize);
    const pathData = path.toPathData(2);

    // Create top part of the glyph (first color)
    const topPart = document.createElementNS(svg.namespaceURI, "path");
    topPart.setAttribute("d", pathData);
    topPart.setAttribute("fill", topColor.value);

    // Create bottom part of the glyph (second color)
    const bottomPart = document.createElementNS(svg.namespaceURI, "path");
    bottomPart.setAttribute("d", pathData);
    bottomPart.setAttribute("fill", bottomColor.value);
    bottomPart.setAttribute("clip-path", `url(#${clipId})`);

    // Add both parts to the SVG
    svg.appendChild(topPart);
    svg.appendChild(bottomPart);

    // Calculate spacing for next glyph with tighter tracking
    const boundingBox = path.getBoundingBox();
    const glyphWidth = boundingBox.x2 - boundingBox.x1;
    const normalAdvance =
      (glyph.advanceWidth / font.value.unitsPerEm) * fontSize;
    const spacing = normalAdvance - glyphWidth;

    // Move to next glyph position with reduced spacing (75% of normal)
    xPosition += glyphWidth + spacing * 0.75;
  });
}

onMounted(() => {
  load("./LL-Riforma-Medium.otf", (err, loadedFont) => {
    if (err || !loadedFont) throw new Error("Failed to load font");
    font.value = loadedFont;
    render();
  });
});

watch([topColor, bottomColor, text], render);
</script>

<template>
  <div class="w-full h-full flex items-center justify-center relative">
    <svg
      ref="svgRef"
      id="svg"
      class="border max-w-full max-h-full w-auto h-auto bg-white"
      :style="{ aspectRatio: ASPECT_RATIO }"
      :width="WIDTH"
      :height="HEIGHT"
      :viewBox="`0 0 ${WIDTH} ${HEIGHT}`"
      xmlns="http://www.w3.org/2000/svg"
    ></svg>
  </div>
</template>
