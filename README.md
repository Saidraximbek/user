# Zehnora — Rash Tahlili & OMR Skaner

**Zehnora** — Farg‘oniy Maktabi matematika fani o‘qituvchilari uchun maxsus ishlab chiqilgan, ta’lim natijalarini statistik tahlil qilish va qog‘oz javoblar varaqasini telefon kamerasi orqali tekshirish (OMR) tizimi.

Ushbu dastur 100% brauzerda ishlaydi, qo‘shimcha pulli xizmatlar yoki server talab qilmaydi hamda natijalarni Firebase Firestore bilan avtomatik sinxronlashtiradi.

---

## Asosiy Imkoniyatlar

1. **Javoblar varaqasi (Titul) chiqarish (A4)**:
   - 20 va 30 savollik standart A4 oq-qora formatidagi titul.
   - A, B, C, D variantlari doira tashqarisida, doira ichi esa belgilash uchun bo‘sh.
   - To‘rtta burchak tayanch belgilari (Fiducial markers) va orientatsiya belgilari.
   - Sinov identifikatori bilan QR kod (kalitsiz xavfsiz QR).

2. **Telefon kamerasi orqali OMR skanerlash**:
   - Telefonning orqa kamerasini ochib qog‘oz titulni bir zumda suratga olish va tahlil qilish.
   - Perspektivani to‘g‘rilash (Perspective deskew & warp).
   - Mahalliy fon bilan solishtirish orqali shubhali (ikkita belgi yoki xira iz) belgilarni aniqlash.
   - Shubhali savollar yonida asl qog‘oz kesmasini ko‘rsatib o‘qituvchi tasdig‘ini olish.

3. **Dixotomik 1 parametrli Rash modeli**:
   - Regularizatsiyalangan qo‘shma MAP (Joint MAP with normal priors) usuli.
   - O‘quvchi qobiliyati ($\theta$) va savol qiyinligi ($b$).
   - Xalqaro baholash darajalari: **A+, A, B+, B, C+, C, D**.
   - Qiyin savollar tahlili va variantlar (distraktorlar) taqsimoti.
   - Mavzular bo‘yicha o‘zlashtirish tahlili va zaif mavzularni ("Takrorlash uchun") aniqlash.

4. **Firebase Firestore Bulutli Sinxronlash**:
   - Sinovlar va o‘quvchilar javoblarini real vaqt rejimida Firestore bazasiga yozish.
   - Loyiha ID: `finance-9b58b`.

5. **Hisobotlar va Eksport**:
   - A4 formatidagi guruh hisoboti va alohida o‘quvchi vedomostini PDF chop etish.
   - Excel ochadigan UTF-8 BOM bilan CSV formatida yuklab olish.
   - JSON zaxira nusxasi orqali boshqa qurilmaga uzatish yoki sinxronlash.

---

## Ishga Tushirish

### Talablar
* Node.js (18 yoki undan yuqori)
* npm

### O‘rnatish va Ishga tushirish
```bash
# Paketlarni o‘rnatish
npm install

# Testlarni ishga tushirish (Vitest)
npm test

# Ishlab chiqish serverini ishga tushirish (Dev server)
npm run dev

# Production build qilish
npm run build
```

---

## Texnologiyalar
* **React 19** + **TypeScript**
* **Vite**
* **Tailwind CSS v4**
* **Vitest** (25 ta avtomatlashtirilgan test)
* **Firebase v12** (App & Firestore)
* **jsQR** & HTML5 Canvas Image Processing
