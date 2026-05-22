import { existsSync, readFileSync } from "node:fs";
import { PDFDocument, PDFPage, PDFFont, RGB, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";

type PdfInput = {
  title: string;
  category: string;
  summary: string | null;
  body: string | null;
  brandName?: string;
  year?: number;
};

type TextBlock = { type: "heading"; level: number; text: string } | { type: "paragraph"; text: string } | { type: "bullet"; text: string } | { type: "code"; text: string } | { type: "table"; rows: string[][] };
type TocEntry = { level: number; text: string; page: number };
type Fonts = { serif: PDFFont; sans: PDFFont; bold: PDFFont; mono: PDFFont };
type SectionKind = "normal" | "high" | "mistake" | "exam" | "mnemonic" | "template";

const PAGE = { width: 595.28, height: 841.89, marginX: 52, top: 64, bottom: 58 };
const colors = {
  navy: rgb(0.04, 0.12, 0.25),
  gold: rgb(0.86, 0.64, 0.22),
  ink: rgb(0.1, 0.13, 0.18),
  muted: rgb(0.39, 0.43, 0.49),
  line: rgb(0.86, 0.88, 0.91),
  paper: rgb(0.98, 0.985, 0.99),
  red: rgb(0.74, 0.08, 0.12),
  redBg: rgb(1, 0.93, 0.93),
  orange: rgb(0.82, 0.36, 0.04),
  orangeBg: rgb(1, 0.95, 0.88),
  blue: rgb(0.08, 0.32, 0.66),
  blueBg: rgb(0.93, 0.96, 1),
  green: rgb(0.06, 0.46, 0.25),
  greenBg: rgb(0.91, 0.98, 0.94),
  purple: rgb(0.36, 0.16, 0.62),
  purpleBg: rgb(0.96, 0.93, 1)
};

export function exportPdfFileName(title: string) {
  const safe = title.replace(/[\\/:*?"<>|]/g, "_").slice(0, 48) || "teaching-content";
  return `${safe}.pdf`;
}

export async function buildTeachingContentPdf(input: PdfInput) {
  const blocks = parseMarkdown(input.body || "");
  const headings = blocks.filter((block): block is Extract<TextBlock, { type: "heading" }> => block.type === "heading" && block.level <= 2);
  const tocPages = Math.max(1, Math.ceil(headings.length / 30));
  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);
  const fonts = await loadFonts(pdf);
  const meta = inferMeta(input);

  pdf.setTitle(input.title);
  pdf.setSubject(meta.subjectName);
  pdf.setAuthor(input.brandName || "教资教研中心");
  pdf.setProducer("教研内容生产系统");
  pdf.setCreationDate(new Date());

  drawCover(pdf.addPage([PAGE.width, PAGE.height]), fonts, input, meta);
  for (let i = 0; i < tocPages; i += 1) drawTocPlaceholder(pdf.addPage([PAGE.width, PAGE.height]), fonts, input, meta, i + 2);

  const writer = new PdfWriter(pdf, fonts, input, meta, 1 + tocPages);
  for (const block of blocks) writer.write(block);
  writer.finish();

  const tocEntries = writer.toc;
  for (let i = 0; i < tocPages; i += 1) drawToc(pdf.getPage(i + 1), fonts, input, meta, tocEntries.slice(i * 30, (i + 1) * 30), i + 2);
  return pdf.save();
}

function inferMeta(input: PdfInput) {
  const text = `${input.title}\n${input.category}\n${input.body || ""}`;
  const subjectName = text.includes("中学综合素质") ? "中学综合素质" : input.category || "教师资格证";
  const chapter = input.title.replace(/^《?中学综合素质》?/, "").replace(/^第[一二三四五六七八九十]+章/, (match) => match).trim() || input.title;
  return { courseName: "教师资格证笔试系统课", subjectName, chapterName: chapter, brandName: input.brandName || "教资教研中心" };
}

async function loadFonts(pdf: PDFDocument): Promise<Fonts> {
  const chinesePath = firstExisting([
    "/System/Library/Fonts/Supplemental/Arial Unicode.ttf",
    "/System/Library/Fonts/Supplemental/AppleGothic.ttf"
  ]);
  const chineseFont = await pdf.embedFont(readFileSync(chinesePath), { subset: true });
  return { serif: chineseFont, sans: chineseFont, bold: chineseFont, mono: chineseFont };
}

function firstExisting(paths: string[]) {
  const found = paths.find((path) => existsSync(path));
  if (!found) throw new Error("未找到可用于中文 PDF 的系统字体");
  return found;
}

function parseMarkdown(markdown: string): TextBlock[] {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const blocks: TextBlock[] = [];
  let paragraph: string[] = [];
  let code: string[] | null = null;
  const flushParagraph = () => {
    if (paragraph.length) blocks.push({ type: "paragraph", text: paragraph.join(" ").trim() });
    paragraph = [];
  };
  for (let i = 0; i < lines.length; i += 1) {
    const raw = lines[i];
    const line = raw.trim();
    if (line.startsWith("```")) {
      if (code) {
        blocks.push({ type: "code", text: code.join("\n") });
        code = null;
      } else {
        flushParagraph();
        code = [];
      }
      continue;
    }
    if (code) {
      code.push(raw);
      continue;
    }
    if (!line) {
      flushParagraph();
      continue;
    }
    const heading = /^(#{1,6})\s+(.+)$/.exec(line);
    if (heading) {
      flushParagraph();
      blocks.push({ type: "heading", level: heading[1].length, text: cleanInline(heading[2]) });
      continue;
    }
    if (isTableLine(line)) {
      flushParagraph();
      const rows: string[][] = [];
      while (i < lines.length && isTableLine(lines[i].trim())) {
        const tableLine = lines[i].trim();
        if (!/^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?$/.test(tableLine)) {
          rows.push(tableLine.replace(/^\||\|$/g, "").split("|").map((cell) => cleanInline(cell.trim())));
        }
        i += 1;
      }
      i -= 1;
      if (rows.length) blocks.push({ type: "table", rows });
      continue;
    }
    const bullet = /^[-*]\s+(.+)$/.exec(line);
    if (bullet) {
      flushParagraph();
      blocks.push({ type: "bullet", text: cleanInline(bullet[1]) });
      continue;
    }
    paragraph.push(cleanInline(line));
  }
  flushParagraph();
  return blocks;
}

function isTableLine(line: string) {
  return line.startsWith("|") && line.includes("|", 1);
}

function cleanInline(text: string) {
  return text.replace(/\*\*(.*?)\*\*/g, "$1").replace(/`([^`]+)`/g, "$1").replace(/\\\|/g, "|").trim();
}

class PdfWriter {
  toc: TocEntry[] = [];
  private page: PDFPage;
  private y = PAGE.height - PAGE.top;
  private pageNo: number;
  private section: SectionKind = "normal";

  constructor(private pdf: PDFDocument, private fonts: Fonts, private input: PdfInput, private meta: ReturnType<typeof inferMeta>, startPageNo: number) {
    this.pageNo = startPageNo;
    this.page = this.pdf.addPage([PAGE.width, PAGE.height]);
    this.headerFooter();
  }

  write(block: TextBlock) {
    if (block.type === "heading") return this.heading(block.level, block.text);
    if (block.type === "table") return this.table(block.rows);
    if (block.type === "bullet") return this.paragraph(`• ${block.text}`, 10.5, PAGE.marginX + 10);
    if (block.type === "code") return this.code(block.text);
    return this.paragraph(block.text, 10.5, PAGE.marginX);
  }

  finish() {
    // Reserved for future post-processing.
  }

  private newPage() {
    this.pageNo += 1;
    this.page = this.pdf.addPage([PAGE.width, PAGE.height]);
    this.y = PAGE.height - PAGE.top;
    this.headerFooter();
  }

  private ensure(height: number) {
    if (this.y - height < PAGE.bottom) this.newPage();
  }

  private headerFooter() {
    const { page } = this;
    page.drawText(this.meta.subjectName, { x: PAGE.marginX, y: PAGE.height - 32, size: 9, font: this.fonts.sans, color: colors.muted });
    page.drawText(this.meta.chapterName, { x: PAGE.width - PAGE.marginX - textWidth(this.fonts.sans, this.meta.chapterName, 9), y: PAGE.height - 32, size: 9, font: this.fonts.sans, color: colors.muted });
    page.drawLine({ start: { x: PAGE.marginX, y: PAGE.height - 42 }, end: { x: PAGE.width - PAGE.marginX, y: PAGE.height - 42 }, thickness: 0.6, color: colors.line });
    page.drawLine({ start: { x: PAGE.marginX, y: 40 }, end: { x: PAGE.width - PAGE.marginX, y: 40 }, thickness: 0.6, color: colors.line });
    page.drawText(this.meta.brandName, { x: PAGE.marginX, y: 24, size: 8.5, font: this.fonts.sans, color: colors.muted });
    const pageText = String(this.pageNo);
    page.drawText(pageText, { x: PAGE.width / 2 - textWidth(this.fonts.sans, pageText, 9) / 2, y: 24, size: 9, font: this.fonts.sans, color: colors.muted });
  }

  private heading(level: number, text: string) {
    this.section = sectionKind(text);
    const isMajor = level <= 2;
    const size = level === 1 ? 20 : level === 2 ? 15 : 12.5;
    const height = level === 1 ? 44 : level === 2 ? 34 : 26;
    this.ensure(height + 8);
    if (isMajor) this.toc.push({ level, text, page: this.pageNo });
    const style = sectionStyle(this.section);
    if (level <= 2) {
      this.page.drawRectangle({ x: PAGE.marginX, y: this.y - height + 8, width: PAGE.width - PAGE.marginX * 2, height, color: style.bg, borderColor: style.border, borderWidth: 0.8 });
      this.page.drawRectangle({ x: PAGE.marginX, y: this.y - height + 8, width: 5, height, color: style.border });
      this.page.drawText(iconFor(this.section), { x: PAGE.marginX + 14, y: this.y - height + 19, size: 12, font: this.fonts.sans, color: style.border });
      this.page.drawText(text, { x: PAGE.marginX + 34, y: this.y - height + 18, size, font: this.fonts.bold, color: style.border });
      this.y -= height + 12;
    } else {
      this.page.drawText(text, { x: PAGE.marginX, y: this.y - 18, size, font: this.fonts.bold, color: style.border });
      this.y -= 28;
    }
  }

  private paragraph(text: string, size: number, x: number) {
    if (!text) return;
    const maxWidth = PAGE.width - PAGE.marginX - x;
    const lines = wrapText(text, this.fonts.serif, size, maxWidth);
    const height = lines.length * 17 + 6;
    this.ensure(height);
    const style = sectionStyle(this.section);
    if (this.section !== "normal") {
      this.page.drawRectangle({ x: PAGE.marginX, y: this.y - height + 2, width: PAGE.width - PAGE.marginX * 2, height, color: style.softBg, borderColor: style.lightBorder, borderWidth: 0.45 });
    }
    let yy = this.y - 14;
    for (const line of lines) {
      this.page.drawText(line, { x, y: yy, size, font: this.fonts.serif, color: colors.ink });
      yy -= 17;
    }
    this.y -= height;
  }

  private code(text: string) {
    const lines = text.split("\n").flatMap((line) => wrapText(line || " ", this.fonts.mono, 8.5, PAGE.width - PAGE.marginX * 2 - 24));
    const height = lines.length * 13 + 18;
    this.ensure(height);
    this.page.drawRectangle({ x: PAGE.marginX, y: this.y - height, width: PAGE.width - PAGE.marginX * 2, height, color: rgb(0.96, 0.97, 0.98), borderColor: colors.line, borderWidth: 0.5 });
    let yy = this.y - 14;
    for (const line of lines) {
      this.page.drawText(line, { x: PAGE.marginX + 12, y: yy, size: 8.5, font: this.fonts.mono, color: colors.muted });
      yy -= 13;
    }
    this.y -= height + 10;
  }

  private table(rows: string[][]) {
    const colCount = Math.max(...rows.map((row) => row.length));
    const width = PAGE.width - PAGE.marginX * 2;
    const colWidth = width / colCount;
    const rowHeights = rows.map((row) => Math.max(24, ...row.map((cell) => wrapText(cell, this.fonts.serif, 8.5, colWidth - 12).length * 12 + 12)));
    const total = rowHeights.reduce((sum, item) => sum + item, 0) + 10;
    if (total > PAGE.height - PAGE.top - PAGE.bottom) {
      rows.forEach((row, index) => this.table(index === 0 ? [row] : [rows[0], row]));
      return;
    }
    this.ensure(total);
    let yy = this.y;
    rows.forEach((row, rowIndex) => {
      const rowHeight = rowHeights[rowIndex];
      yy -= rowHeight;
      const fill = rowIndex === 0 ? colors.navy : rowIndex % 2 === 0 ? rgb(0.985, 0.99, 1) : rgb(1, 1, 1);
      this.page.drawRectangle({ x: PAGE.marginX, y: yy, width, height: rowHeight, color: fill, borderColor: colors.line, borderWidth: 0.4 });
      for (let col = 1; col < colCount; col += 1) {
        const x = PAGE.marginX + col * colWidth;
        this.page.drawLine({ start: { x, y: yy }, end: { x, y: yy + rowHeight }, thickness: 0.4, color: colors.line });
      }
      row.forEach((cell, col) => {
        const font = rowIndex === 0 ? this.fonts.bold : this.fonts.serif;
        const color = rowIndex === 0 ? rgb(1, 1, 1) : colors.ink;
        const lines = wrapText(cell, font, 8.5, colWidth - 12);
        let textY = yy + rowHeight - 14;
        lines.forEach((line) => {
          this.page.drawText(line, { x: PAGE.marginX + col * colWidth + 6, y: textY, size: 8.5, font, color });
          textY -= 12;
        });
      });
    });
    this.y = yy - 12;
  }
}

function drawCover(page: PDFPage, fonts: Fonts, input: PdfInput, meta: ReturnType<typeof inferMeta>) {
  page.drawRectangle({ x: 0, y: 0, width: PAGE.width, height: PAGE.height, color: colors.navy });
  page.drawRectangle({ x: 0, y: 0, width: PAGE.width, height: 210, color: rgb(0.07, 0.17, 0.34) });
  page.drawRectangle({ x: 58, y: PAGE.height - 132, width: 72, height: 72, borderColor: colors.gold, borderWidth: 1.2 });
  page.drawText("LOGO", { x: 77, y: PAGE.height - 94, size: 13, font: fonts.bold, color: colors.gold });
  page.drawText(meta.brandName, { x: 150, y: PAGE.height - 82, size: 17, font: fonts.bold, color: rgb(1, 1, 1) });
  page.drawText("内部教材 · 教师资格证笔试", { x: 150, y: PAGE.height - 108, size: 10, font: fonts.sans, color: colors.gold });
  page.drawText(meta.courseName, { x: 58, y: 560, size: 18, font: fonts.sans, color: colors.gold });
  drawWrapped(page, input.title, fonts.bold, 30, 58, 492, 470, rgb(1, 1, 1), 40);
  page.drawLine({ start: { x: 58, y: 430 }, end: { x: 240, y: 430 }, thickness: 2, color: colors.gold });
  page.drawText(`科目名称：${meta.subjectName}`, { x: 58, y: 350, size: 13, font: fonts.sans, color: rgb(0.9, 0.94, 1) });
  page.drawText(`章节名称：${meta.chapterName}`, { x: 58, y: 318, size: 13, font: fonts.sans, color: rgb(0.9, 0.94, 1) });
  page.drawText(`年份：${input.year || new Date().getFullYear()}`, { x: 58, y: 286, size: 13, font: fonts.sans, color: rgb(0.9, 0.94, 1) });
  page.drawText("高频考点 · 真题解析 · 易错突破 · 课堂训练", { x: 58, y: 118, size: 12, font: fonts.sans, color: colors.gold });
}

function drawTocPlaceholder(page: PDFPage, fonts: Fonts, input: PdfInput, meta: ReturnType<typeof inferMeta>, pageNo: number) {
  drawStaticPageChrome(page, fonts, input, meta, pageNo);
}

function drawToc(page: PDFPage, fonts: Fonts, input: PdfInput, meta: ReturnType<typeof inferMeta>, entries: TocEntry[], pageNo: number) {
  drawStaticPageChrome(page, fonts, input, meta, pageNo);
  page.drawText("目录", { x: PAGE.marginX, y: PAGE.height - 92, size: 25, font: fonts.bold, color: colors.navy });
  page.drawText("Contents", { x: PAGE.marginX, y: PAGE.height - 112, size: 10, font: fonts.sans, color: colors.gold });
  let y = PAGE.height - 150;
  entries.forEach((entry) => {
    const indent = entry.level === 1 ? 0 : 18;
    const size = entry.level === 1 ? 11.5 : 10;
    const font = entry.level === 1 ? fonts.bold : fonts.serif;
    page.drawText(entry.text, { x: PAGE.marginX + indent, y, size, font, color: colors.ink });
    const pageText = String(entry.page);
    page.drawText(pageText, { x: PAGE.width - PAGE.marginX - textWidth(fonts.sans, pageText, size), y, size, font: fonts.sans, color: colors.muted });
    page.drawLine({ start: { x: PAGE.marginX + indent + Math.min(330, textWidth(font, entry.text, size) + 12), y: y + 3 }, end: { x: PAGE.width - PAGE.marginX - 22, y: y + 3 }, thickness: 0.35, color: colors.line });
    y -= entry.level === 1 ? 22 : 18;
  });
}

function drawStaticPageChrome(page: PDFPage, fonts: Fonts, _input: PdfInput, meta: ReturnType<typeof inferMeta>, pageNo: number) {
  page.drawText(meta.subjectName, { x: PAGE.marginX, y: PAGE.height - 32, size: 9, font: fonts.sans, color: colors.muted });
  page.drawText(meta.chapterName, { x: PAGE.width - PAGE.marginX - textWidth(fonts.sans, meta.chapterName, 9), y: PAGE.height - 32, size: 9, font: fonts.sans, color: colors.muted });
  page.drawLine({ start: { x: PAGE.marginX, y: PAGE.height - 42 }, end: { x: PAGE.width - PAGE.marginX, y: PAGE.height - 42 }, thickness: 0.6, color: colors.line });
  page.drawLine({ start: { x: PAGE.marginX, y: 40 }, end: { x: PAGE.width - PAGE.marginX, y: 40 }, thickness: 0.6, color: colors.line });
  page.drawText(meta.brandName, { x: PAGE.marginX, y: 24, size: 8.5, font: fonts.sans, color: colors.muted });
  const text = String(pageNo);
  page.drawText(text, { x: PAGE.width / 2 - textWidth(fonts.sans, text, 9) / 2, y: 24, size: 9, font: fonts.sans, color: colors.muted });
}

function drawWrapped(page: PDFPage, text: string, font: PDFFont, size: number, x: number, y: number, width: number, color: RGB, lineHeight: number) {
  wrapText(text, font, size, width).forEach((line, index) => page.drawText(line, { x, y: y - index * lineHeight, size, font, color }));
}

function sectionKind(text: string): SectionKind {
  if (/高频|考点/.test(text)) return "high";
  if (/易错|警示/.test(text)) return "mistake";
  if (/真题|例题|课堂练习|课后作业/.test(text)) return "exam";
  if (/口诀|速记/.test(text)) return "mnemonic";
  if (/模板|主观题|答题/.test(text)) return "template";
  return "normal";
}

function sectionStyle(kind: SectionKind) {
  if (kind === "high") return { border: colors.red, bg: colors.redBg, softBg: rgb(1, 0.965, 0.965), lightBorder: rgb(0.96, 0.74, 0.74) };
  if (kind === "mistake") return { border: colors.orange, bg: colors.orangeBg, softBg: rgb(1, 0.975, 0.94), lightBorder: rgb(0.95, 0.74, 0.5) };
  if (kind === "exam") return { border: colors.blue, bg: colors.blueBg, softBg: rgb(0.965, 0.98, 1), lightBorder: rgb(0.68, 0.78, 0.92) };
  if (kind === "mnemonic") return { border: colors.green, bg: colors.greenBg, softBg: rgb(0.95, 0.99, 0.965), lightBorder: rgb(0.65, 0.84, 0.72) };
  if (kind === "template") return { border: colors.purple, bg: colors.purpleBg, softBg: rgb(0.98, 0.96, 1), lightBorder: rgb(0.78, 0.68, 0.9) };
  return { border: colors.navy, bg: colors.paper, softBg: rgb(1, 1, 1), lightBorder: colors.line };
}

function iconFor(kind: SectionKind) {
  if (kind === "high") return "!";
  if (kind === "mistake") return "△";
  if (kind === "exam") return "Q";
  if (kind === "mnemonic") return "✓";
  if (kind === "template") return "T";
  return "◆";
}

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number) {
  const units = tokenize(text);
  const lines: string[] = [];
  let line = "";
  for (const unit of units) {
    const next = line ? line + unit : unit.trimStart();
    if (textWidth(font, next, size) <= maxWidth || !line) {
      line = next;
    } else {
      lines.push(line.trimEnd());
      line = unit.trimStart();
    }
  }
  if (line) lines.push(line.trimEnd());
  return lines.length ? lines : [""];
}

function tokenize(text: string) {
  const tokens = text.match(/[A-Za-z0-9_.,:;!?()[\]\/-]+|\s+|./g) || [];
  return tokens;
}

function textWidth(font: PDFFont, text: string, size: number) {
  return font.widthOfTextAtSize(text, size);
}
