import PptxGenJS from "pptxgenjs";

type SlideKind = "chapter" | "content" | "table" | "focus" | "exercise" | "summary";

export type ParsedPptSlide = {
  kind: SlideKind;
  title: string;
  lines?: string[];
  table?: string[][];
};

const theme = {
  blue: "1E4E8C",
  blueDark: "163B68",
  blueLight: "EAF3FF",
  gold: "C99A2E",
  goldLight: "FFF5DA",
  ink: "17202A",
  muted: "5B6776",
  line: "D9E2EC",
  white: "FFFFFF"
};

const slideWidth = 13.333;
const slideHeight = 7.5;
const contentX = 0.78;
const contentW = 11.78;
const shape = {
  rect: "rect",
  roundRect: "roundRect",
  ellipse: "ellipse",
  line: "line"
} satisfies Record<string, PptxGenJS.SHAPE_NAME>;

export function exportPptFileName(courseName: string, chapterName: string) {
  const course = safeFilePart(courseName) || "课程";
  const chapter = safeFilePart(chapterName) || "章节";
  return `${course}-${chapter}.pptx`;
}

export function parseMarkdownToPptSlides(markdown: string, fallbackTitle: string): ParsedPptSlide[] {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const slides: ParsedPptSlide[] = [];
  let currentTitle = fallbackTitle;
  let pending: string[] = [];

  function flush() {
    const cleanLines = normalizeLines(pending);
    pending = [];
    if (cleanLines.length === 0) return;
    const kind = classifySlide(currentTitle, cleanLines);
    chunkLines(cleanLines, 6).forEach((chunk, index) => {
      slides.push({
        kind,
        title: index === 0 ? currentTitle : `${currentTitle}（续）`,
        lines: chunk
      });
    });
  }

  for (let index = 0; index < lines.length; index += 1) {
    const rawLine = lines[index];
    const line = rawLine.trim();
    const h1 = line.match(/^#\s+(.+)$/);
    const h2 = line.match(/^##\s+(.+)$/);

    if (h1) {
      flush();
      const title = stripMarkdown(h1[1]);
      slides.push({ kind: "chapter", title, lines: [title] });
      currentTitle = title;
      continue;
    }

    if (h2) {
      flush();
      currentTitle = stripMarkdown(h2[1]);
      continue;
    }

    if (isTableLine(line)) {
      flush();
      const tableLines = [line];
      while (index + 1 < lines.length && isTableLine(lines[index + 1].trim())) {
        index += 1;
        tableLines.push(lines[index].trim());
      }
      const table = parseMarkdownTable(tableLines);
      if (table.length > 0) {
        slides.push({ kind: "table", title: currentTitle, table });
      }
      continue;
    }

    pending.push(rawLine);
  }
  flush();

  return slides.length > 0 ? slides : [{ kind: "content", title: fallbackTitle, lines: ["暂无正文内容"] }];
}

export async function buildTeachingContentPpt(input: {
  courseName: string;
  chapterName: string;
  body: string | null;
  summary: string | null;
}) {
  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = "教研中心";
  pptx.company = "教研中心";
  pptx.subject = input.courseName;
  pptx.title = input.chapterName;
  pptx.theme = {
    headFontFace: "Microsoft YaHei",
    bodyFontFace: "Microsoft YaHei"
  };

  const parsedSlides = parseMarkdownToPptSlides(input.body || input.summary || "", input.chapterName);
  let page = 1;
  addCoverSlide(pptx, input.courseName, input.chapterName, page++);
  addAgendaSlide(pptx, input.courseName, input.chapterName, parsedSlides, page++);
  parsedSlides.forEach((item) => {
    addParsedSlide(pptx, input.courseName, item, page++);
  });

  const output = await pptx.write({ outputType: "nodebuffer" });
  return Buffer.isBuffer(output) ? output : Buffer.from(output as Uint8Array);
}

function addCoverSlide(pptx: PptxGenJS, courseName: string, chapterName: string, page: number) {
  const slide = pptx.addSlide();
  slide.background = { color: theme.blueDark };
  slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: slideWidth, h: slideHeight, fill: { color: theme.blueDark }, line: { color: theme.blueDark } });
  slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 0.18, h: slideHeight, fill: { color: theme.gold }, line: { color: theme.gold } });
  slide.addText(courseName, { x: 0.8, y: 1.2, w: 10.8, h: 0.45, color: "DDEBFF", fontSize: 18, bold: true, margin: 0 });
  slide.addText(chapterName, { x: 0.8, y: 2.05, w: 11.1, h: 1.1, color: theme.white, fontSize: 34, bold: true, breakLine: false, fit: "shrink", margin: 0 });
  slide.addText("线下面授讲义转 PPT", { x: 0.82, y: 3.55, w: 4.8, h: 0.35, color: "F4D27A", fontSize: 16, margin: 0 });
  addFooter(slide, courseName, page, true);
}

function addAgendaSlide(pptx: PptxGenJS, courseName: string, chapterName: string, slides: ParsedPptSlide[], page: number) {
  const agenda = unique(
    slides
      .filter((item) => item.kind === "chapter" || item.kind === "summary" || item.kind === "exercise" || item.kind === "focus")
      .map((item) => item.title)
  ).slice(0, 8);
  addTextSlide(pptx, courseName, page, "课程目录", agenda.length > 0 ? agenda : [chapterName], "content");
}

function addParsedSlide(pptx: PptxGenJS, courseName: string, item: ParsedPptSlide, page: number) {
  if (item.kind === "chapter") {
    const slide = pptx.addSlide();
    slide.background = { color: theme.blue };
    slide.addText("章节", { x: 0.78, y: 1.35, w: 1.6, h: 0.38, color: theme.goldLight, fontSize: 16, bold: true, margin: 0 });
    slide.addText(item.title, { x: 0.78, y: 2.25, w: 11.2, h: 1.2, color: theme.white, fontSize: 32, bold: true, fit: "shrink", margin: 0 });
    slide.addShape(pptx.ShapeType.line, { x: 0.8, y: 3.7, w: 2.8, h: 0, line: { color: theme.gold, width: 3 } });
    addFooter(slide, courseName, page, true);
    return;
  }

  if (item.kind === "table" && item.table) {
    addTableSlide(pptx, courseName, page, item.title, item.table);
    return;
  }

  addTextSlide(pptx, courseName, page, item.title, item.lines || [], item.kind);
}

function addTextSlide(pptx: PptxGenJS, courseName: string, page: number, title: string, lines: string[], kind: SlideKind) {
  const slide = pptx.addSlide();
  addTitle(slide, title);

  if (kind === "focus" || kind === "exercise" || kind === "summary") {
    const fill = kind === "focus" ? theme.goldLight : kind === "exercise" ? theme.blueLight : "F7FAFC";
    const border = kind === "focus" ? theme.gold : kind === "exercise" ? theme.blue : theme.line;
    slide.addShape(pptx.ShapeType.roundRect, { x: 0.78, y: 1.45, w: 11.78, h: 4.85, rectRadius: 0.08, fill: { color: fill }, line: { color: border, width: 1.2 } });
  }

  lines.slice(0, 6).forEach((line, index) => {
    const isEmphasis = /重点|高频|易错|答案|口诀/.test(line);
    slide.addShape(pptx.ShapeType.ellipse, { x: 0.95, y: 1.75 + index * 0.67, w: 0.12, h: 0.12, fill: { color: isEmphasis ? theme.gold : theme.blue }, line: { color: isEmphasis ? theme.gold : theme.blue } });
    slide.addText(stripMarkdown(line), {
      x: 1.2,
      y: 1.62 + index * 0.67,
      w: 10.8,
      h: 0.42,
      color: theme.ink,
      fontSize: isEmphasis ? 20 : 18,
      bold: isEmphasis,
      fit: "shrink",
      margin: 0
    });
  });

  addFooter(slide, courseName, page);
}

function addTableSlide(pptx: PptxGenJS, courseName: string, page: number, title: string, table: string[][]) {
  const slide = pptx.addSlide();
  addTitle(slide, title);
  const rows = table.slice(0, 7).map((row, rowIndex) =>
    row.map((cell) => ({
      text: stripMarkdown(cell),
      options: {
        bold: rowIndex === 0,
        color: rowIndex === 0 ? theme.white : theme.ink,
        fill: { color: rowIndex === 0 ? theme.blue : theme.white },
        margin: 0.06,
        fontSize: rowIndex === 0 ? 13 : 12
      }
    }))
  );
  slide.addTable(rows, {
    x: contentX,
    y: 1.55,
    w: contentW,
    h: 4.8,
    border: { color: theme.line, pt: 1 },
    fontFace: "Microsoft YaHei",
    valign: "middle"
  });
  addFooter(slide, courseName, page);
}

function addTitle(slide: PptxGenJS.Slide, title: string) {
  slide.addShape(shape.rect, { x: 0, y: 0, w: slideWidth, h: 0.26, fill: { color: theme.blue }, line: { color: theme.blue } });
  slide.addText(title, { x: contentX, y: 0.55, w: contentW, h: 0.55, color: theme.blueDark, fontSize: 24, bold: true, fit: "shrink", margin: 0 });
  slide.addShape(shape.line, { x: contentX, y: 1.22, w: 1.2, h: 0, line: { color: theme.gold, width: 3 } });
}

function addFooter(slide: PptxGenJS.Slide, courseName: string, page: number, inverse = false) {
  const color = inverse ? "DDEBFF" : theme.muted;
  slide.addText(courseName, { x: 0.65, y: 7.05, w: 8.8, h: 0.2, color, fontSize: 9, margin: 0 });
  slide.addText(String(page), { x: 12.25, y: 7.04, w: 0.45, h: 0.22, color, fontSize: 9, align: "right", margin: 0 });
}

function classifySlide(title: string, lines: string[]): SlideKind {
  const value = `${title}\n${lines.join("\n")}`;
  if (/练习|试题|题目|单选|多选|判断|答案|真题/.test(value)) return "exercise";
  if (/总结|复盘|回顾|小结/.test(value)) return "summary";
  if (/重点|高频|易错|口诀|注意|核心/.test(value)) return "focus";
  return "content";
}

function normalizeLines(lines: string[]) {
  return lines
    .map((line) => stripMarkdown(line.trim()))
    .filter(Boolean)
    .flatMap((line) => splitLongLine(line, 32));
}

function splitLongLine(line: string, maxLength: number) {
  if (line.length <= maxLength) return [line];
  const chunks: string[] = [];
  for (let index = 0; index < line.length; index += maxLength) {
    chunks.push(line.slice(index, index + maxLength));
  }
  return chunks;
}

function chunkLines(lines: string[], size: number) {
  const chunks: string[][] = [];
  for (let index = 0; index < lines.length; index += size) {
    chunks.push(lines.slice(index, index + size));
  }
  return chunks;
}

function isTableLine(line: string) {
  return /^\|.+\|$/.test(line);
}

function parseMarkdownTable(lines: string[]) {
  return lines
    .filter((line) => !/^\|\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)+\|$/.test(line))
    .map((line) => line.replace(/^\||\|$/g, "").split("|").map((cell) => cell.trim()))
    .filter((row) => row.some(Boolean));
}

function stripMarkdown(value: string) {
  return value
    .replace(/^#{1,6}\s*/, "")
    .replace(/^[-*+]\s+/, "")
    .replace(/^\d+[.)、]\s+/, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[(.*?)\]\((.*?)\)/g, "$1")
    .trim();
}

function safeFilePart(value: string) {
  return value.replace(/[\\/:*?"<>|]/g, "_").replace(/\s+/g, " ").trim().slice(0, 36);
}

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}
