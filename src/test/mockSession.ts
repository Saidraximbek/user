import { QuestionDef, StudentRecord, TestSession } from '../types';

export function createDemoSession(): TestSession {
  const sessionId = `demo_${Date.now()}`;

  // 30 ta savol ta'rifi
  const questions: QuestionDef[] = [
    // 1-6: Kasrlar va ratsional sonlar
    { id: 'q1', number: 1, label: '1', key: 'A', type: 'choice', topic: 'Kasrlar va ratsional sonlar' },
    { id: 'q2', number: 2, label: '2', key: 'C', type: 'choice', topic: 'Kasrlar va ratsional sonlar' },
    { id: 'q3', number: 3, label: '3', key: 'B', type: 'choice', topic: 'Kasrlar va ratsional sonlar' },
    { id: 'q4', number: 4, label: '4', key: 'D', type: 'choice', topic: 'Kasrlar va ratsional sonlar' },
    { id: 'q5', number: 5, label: '5', key: 'A', type: 'choice', topic: 'Kasrlar va ratsional sonlar' },
    { id: 'q6', number: 6, label: '6', key: 'C', type: 'choice', topic: 'Kasrlar va ratsional sonlar' },

    // 7-12: Chiziqli tenglamalar
    { id: 'q7', number: 7, label: '7', key: 'B', type: 'choice', topic: 'Chiziqli tenglamalar' },
    { id: 'q8', number: 8, label: '8', key: 'D', type: 'choice', topic: 'Chiziqli tenglamalar' },
    { id: 'q9', number: 9, label: '9', key: 'A', type: 'choice', topic: 'Chiziqli tenglamalar' },
    { id: 'q10', number: 10, label: '10', key: 'C', type: 'choice', topic: 'Chiziqli tenglamalar' },
    { id: 'q11', number: 11, label: '11', key: 'B', type: 'choice', topic: 'Chiziqli tenglamalar' },
    { id: 'q12', number: 12, label: '12', key: 'D', type: 'choice', topic: 'Chiziqli tenglamalar' },

    // 13-18: Kvadrat tenglamalar
    { id: 'q13', number: 13, label: '13', key: 'A', type: 'choice', topic: 'Kvadrat tenglamalar' },
    { id: 'q14', number: 14, label: '14', key: 'C', type: 'choice', topic: 'Kvadrat tenglamalar' },
    { id: 'q15', number: 15, label: '15', key: 'D', type: 'choice', topic: 'Kvadrat tenglamalar' },
    { id: 'q16', number: 16, label: '16', key: 'B', type: 'choice', topic: 'Kvadrat tenglamalar' },
    { id: 'q17', number: 17, label: '17', key: 'A', type: 'choice', topic: 'Kvadrat tenglamalar' },
    { id: 'q18', number: 18, label: '18', key: 'C', type: 'choice', topic: 'Kvadrat tenglamalar' },

    // 19-24: Planimetriya va geometriya
    { id: 'q19', number: 19, label: '19', key: 'D', type: 'choice', topic: 'Planimetriya va geometriya' },
    { id: 'q20', number: 20, label: '20', key: 'B', type: 'choice', topic: 'Planimetriya va geometriya' },
    { id: 'q21', number: 21, label: '21', key: 'A', type: 'choice', topic: 'Planimetriya va geometriya' },
    { id: 'q22', number: 22, label: '22', key: 'C', type: 'choice', topic: 'Planimetriya va geometriya' },
    { id: 'q23', number: 23, label: '23', key: 'D', type: 'choice', topic: 'Planimetriya va geometriya' },
    { id: 'q24', number: 24, label: '24', key: 'B', type: 'choice', topic: 'Planimetriya va geometriya' },

    // 25-28: Funksiyalar va grafiklar
    { id: 'q25', number: 25, label: '25', key: 'A', type: 'choice', topic: 'Funksiyalar va grafiklar' },
    { id: 'q26', number: 26, label: '26', key: 'C', type: 'choice', topic: 'Funksiyalar va grafiklar' },
    { id: 'q27', number: 27, label: '27', key: 'B', type: 'choice', topic: 'Funksiyalar va grafiklar' },
    { id: 'q28', number: 28, label: '28', key: 'D', type: 'choice', topic: 'Funksiyalar va grafiklar' },

    // 29-30: Ochiq amaliy masala (0/1 binary tekshirish: 30a va 30b bandlari)
    { id: 'q29', number: 29, label: '30a', key: '1', type: 'binary', topic: 'Amaliy masalalar' },
    { id: 'q30', number: 30, label: '30b', key: '1', type: 'binary', topic: 'Amaliy masalalar' },
  ];

  // 25 ta Farg'oniy maktabi o'quvchilari javoblari
  const studentNames = [
    'Ali Karimov',
    'Madina Rahimova',
    'Jasur Eshmatov',
    'Dilnoza Toirova',
    'Bobur Mirzayev',
    'Zilola Hasanova',
    'Sanjar Qodirov',
    'Nodira Umarova',
    'Azizbek Sultonov',
    'Shahzoda Aliyeva',
    'Javohir Yo‘ldoshev',
    'Gulnoza Yusupova',
    'Farrux Ahmedov',
    'Malika Mahmudova',
    'Sardor Ergashev',
    'Rayhona Bozorova',
    'Otabek Normatov',
    'Sevara Jabborova',
    'Bekzod Shukurov',
    'Dildora Sobirova',
    'Ulug‘bek Rustamov',
    'Kamola Fayziyeva',
    'Sherzod Saidov',
    'Mohira Qosimova',
    'Temur Vohidov',
  ];

  // Turli o'quvchilar profillari (yuqori, o'rta, past, javobsiz qoldirganlar)
  const students: StudentRecord[] = [
    // 1. Ali Karimov (kuchli o'quvchi, 28 ta to'g'ri, 2 ta xato)
    {
      id: 'st_1',
      name: 'Ali Karimov',
      answers: ['A','C','B','D','A','C', 'B','D','A','C','B','D', 'A','C','D','B','A','C', 'D','B','A','C','D','B', 'A','C','B','D', '1','1'],
    },
    // 2. Madina Rahimova (yuqori natija, 27 ta to'g'ri, 1 ta xato, 2 ta bo'sh)
    {
      id: 'st_2',
      name: 'Madina Rahimova',
      answers: ['A','C','B','D','A','C', 'B','D','A','C','B','D', 'A','C','D','B','A','C', 'D','B','A','C','-','-', 'A','C','B','D', '1','1'],
    },
    // 3. Jasur Eshmatov (juda kuchli, 29 ta to'g'ri)
    {
      id: 'st_3',
      name: 'Jasur Eshmatov',
      answers: ['A','C','B','D','A','C', 'B','D','A','C','B','D', 'A','C','D','B','A','C', 'D','B','A','C','D','B', 'A','C','B','C', '1','1'],
    },
    // 4. Dilnoza Toirova (o'rta, 22 ta to'g'ri)
    {
      id: 'st_4',
      name: 'Dilnoza Toirova',
      answers: ['A','C','B','D','A','B', 'B','D','A','C','A','D', 'A','C','B','B','A','C', 'D','A','A','C','D','B', 'A','B','B','D', '1','0'],
    },
    // 5. Bobur Mirzayev (o'rta, 20 ta to'g'ri)
    {
      id: 'st_5',
      name: 'Bobur Mirzayev',
      answers: ['A','C','A','D','A','C', 'B','C','A','C','B','B', 'A','C','D','A','A','C', 'B','B','A','C','D','A', 'A','C','A','D', '1','0'],
    },
    // 6. Zilola Hasanova (24 ta to'g'ri)
    {
      id: 'st_6',
      name: 'Zilola Hasanova',
      answers: ['A','C','B','D','A','C', 'B','D','A','C','B','D', 'A','C','D','B','B','C', 'D','B','A','A','D','B', 'A','C','B','A', '1','1'],
    },
    // 7. Sanjar Qodirov (18 ta to'g'ri)
    {
      id: 'st_7',
      name: 'Sanjar Qodirov',
      answers: ['A','C','B','A','A','C', 'B','A','A','C','B','A', 'C','C','D','B','A','B', 'D','B','C','C','A','B', 'A','A','B','D', '0','1'],
    },
    // 8. Nodira Umarova (21 ta to'g'ri)
    {
      id: 'st_8',
      name: 'Nodira Umarova',
      answers: ['A','C','B','D','A','C', 'B','D','C','C','B','D', 'A','A','D','B','A','C', 'D','B','A','B','D','A', 'B','C','B','D', '1','0'],
    },
    // 9. Azizbek Sultonov (16 ta to'g'ri, bir nechta javobsiz)
    {
      id: 'st_9',
      name: 'Azizbek Sultonov',
      answers: ['A','C','B','D','A','-', 'B','D','A','-','B','-', 'A','C','-','B','A','-', 'D','B','A','-','D','-', 'A','-','B','-', '1','0'],
    },
    // 10. Shahzoda Aliyeva (26 ta to'g'ri)
    {
      id: 'st_10',
      name: 'Shahzoda Aliyeva',
      answers: ['A','C','B','D','A','C', 'B','D','A','C','B','D', 'A','C','D','B','A','C', 'D','B','A','C','C','B', 'A','C','B','D', '1','1'],
    },
    // 11. Javohir Yo‘ldoshev (19 ta to'g'ri)
    {
      id: 'st_11',
      name: 'Javohir Yo‘ldoshev',
      answers: ['A','B','B','D','A','C', 'B','D','A','B','B','D', 'A','C','B','B','A','C', 'A','B','A','C','D','A', 'A','C','C','D', '0','1'],
    },
    // 12. Gulnoza Yusupova (23 ta to'g'ri)
    {
      id: 'st_12',
      name: 'Gulnoza Yusupova',
      answers: ['A','C','B','D','A','C', 'B','D','A','C','B','D', 'A','C','D','A','A','C', 'D','B','A','C','A','B', 'A','C','B','B', '1','1'],
    },
    // 13. Farrux Ahmedov (14 ta to'g'ri)
    {
      id: 'st_13',
      name: 'Farrux Ahmedov',
      answers: ['A','B','B','A','A','C', 'A','D','B','C','B','A', 'A','A','D','C','A','C', 'B','B','A','C','A','B', 'B','C','A','D', '0','0'],
    },
    // 14. Malika Mahmudova (25 ta to'g'ri)
    {
      id: 'st_14',
      name: 'Malika Mahmudova',
      answers: ['A','C','B','D','A','C', 'B','D','A','C','B','D', 'A','C','D','B','A','C', 'D','B','A','C','D','B', 'B','C','B','D', '1','0'],
    },
    // 15. Sardor Ergashev (17 ta to'g'ri)
    {
      id: 'st_15',
      name: 'Sardor Ergashev',
      answers: ['A','C','C','D','A','B', 'B','D','A','C','A','D', 'A','C','C','B','A','B', 'D','B','C','C','D','A', 'A','B','B','D', '0','1'],
    },
    // 16. Rayhona Bozorova (22 ta to'g'ri)
    {
      id: 'st_16',
      name: 'Rayhona Bozorova',
      answers: ['A','C','B','D','A','C', 'B','D','A','C','B','D', 'A','B','D','B','A','C', 'D','A','A','C','D','B', 'A','C','A','D', '1','1'],
    },
    // 17. Otabek Normatov (12 ta to'g'ri, qiyinlashgan)
    {
      id: 'st_17',
      name: 'Otabek Normatov',
      answers: ['A','C','B','A','B','C', 'C','D','A','A','B','B', 'B','C','A','B','B','A', 'A','B','B','C','A','B', 'C','C','A','A', '0','0'],
    },
    // 18. Sevara Jabborova (24 ta to'g'ri)
    {
      id: 'st_18',
      name: 'Sevara Jabborova',
      answers: ['A','C','B','D','A','C', 'B','D','A','C','B','D', 'A','C','D','B','A','C', 'D','B','A','C','B','B', 'A','C','B','D', '1','0'],
    },
    // 19. Bekzod Shukurov (15 ta to'g'ri)
    {
      id: 'st_19',
      name: 'Bekzod Shukurov',
      answers: ['A','C','B','D','B','C', 'B','A','A','C','A','D', 'B','C','D','A','A','B', 'D','A','A','B','D','B', 'B','C','A','D', '0','1'],
    },
    // 20. Dildora Sobirova (26 ta to'g'ri)
    {
      id: 'st_20',
      name: 'Dildora Sobirova',
      answers: ['A','C','B','D','A','C', 'B','D','A','C','B','D', 'A','C','D','B','A','C', 'D','B','A','C','D','A', 'A','C','B','D', '1','1'],
    },
    // 21. Ulug‘bek Rustamov (11 ta to'g'ri, past natija)
    {
      id: 'st_21',
      name: 'Ulug‘bek Rustamov',
      answers: ['A','A','B','A','B','B', 'B','A','C','C','A','A', 'B','A','C','B','B','A', 'B','B','C','C','A','A', 'C','B','A','B', '0','0'],
    },
    // 22. Kamola Fayziyeva (27 ta to'g'ri)
    {
      id: 'st_22',
      name: 'Kamola Fayziyeva',
      answers: ['A','C','B','D','A','C', 'B','D','A','C','B','D', 'A','C','D','B','A','C', 'D','B','A','C','D','B', 'A','C','B','B', '1','1'],
    },
    // 23. Sherzod Saidov (18 ta to'g'ri)
    {
      id: 'st_23',
      name: 'Sherzod Saidov',
      answers: ['A','C','B','D','A','A', 'B','D','A','C','B','A', 'A','C','B','B','A','C', 'D','B','A','A','D','A', 'A','A','B','D', '1','0'],
    },
    // 24. Mohira Qosimova (23 ta to'g'ri)
    {
      id: 'st_24',
      name: 'Mohira Qosimova',
      answers: ['A','C','B','D','A','C', 'B','D','A','C','B','D', 'A','C','D','B','A','C', 'D','A','A','C','D','B', 'B','C','B','D', '1','1'],
    },
    // 25. Temur Vohidov (19 ta to'g'ri)
    {
      id: 'st_25',
      name: 'Temur Vohidov',
      answers: ['A','C','A','D','A','C', 'B','D','A','A','B','D', 'A','C','D','B','A','A', 'D','B','A','C','D','B', 'A','B','B','A', '0','1'],
    },
  ];

  return {
    id: sessionId,
    title: '10-sinf Matematika: 1-chorak oraliq nazorati',
    groupName: '10-A sinf',
    date: new Date().toISOString().split('T')[0],
    questionCount: 30,
    questions,
    students,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
