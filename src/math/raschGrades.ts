import { RaschGrade } from '../types';

export interface GradeInfo {
  grade: RaschGrade;
  title: string;
  description: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
  badgeClass: string;
}

/**
 * Rash qobiliyat bahosi (theta) va o'zlashtirish foizi asosida
 * rasmiy A+, A, B+, B, C+, C darajasini hisoblash
 */
export function calculateRaschGrade(theta: number, percent: number): GradeInfo {
  // Rash logit qobiliyati va foiz mutanosibligi
  if (theta >= 1.8 || percent >= 90) {
    return {
      grade: 'A+',
      title: 'A’lo daraja (Mukammal)',
      description: 'Matematik qobiliyat juda yuqori, topshiriqlar mukammal o‘zlashtirilgan.',
      bgClass: 'bg-emerald-50',
      textClass: 'text-emerald-700',
      borderClass: 'border-emerald-300',
      badgeClass: 'bg-emerald-600 text-white',
    };
  }

  if (theta >= 1.0 || percent >= 80) {
    return {
      grade: 'A',
      title: 'A’lo daraja',
      description: 'Kuchli matematik mantiq va puxta tayyorgarlik ko‘rsatkichi.',
      bgClass: 'bg-teal-50',
      textClass: 'text-teal-700',
      borderClass: 'border-teal-300',
      badgeClass: 'bg-teal-600 text-white',
    };
  }

  if (theta >= 0.4 || percent >= 70) {
    return {
      grade: 'B+',
      title: 'Yaxshi (Yuqori daraja)',
      description: 'Mavzular yaxshi o‘zlashtirilgan, mustahkam poydevor mavjud.',
      bgClass: 'bg-blue-50',
      textClass: 'text-blue-700',
      borderClass: 'border-blue-300',
      badgeClass: 'bg-blue-600 text-white',
    };
  }

  if (theta >= -0.2 || percent >= 60) {
    return {
      grade: 'B',
      title: 'Yaxshi daraja',
      description: 'O‘rtacha me’yordan yuqori ko‘rsatkich, asosiy mavzular o‘zlashtirilgan.',
      bgClass: 'bg-indigo-50',
      textClass: 'text-indigo-700',
      borderClass: 'border-indigo-300',
      badgeClass: 'bg-indigo-600 text-white',
    };
  }

  if (theta >= -0.8 || percent >= 50) {
    return {
      grade: 'C+',
      title: 'Qoniqarli daraja',
      description: 'Bazaviy bilimlar shakllangan, ayrim qiyin mavzularda mashq qilish kerak.',
      bgClass: 'bg-amber-50',
      textClass: 'text-amber-800',
      borderClass: 'border-amber-300',
      badgeClass: 'bg-amber-500 text-white',
    };
  }

  return {
    grade: 'C',
    title: 'Takrorlash tavsiya etiladi',
    description: 'Quyi daraja. Mavzularni qayta o‘rganish va qo‘shimcha mashg‘ulot talab etiladi.',
    bgClass: 'bg-rose-50',
    textClass: 'text-rose-700',
    borderClass: 'border-rose-300',
    badgeClass: 'bg-rose-600 text-white',
  };
}
