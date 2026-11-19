/**
 * Zehnora — Rash Tahlili
 * Dixotomik 1 parametrli Rash modeli (1PL Rasch Model)
 * 
 * Ehtimollik formulasi:
 * P(Xij = 1) = 1 / (1 + exp(-(theta_i - b_j)))
 * 
 * Chekli va barqaror baholash uchun Regularizatsiyalangan Qo'shma MAP
 * (Regularized Joint Maximum a Posteriori / JMLE with Normal Prior) usuli:
 * theta_i ~ N(0, sigma^2 = 4)  [mu = 0, sigma = 2]
 * b_j ~ N(0, sigma^2 = 4)      [mu = 0, sigma = 2]
 */

export interface RaschEstimationInput {
  // O'quvchi x Savol matritsasi: 1 (to'g'ri), 0 (noto'g'ri yoki javobsiz)
  matrix: number[][]; // N qator (o'quvchilar), M ustun (savollar)
  priorVariance?: number; // Standart = 4 (sigma = 2)
  maxIterations?: number; // Standart = 100
  convergenceTolerance?: number; // Standart = 1e-4
}

export interface RaschEstimationOutput {
  thetas: number[]; // Har bir o'quvchining qobiliyati (theta)
  bValues: number[]; // Har bir savolning qiyinligi (b)
  iterations: number;
  converged: boolean;
  warnings: string[];
  hasSameTotalScores: boolean;
  isSmallGroup: boolean;
  extremeStudents: boolean[]; // 0 yoki to'liq ball olganlar
  extremeQuestions: boolean[]; // Hech kim topmagan yoki hamma topgan savollar
}

/**
 * Son jihatdan barqaror Sigmoid funksiyasi
 */
export function stableSigmoid(z: number): number {
  if (z >= 35) return 1.0;
  if (z <= -35) return 0.0;
  return 1.0 / (1.0 + Math.exp(-z));
}

/**
 * Logit ayirmasi va P(1-P) ko'paytmasi
 */
export function sigmoidDerivative(p: number): number {
  return p * (1.0 - p);
}

/**
 * Regularizatsiyalangan qo'shma MAP (Joint MAP) orqali theta va b parametrlarini hisoblash
 */
export function estimateRaschParameters(input: RaschEstimationInput): RaschEstimationOutput {
  const {
    matrix,
    priorVariance = 4.0, // sigma = 2 -> sigma^2 = 4
    maxIterations = 100,
    convergenceTolerance = 1e-4,
  } = input;

  const N = matrix.length; // O'quvchilar soni
  const M = N > 0 ? matrix[0].length : 0; // Savollar soni

  const warnings: string[] = [];

  if (N === 0 || M === 0) {
    return {
      thetas: [],
      bValues: [],
      iterations: 0,
      converged: true,
      warnings: ["Tahlil uchun yetarli ma'lumot kiritilmagan (o'quvchilar yoki savollar yo'q)."],
      hasSameTotalScores: false,
      isSmallGroup: true,
      extremeStudents: [],
      extremeQuestions: [],
    };
  }

  // 1. Dastlabki tekshiruvlar va umumiy ballar
  const rawScores: number[] = new Array(N).fill(0);
  const questionSums: number[] = new Array(M).fill(0);

  for (let i = 0; i < N; i++) {
    for (let j = 0; j < M; j++) {
      const val = matrix[i][j];
      rawScores[i] += val;
      questionSums[j] += val;
    }
  }

  // Barcha o'quvchilar bir xil umumiy ball olganmi?
  const firstScore = rawScores[0];
  const hasSameTotalScores = N > 1 && rawScores.every((s) => s === firstScore);
  if (hasSameTotalScores) {
    warnings.push("Guruhdagi barcha o‘quvchilar bir xil umumiy ball olgan. O‘quvchilar qobiliyatini o‘zaro farqlash uchun ma’lumot yetarli emas.");
  }

  // Kichik guruh tekshiruvi
  const isSmallGroup = N < 5;
  if (isSmallGroup) {
    warnings.push("Guruh hajmi juda kichik (5 nafardan kam). Rash baholari statistik jihatdan taxminiy hisoblanadi.");
  }

  // Ekstremal o'quvchilar va savollar (barchasi 0 yoki barchasi 1)
  const extremeStudents = rawScores.map((s) => s === 0 || s === M);
  const extremeQuestions = questionSums.map((s) => s === 0 || s === N);

  // 2. Boshlang'ich qiymatlar (markazi 0 bo'lgan xolis start)
  const thetas: number[] = new Array(N).fill(0.0);
  const bValues: number[] = new Array(M).fill(0.0);

  // Qo'shma MAP uchun prior og'irlik: lambda = 1 / sigma^2 = 1 / 4 = 0.25
  const lambda = 1.0 / priorVariance;

  let iterations = 0;
  let converged = false;

  // Newton-Raphson alternatsiyalovchi yoki qo'shma iteratsiya
  while (iterations < maxIterations) {
    iterations++;
    let maxChange = 0.0;

    // A) Har bir o'quvchining theta_i parametrini yangilash
    for (let i = 0; i < N; i++) {
      let grad = 0.0;
      let hess = 0.0;

      for (let j = 0; j < M; j++) {
        const p = stableSigmoid(thetas[i] - bValues[j]);
        grad += (matrix[i][j] - p);
        hess += sigmoidDerivative(p);
      }

      // Prior hisobga olinadi: - lambda * theta_i
      grad -= lambda * thetas[i];
      // Ikkinchi hosila: - hess - lambda (musbat maxraj: hess + lambda)
      const denom = hess + lambda;

      let deltaTheta = grad / denom;
      // Sonli barqarorlik uchun damping (har qadamda cheklash)
      if (deltaTheta > 1.5) deltaTheta = 1.5;
      if (deltaTheta < -1.5) deltaTheta = -1.5;

      thetas[i] += deltaTheta;
      const absDelta = Math.abs(deltaTheta);
      if (absDelta > maxChange) {
        maxChange = absDelta;
      }
    }

    // B) Har bir savolning b_j parametrini yangilash
    for (let j = 0; j < M; j++) {
      let grad = 0.0;
      let hess = 0.0;

      for (let i = 0; i < N; i++) {
        const p = stableSigmoid(thetas[i] - bValues[j]);
        // dL/db_j = P_ij - X_ij
        grad += (p - matrix[i][j]);
        hess += sigmoidDerivative(p);
      }

      // Prior hisobga olinadi: - lambda * b_j
      grad -= lambda * bValues[j];
      const denom = hess + lambda;

      let deltaB = grad / denom;
      if (deltaB > 1.5) deltaB = 1.5;
      if (deltaB < -1.5) deltaB = -1.5;

      bValues[j] += deltaB;
      const absDelta = Math.abs(deltaB);
      if (absDelta > maxChange) {
        maxChange = absDelta;
      }
    }

    if (maxChange < convergenceTolerance) {
      converged = true;
      break;
    }
  }

  if (!converged) {
    warnings.push(`Yaqinlashish mezoni ${maxIterations} ta iteratsiyada to‘liq qanoatlantirilmadi. Baholar eng so‘nggi yaqinlashish natijasidan olindi.`);
  }

  // Muhim tekshiruv: Bir xil umumiy ballga ega o'quvchilar uchun theta mutlaqo teng bo'lishini ta'minlash
  // Matematik jihatdan koordinata N-R ularni deyarli teng qiladi (1e-6 gacha),
  // lekin suzuvchi nuqta (floating point) xatoliklarini bartaraf etish uchun
  // bir xil umumiy ballga ega o'quvchilarning thetasini o'rtachalashtiramiz:
  const scoreToThetas: Record<number, number[]> = {};
  for (let i = 0; i < N; i++) {
    const sc = rawScores[i];
    if (!scoreToThetas[sc]) scoreToThetas[sc] = [];
    scoreToThetas[sc].push(thetas[i]);
  }
  for (let i = 0; i < N; i++) {
    const sc = rawScores[i];
    const groupThetas = scoreToThetas[sc];
    if (groupThetas.length > 1) {
      const avg = groupThetas.reduce((a, b) => a + b, 0) / groupThetas.length;
      thetas[i] = avg;
    }
  }

  return {
    thetas,
    bValues,
    iterations,
    converged,
    warnings,
    hasSameTotalScores,
    isSmallGroup,
    extremeStudents,
    extremeQuestions,
  };
}
