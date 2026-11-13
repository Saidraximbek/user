import { TextureGenerator } from '../museum/TextureGenerator.js';

const DB_NAME = 'RomanticMuseumDB';
const DB_VERSION = 2; // Incremented for single romantic hall structure
const STORE_NAME = 'artworks';

export class GalleryStorage {
  constructor() {
    this.db = null;
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('slotIndex', 'slotIndex', { unique: false });
        }
      };

      request.onsuccess = async (event) => {
        this.db = event.target.result;
        const count = await this.getCount();
        if (count === 0) {
          await this.seedRomanticArtworks();
        }
        resolve(this);
      };

      request.onerror = (event) => {
        console.error('IndexedDB error:', event.target.error);
        reject(event.target.error);
      };
    });
  }

  async getCount() {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const countReq = store.count();
      countReq.onsuccess = () => resolve(countReq.result);
      countReq.onerror = () => reject(countReq.error);
    });
  }

  async getAll() {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();
      request.onsuccess = () => {
        const res = request.result || [];
        // Sort by slotIndex
        res.sort((a, b) => (a.slotIndex ?? 0) - (b.slotIndex ?? 0));
        resolve(res);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async save(artwork) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(artwork);
      request.onsuccess = () => resolve(artwork);
      request.onerror = () => reject(request.error);
    });
  }

  async delete(id) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);
      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  }

  async clearAll() {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();
      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  }

  async seedRomanticArtworks() {
    // 22 frames around the romantic gallery hall
    const romanticPresets = [
      {
        slotIndex: 0,
        title: 'Birinchi Uchrashuvimiz 💕',
        artist: 'Bizning Sevgi Qissamiz',
        year: '2024',
        description: 'Ko‘zlaringga ilk bor boqqan va vaqt to‘xtab qolgandek tuyulgan o‘sha sehrli kun. Sen mening hayotimga bahor olib kelding.',
        frameStyle: 'classic-gold',
        type: 'samarkand'
      },
      {
        slotIndex: 1,
        title: 'Yulduzlar Ostidagi Sayr 🌙',
        artist: 'Senga bag‘ishlangan',
        year: '2024',
        description: 'Tungi sokinlikda qo‘llaringni ushlab orzu qilgan lahzalarimiz. Har bir yulduz sen haqingdagi shirin o‘ylarimdek charog‘on.',
        frameStyle: 'neon-glow',
        type: 'starry'
      },
      {
        slotIndex: 2,
        title: 'Sening Mayin Tabassuming 🌹',
        artist: 'Cheksiz Muhabbat',
        year: '2025',
        description: 'Dunyodagi eng go‘zal va samimiy tabassum. Sening quvonching — mening eng katta baxtimdir.',
        frameStyle: 'classic-gold',
        type: 'portrait'
      },
      {
        slotIndex: 3,
        title: 'Oltin Kuz va Bizning Xotiralar 🍂',
        artist: 'Baxtli Kunlar',
        year: '2025',
        description: 'Xiyobon bo‘ylab birga qadam tashlagan, mayin shabboda va qalbimizdagi iliq muhabbat fasli.',
        frameStyle: 'vintage-wood',
        type: 'autumn'
      },
      {
        slotIndex: 4,
        title: 'Tog‘lar Qadar Mustahkam Sevgi 🏔️',
        artist: 'Yurakdan',
        year: '2025',
        description: 'Birgalikda bosib o‘tgan yo‘llarimiz va eng go‘zal orzularimiz. Sen bilan har qanday qiyinchilik oson va go‘zal.',
        frameStyle: 'modern-black',
        type: 'mountains'
      },
      {
        slotIndex: 5,
        title: 'Bizning Shirin Orzularimiz ✨',
        artist: 'Biz Ikkovimiz',
        year: '2026',
        description: 'Kelajak sari birga intilayotgan nurli yo‘limiz. Qo‘limni hech qachon qo‘yib yubormasligingni xohlayman.',
        frameStyle: 'classic-gold',
        type: 'abstract'
      }
    ];

    // Seed preset romantic paintings + placeholder frames for user's personal photos
    for (let i = 0; i < 22; i++) {
      const preset = romanticPresets.find(p => p.slotIndex === i);
      let art;
      if (preset) {
        art = {
          id: `art-romantic-${i}`,
          slotIndex: i,
          title: preset.title,
          artist: preset.artist,
          year: preset.year,
          description: preset.description,
          frameStyle: preset.frameStyle,
          imageUrl: TextureGenerator.generateArtCanvas(preset.type, preset.title),
          isUserUploaded: false,
          isPlaceholder: false,
          createdAt: Date.now() + i
        };
      } else {
        art = {
          id: `art-slot-${i}`,
          slotIndex: i,
          title: `Xotiramiz Surati #${i + 1} 💖`,
          artist: 'Sevganingizga sovg‘a',
          year: '2026',
          description: 'Ushbu ramkaga sevimli insoningiz bilan tushgan unutilmas fotosuratingizni joylang! [E] tugmasini bosing yoki tepadan "Rasm Joylash"ni tanlang.',
          frameStyle: (i % 4 === 0) ? 'classic-gold' : (i % 4 === 1 ? 'neon-glow' : (i % 4 === 2 ? 'vintage-wood' : 'modern-black')),
          imageUrl: TextureGenerator.generateArtCanvas('empty', 'Rasm Joylang'),
          isUserUploaded: false,
          isPlaceholder: true,
          createdAt: Date.now() + i
        };
      }
      await this.save(art);
    }
  }

  async exportGalleryJSON() {
    const all = await this.getAll();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(all, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `sevgi-muzeyimiz-xotiralar-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  async importGalleryJSON(jsonString) {
    try {
      const items = JSON.parse(jsonString);
      if (Array.isArray(items)) {
        for (const item of items) {
          if (item && item.id) {
            await this.save(item);
          }
        }
        return true;
      }
    } catch (e) {
      console.error('Import failed', e);
      throw e;
    }
    return false;
  }
}
