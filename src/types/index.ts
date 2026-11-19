export type QuestionType = 'choice' | 'binary';

export type RaschGrade = 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C';

export interface QuestionDef {
  id: string;
  number: number;
  label: string; // e.g. "1", "2", "30a", "30b"
  key: string;   // 'A' | 'B' | 'C' | 'D' or '1' | '0'
  type: QuestionType;
  topic?: string;
}

export interface StudentRecord {
  id: string;
  name: string;
  className?: string; // e.g. "10-A"
  submittedAt?: string;
  // Har bir savol uchun o'quvchi javobi. '-' yoki bo'sh = javobsiz qoldirilgan
  answers: (string | null)[];
}

export interface TestSession {
  id: string;
  title: string;
  groupName: string;
  date: string;
  questionCount: number;
  questions: QuestionDef[];
  students: StudentRecord[];
  createdAt: string;
  updatedAt: string;
  // Admin yuklaydigan test kitobchasi fayli
  bookFileName?: string;
  bookFileData?: string; // Base64 data yoki URL
  bookFileType?: string; // 'pdf' | 'image' | 'text'
  bookFileNotes?: string;
}

export interface StudentRaschResult {
  studentId: string;
  name: string;
  className?: string;
  rawScore: number;
  totalQuestions: number;
  percent: number;
  theta: number; // Rash qobiliyat bahosi (logit)
  grade: RaschGrade; // A+, A, B+, B, C+, C
  gradeDescription: string;
  correctCount: number;
  incorrectCount: number;
  omittedCount: number;
  isApproximate: boolean;
  answerDetails: {
    questionNumber: number;
    questionLabel: string;
    studentAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    isOmitted: boolean;
    topic?: string;
  }[];
}

export interface QuestionRaschResult {
  questionNumber: number;
  questionLabel: string;
  key: string;
  topic?: string;
  correctCount: number;
  totalStudents: number;
  percent: number;
  b: number; // Rash qiyinlik ko'rsatkichi (logit)
  isApproximate: boolean;
  distractorCounts: Record<string, number>;
}

export interface TopicRaschResult {
  topic: string;
  questionCount: number;
  questionNumbers: number[];
  correctCount: number;
  totalOpportunities: number;
  percent: number;
  isNeedsReview: boolean;
}

export interface RaschAnalysisReport {
  sessionId: string;
  calculatedAt: string;
  studentResults: StudentRaschResult[];
  questionResults: QuestionRaschResult[];
  topicResults: TopicRaschResult[];
  hasSameTotalScores: boolean;
  isSmallGroup: boolean;
  warnings: string[];
  iterations: number;
  converged: boolean;
  note: string;
}

export interface FirebaseConfigState {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}
