import React from 'react';
import { X, HelpCircle, BookOpen, Calculator, CheckCircle2 } from 'lucide-react';

interface CalculationInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CalculationInfoModal: React.FC<CalculationInfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto no-print">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Calculator className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Rash tahlili qanday ishlaydi?</h3>
              <p className="text-xs text-indigo-100">Statistik model va hisoblash usuli haqida o‘qituvchi uchun qo‘llanma</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 text-sm text-slate-700 max-h-[75vh] overflow-y-auto leading-relaxed">
          {/* 1. Dixotomik Rash modeli */}
          <section className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h4 className="font-semibold text-slate-900 flex items-center gap-2 mb-2 text-base">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              1. Dixotomik 1 parametrli Rash modeli (1PL Model)
            </h4>
            <p className="mb-3">
              Rash modelida har bir o‘quvchining savolga to‘g‘ri javob berish ehtimolligi ikkita asosiy kattalikka bog‘liq:
            </p>
            <div className="bg-white p-3 rounded-lg border border-slate-200 font-mono text-center text-indigo-900 text-sm mb-3">
              P(X<sub>ij</sub> = 1) = 1 / (1 + exp(-(θ<sub>i</sub> - b<sub>j</sub>)))
            </div>
            <ul className="list-disc list-inside space-y-1.5 pl-1 text-slate-600">
              <li>
                <strong className="text-slate-800">θ<sub>i</sub> (theta)</strong> — o‘quvchining ushbu sinovdagi qobiliyat darajasi (logit birligida). Qobiliyat yuqori bo‘lsa, theta musbat va kattaroq bo‘ladi.
              </li>
              <li>
                <strong className="text-slate-800">b<sub>j</sub></strong> — savolning qiyinlik ko‘rsatkichi. Savol qanchalik qiyin bo‘lsa, uning b qiymati shunchalik yuqori bo‘ladi.
              </li>
            </ul>
          </section>

          {/* 2. Regularizatsiyalangan qo'shma MAP */}
          <section className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
            <h4 className="font-semibold text-slate-900 flex items-center gap-2 mb-2 text-base">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              2. Regularizatsiyalangan qo‘shma MAP (Joint MAP) usuli
            </h4>
            <p className="mb-2">
              Kichik sinflarda yoki barcha savollarni to‘g‘ri (yoki barchasini xato) ishlagan o‘quvchilarda klassik maksimum ehtimollik (JMLE) cheksizlikka (Infinity / NaN) ketib qoladi.
            </p>
            <p className="mb-2">
              Dasturimizda buni bartaraf etish uchun <strong>markazi 0 va standart og‘ishi 2 bo‘lgan normal prior</strong> (aprior taqsimot) qo‘llangan. Bu Bernulli log-likelihood va priorlar yig‘indisini barqaror optimallashtiradi. Natijada:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-1 text-slate-600">
              <li>Hammasini to‘g‘ri topgan o‘quvchiga chekli, aniq musbat baho (masalan, +2.8 logit) beriladi.</li>
              <li>Hech birini topmagan o‘quvchiga chekli manfiy baho (masalan, -2.8 logit) beriladi.</li>
              <li>Matematik hisob-kitoblar mutlaqo barqaror va xatoliksiz kechadi.</li>
            </ul>
          </section>

          {/* 3. Baholashning xolislik tamoyili */}
          <section className="bg-amber-50/50 p-4 rounded-xl border border-amber-200">
            <h4 className="font-semibold text-slate-900 flex items-center gap-2 mb-2 text-base">
              <HelpCircle className="w-4 h-4 text-amber-600" />
              3. Rash modelining adolat va xolislik qoidalari
            </h4>
            <div className="space-y-2 text-slate-700">
              <p>
                <strong>Teng ballga teng theta:</strong> Bir xil savollarni ishlagan va bir xil miqdorda to‘g‘ri javob bergan ikki o‘quvchiga mutlaqo bir xil theta chiqadi. Rash modelida umumiy ball yetarli statistika (sufficient statistic) hisoblanadi va "qiyin savolni topgani uchun sun’iy bonus" qo‘shilmaydi.
              </p>
              <p>
                <strong>Haqiqiy kontekst:</strong> Hisoblangan theta qiymati aynan shu sinov va shu sinf javoblari doirasida kalibrlangan. Boshqa mustaqil sinovlar bilan sun’iy qiyoslab umumiy reyting tuzish tavsiya etilmaydi.
              </p>
              <p>
                <strong>Xom ball va foiz:</strong> Xom ball (masalan 24/30), foiz (80%) va logit theta (+1.25) bir-birining o‘rnini bosmaydi, balki bir-birini to‘ldiradi.
              </p>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-sm font-medium transition-colors cursor-pointer"
          >
            Tushundim, yopish
          </button>
        </div>
      </div>
    </div>
  );
};
