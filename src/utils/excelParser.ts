import { QuestionDef } from '../types';

export interface ParsedStudentRow {
  rowIndex: number; // 1-based (Excel qatori kabi)
  name: string;
  rawAnswers: (string | null)[];
  hasErrors: boolean;
  errors: string[];
}

export interface ExcelParseResult {
  rows: ParsedStudentRow[];
  globalErrors: string[];
  totalParsed: number;
  validCount: number;
  invalidCount: number;
}

const ALLOWED_CHOICE_REGEX = /^[ABCD\-]$/i;
const ALLOWED_BINARY_REGEX = /^[01\-]$/;

/**
 * Excel'dan nusxalangan matnni tahlil qilish
 * 
 * 1-shakl: Ali Karimov \t ABCDABCD...
 * 2-shakl: Ali Karimov \t A \t B \t C \t D ...
 */
export function parseExcelStudentData(
  pastedText: string,
  questions: QuestionDef[]
): ExcelParseResult {
  const targetCount = questions.length;
  const lines = pastedText.split(/\r?\n/).filter((l) => l.trim().length > 0);

  const rows: ParsedStudentRow[] = [];
  const globalErrors: string[] = [];

  if (lines.length === 0) {
    return {
      rows: [],
      globalErrors: ["Kiritilgan matn bo‘sh. Iltimos, Excel’dan nusxa olib qayta qo‘ying."],
      totalParsed: 0,
      validCount: 0,
      invalidCount: 0,
    };
  }

  lines.forEach((line, lineIdx) => {
    const rowNum = lineIdx + 1;
    const errors: string[] = [];

    // Tab bilan ajratish
    const cells = line.split('\t');

    if (cells.length === 0 || (cells.length === 1 && !cells[0].trim())) {
      return;
    }

    const name = cells[0].trim();
    if (!name) {
      errors.push(`Qator ${rowNum}: O‘quvchi ismi ko‘rsatilmagan.`);
    }

    let answers: (string | null)[] = [];

    if (cells.length === 1) {
      // Faqat ism yoki tab ishlatilmagan
      errors.push(`Qator ${rowNum}: Javoblar ustuni topilmadi. Ism va javoblar orasida Tab bo‘lishi kerak.`);
      answers = new Array(targetCount).fill(null);
    } else if (cells.length === 2 && cells[1].trim().length > 1 && !cells[1].includes('\t')) {
      // 1-shakl: Ixcham satr (Ali Karimov \t ABCD...)
      const compactString = cells[1].trim();

      // Uzunlik tekshiruvi
      if (compactString.length !== targetCount) {
        errors.push(
          `Qator ${rowNum} (${name || 'Nomsiz'}): Savollar soni mos kelmadi. Kutilgan: ${targetCount} ta, kiritilgan: ${compactString.length} ta.`
        );
      }

      // Har bir belgini tekshirish
      for (let j = 0; j < Math.max(targetCount, compactString.length); j++) {
        if (j >= compactString.length) {
          answers.push(null);
          continue;
        }

        const char = compactString[j];
        if (char === '-' || char === ' ' || char === '_') {
          answers.push('-');
          continue;
        }

        const upper = char.toUpperCase();
        const qDef = questions[j];

        if (qDef) {
          if (qDef.type === 'binary') {
            if (!ALLOWED_BINARY_REGEX.test(upper)) {
              errors.push(
                `Qator ${rowNum}, ${j + 1}-savol (${qDef.label}): Noma’lum belgi '${char}'. 0/1 turidagi savol uchun faqat '0', '1' yoki '-' bo‘lishi kerak.`
              );
            }
          } else {
            if (!ALLOWED_CHOICE_REGEX.test(upper)) {
              errors.push(
                `Qator ${rowNum}, ${j + 1}-savol (${qDef.label}): Noma’lum belgi '${char}'. Test uchun faqat A, B, C, D yoki '-' bo‘lishi kerak.`
              );
            }
          }
        }

        answers.push(upper);
      }

      // Agar uzunlik ko'proq bo'lsa, kesib tashlash, kam bo'lsa to'ldirish
      if (answers.length > targetCount) {
        answers = answers.slice(0, targetCount);
      }
    } else {
      // 2-shakl: Har bir katak alohida ustunda (Ali Karimov \t A \t B \t \t D ...)
      // cells[0] - ism, cells[1...] - savollar
      const rawCells = cells.slice(1);

      if (rawCells.length !== targetCount) {
        errors.push(
          `Qator ${rowNum} (${name || 'Nomsiz'}): Excel ustunlari soni mos kelmadi. Kutilgan: ${targetCount} ta savol ustuni, topildi: ${rawCells.length} ta ustun.`
        );
      }

      for (let j = 0; j < targetCount; j++) {
        const cellVal = j < rawCells.length ? rawCells[j].trim() : '';
        const qDef = questions[j];

        if (!cellVal || cellVal === '-' || cellVal === '—') {
          // Bo'sh katak joyini saqlaydi! Hech qanday siljish bo'lmaydi!
          answers.push('-');
        } else {
          const upper = cellVal.toUpperCase();
          if (qDef) {
            if (qDef.type === 'binary') {
              if (!ALLOWED_BINARY_REGEX.test(upper)) {
                errors.push(
                  `Qator ${rowNum}, ${j + 1}-ustun (${qDef.label}): Noma’lum qiymat '${cellVal}'. Faqat '0', '1' yoki bo‘sh katak bo‘lishi mumkin.`
                );
              }
            } else {
              if (!ALLOWED_CHOICE_REGEX.test(upper)) {
                errors.push(
                  `Qator ${rowNum}, ${j + 1}-ustun (${qDef.label}): Noma’lum belgi '${cellVal}'. Faqat A, B, C, D yoki bo‘sh katak bo‘lishi mumkin.`
                );
              }
            }
          }
          answers.push(upper);
        }
      }
    }

    rows.push({
      rowIndex: rowNum,
      name,
      rawAnswers: answers,
      hasErrors: errors.length > 0,
      errors,
    });
  });

  const validCount = rows.filter((r) => !r.hasErrors).length;
  const invalidCount = rows.length - validCount;

  return {
    rows,
    globalErrors,
    totalParsed: rows.length,
    validCount,
    invalidCount,
  };
}

/**
 * Javob kaliti satrini tahlil qilish
 * Masalan: "ABCDABCD..." yoki "A B C D ..." yoki "A\tB\tC\tD..."
 */
export function parseAnswerKeyInput(input: string, targetCount: number): string[] {
  // Avval bo'shliqlar yoki tablar orqali ajratib ko'ramiz
  const tokens = input.trim().split(/[\s\t,;]+/).filter((t) => t.length > 0);

  if (tokens.length === targetCount && tokens.every((t) => t.length === 1)) {
    return tokens.map((t) => t.toUpperCase());
  }

  // Agar ixcham bir satr bo'lsa (bo'shliqlarsiz yoki qisman bo'shliq bilan)
  const cleaned = input.replace(/[\s\t,;]+/g, '');
  const chars = cleaned.split('').map((c) => c.toUpperCase());
  return chars;
}
