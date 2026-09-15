import { Book } from '../types';

const DB_NAME = 'VintageBookshelfDB';
const DB_VERSION = 1;
const STORE_BOOKS = 'books';
const STORE_PDFS = 'pdf_blobs';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_BOOKS)) {
        db.createObjectStore(STORE_BOOKS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_PDFS)) {
        db.createObjectStore(STORE_PDFS, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Sample books to populate the antique shelf with vintage aesthetic manuscripts
export const SAMPLE_BOOKS: Book[] = [
  {
    id: 'sample-herbal-1',
    title: 'Panduan Tanaman Herbal',
    author: 'Tabib Nusantara',
    totalPages: 14,
    currentPage: 1,
    coverDataUrl: '',
    fileSize: '480 KB',
    addedDate: Date.now() - 86400000 * 2,
    lastReadDate: Date.now() - 3600000 * 1,
    spineColor: '#542911', // Aged Cognac Leather
    spineTexture: 'leather',
    accentColor: '#f3d38c', // Gold
    bookmarkPages: [2],
    fileType: 'sample',
    sampleContent: [
      {
        pageNumber: 1,
        chapterTitle: 'Bab I: Ragam Rimpang Berkhasiat',
        heading: 'Kunyit, Jahe, dan Temulawak',
        content: [
          'Sejak berabad lampau di tanah Jawa dan kepulauan Nusantara, rimpang temu-temuan telah menjadi tiang penopang kebugaran raga para leluhur.',
          'Kunyit dengan zat kurkumin emasnya membersihkan darah dan meredakan peradangan di dalam lambung yang gelisah.',
          'Jahe merah membakar dingin di malam berangin kencang, menghangatkan urat nadi serta memulihkan semangat yang letih sehabis mencangkul di sawah ladang.'
        ]
      },
      {
        pageNumber: 2,
        chapterTitle: 'Bab II: Daun & Akar Penyembuh',
        heading: 'Sirih Temurose & Sambiloto Pahit',
        content: [
          'Daun sirih yang daunnya bertemu urat melambangkan keselarasan batin dan sarana antiseptik alamiah pembersih luka.',
          'Rasa pahit sambiloto membersihkan racun hati dan memperkuat daya tahan jiwa dari serbuan penyakit hawa kotor.'
        ]
      }
    ]
  },
  {
    id: 'sample-arsitektur-1',
    title: 'Arsitektur Klasik Javanese',
    author: 'KRT Brotodiningrat',
    totalPages: 18,
    currentPage: 1,
    coverDataUrl: '',
    fileSize: '620 KB',
    addedDate: Date.now() - 86400000 * 4,
    lastReadDate: Date.now() - 3600000 * 3,
    spineColor: '#1c3d25', // Forest Green Velvet
    spineTexture: 'leather',
    accentColor: '#d8b671', // Gold
    bookmarkPages: [3],
    fileType: 'sample',
    sampleContent: [
      {
        pageNumber: 1,
        chapterTitle: 'Bagian I: Filosofi Joglo',
        heading: 'Arsitektur Klasik Javanese',
        content: [
          'Arsitektur klasik Jawa merupakan perpaduan luhur antara kearifan lokal Nusantara, kosmologi spiritual, dan keanggunan tata ruang kayu jati berukir.',
          'Bentuk atap Joglo menjulang tinggi melambangkan keagungan gunung suci. Setiap tumpangsari diukir dengan ketelitian purnarupa oleh para empu perkayuan Jawa kuna.',
          'Tata letak ruang terbuka pendapa hingga omah njero menciptakan keseimbangan hawa yang sejuk, mengalirkan kedamaian bagi siapa pun yang bernaung di bawah keteduhannya.',
          'Warisan mahakarya arsitektur ini terus menjadi sumber inspirasi keindahan abadi lintas zaman.'
        ]
      },
      {
        pageNumber: 2,
        chapterTitle: 'Bagian II: Saka Guru & Tumpangsari',
        heading: 'Konstruksi Empat Tiang Utama',
        content: [
          'Empat tiang pokok atau Saka Guru menopang balok tumpangsari berundak yang merepresentasikan tingkatan kesadaran manusia menuju Sang Pencipta.',
          'Kayu jati pilihan yang ditebang pada mangsa kapat dikeringkan di bawah naungan angin agar urat kayunya liat dan tidak retak dimakan rayap.',
          'Setiap sambungan kayu dibuat dengan sistem purus dan pasak tanpa paku besi, memungkinkan struktur tahan terhadap getaran bumi.'
        ]
      }
    ]
  },
  {
    id: 'sample-logika-1',
    title: 'Logika Modern',
    author: 'Prof. Soemantri',
    totalPages: 16,
    currentPage: 1,
    coverDataUrl: '',
    fileSize: '510 KB',
    addedDate: Date.now() - 86400000 * 6,
    lastReadDate: Date.now() - 86400000 * 1,
    spineColor: '#262220', // Charcoal Obsidian
    spineTexture: 'cloth',
    accentColor: '#f5d77f', // Gold foil
    bookmarkPages: [],
    fileType: 'sample',
    sampleContent: [
      {
        pageNumber: 1,
        chapterTitle: 'Bab I: Asas Berpikir Kritis',
        heading: 'Silogisme & Validitas Argumen',
        content: [
          'Penalaran rasional menuntut kita menimbang premis sebelum tergesa melompat ke suatu kesimpulan.',
          'Kebenaran yang kokoh diuji melalui dialektika yang jernih, bebas dari bias prasangka dan kesesatan berpikir (logical fallacy).'
        ]
      }
    ]
  },
  {
    id: 'sample-hikayat-1',
    title: 'Hikayat Nusantara Kuno',
    author: 'Pujangga Keraton',
    totalPages: 12,
    currentPage: 1,
    coverDataUrl: '',
    fileSize: '420 KB',
    addedDate: Date.now() - 86400000 * 5,
    lastReadDate: Date.now() - 3600000 * 2,
    spineColor: '#631f17', // Burgundy aged leather
    spineTexture: 'leather',
    accentColor: '#d4af37', // Gold foil
    bookmarkPages: [1, 5],
    fileType: 'sample',
    sampleContent: [
      {
        pageNumber: 1,
        chapterTitle: 'Prakata & Mukadimah',
        heading: 'Lembaran Awal Serat Hikayat',
        content: [
          'Bismillahir-Rahmanir-Rahim.',
          'Inilah warkah pusaka yang disalin pada zaman dahulu kala, tatkala angin timur menghembus harum kemenyan dan cendana di balairung istana kayu jati.',
          'Maka tersebutlah perkataan orang tua-tua peri perbendaharaan ilmu, bahawa barangsiapa yang membelek helaian kitab dengan jiwa yang tenang, niscaya terbukalah baginya jendela hikmah yang tidak ternilai oleh intan dan baiduri.',
          'Zaman berganti zaman, prasasti batu terhakis deru ombak, namun aksara yang digoreskan di atas kertas kulit ini tetap abadi menanti sang pembaca budiman.'
        ]
      },
      {
        pageNumber: 2,
        chapterTitle: 'Bab I: Pelayaran Samudera Emas',
        heading: 'Guruh di Laut Selatan',
        content: [
          'Pada masa baginda Raja memerintah negeri yang berpagarkan pohon nyiur melambai, berlayarlah tujuh buah kapal pinisi mengarungi samudera luas.',
          'Layarnya terbuat dari serat nanas putih bersulamkan lambang burung garuda kencana. Tiang kapalnya dari kayu ulin yang tidak lapuk dimakan air laut berpuluh musim.',
          'Nakhoda tua berdiri di haluan sambil mengamati rasi bintang Gubuk Penceng. Langit malam amat hening, hanya gemericik buih ombak yang menyapa dinding kapal.',
          '“Peliharalah niatmu, wahai anak kapal,” bisik sang Nakhoda sembari menunjuk bintang kejora. “Sebab laut ini tidak hanya menguji ketahanan dayung, melainkan keteguhan sanubari.”'
        ]
      },
      {
        pageNumber: 3,
        chapterTitle: 'Bab I: Pelayaran Samudera Emas',
        heading: 'Singgah di Pulau Rempah Kabut',
        content: [
          'Tatkala fajar menyingsing dengan rona jingga keemasan, tampaklah dari kejauhan pulau berbukit hijau diselimuti halimun pagi.',
          'Harum cengkeh dan pala semerbak terbawa angin darat menyambut kedatangan para kelana laut.',
          'Di tepi pantai pasir putih, burung-burung camar berterbangan menyapa sauh yang diturunkan ke dasar laut yang jernih laksana kaca.',
          'Penduduk pulau berhati lembut menyongsong mereka dengan tempayan berisi air nira kelapa yang manis dingin.'
        ]
      },
      {
        pageNumber: 4,
        chapterTitle: 'Bab II: Rahasia Daun Lontar',
        heading: 'Pustaka di Lembah Sunyi',
        content: [
          'Jauh di pedalaman lereng gunung merapi purba, terdapat sebuah pertapaan batu berundak yang diteduhi pohon beringin kembar.',
          'Di sanalah tersimpan beribu kropak lontar yang diikat dengan benang sutra merah terbungkus kain beludru kuning raja.',
          'Sang Resi penjaga pustaka tersenyum menyambut sang musafir. Jenggotnya memutih bagai awan perak, matanya teduh memancarkan kedamaian.',
          '“Kutuliskan catatan ini bukan untuk dipuji manusia, melainkan agar anak cucu kelak tidak tersesat dalam kegelapan lupa,” tutur beliau perlahan.'
        ]
      },
      {
        pageNumber: 5,
        chapterTitle: 'Bab II: Rahasia Daun Lontar',
        heading: 'Aksara Kawi & Kebijaksanaan Jiwa',
        content: [
          'Setiap goresan pisau pangot pada daun lontar diolesi jelaga minyak kemiri agar garis aksaranya menghitam pekat dan abadi.',
          'Tertulis di situ: “Laksana pohon yang berakar tunjang menghunjam ke bumi nurani, ia takkan goyah diterpa badai fitnah dan godaan fana.”',
          'Membaca kitab kuno adalah laksana menyelam ke dasar telaga bening di tengah malam; engkau akan menemukan bayangan dirimu yang sejati.',
          'Maka catatlah segala kebaikan sekecil apa pun, kerana ia adalah benih bunga surga yang mekar di taman sanubari.'
        ]
      },
      {
        pageNumber: 6,
        chapterTitle: 'Bab III: Senjakala dan Lentera Kayu',
        heading: 'Merenungi Cahaya Redup',
        content: [
          'Apabila matahari terbenam di ufuk barat, nyalakanlah pelita minyak jarak di sudut meja kayu tuamu.',
          'Janganlah terburu-buru menutup buku tatkala malam tiba. Di dalam keheningan temaram itulah, bisikan kata-kata para leluhur terdengar paling merdu.',
          'Kertas tua yang telah menguning ini memeluk aroma waktu yang panjang. Ia menyimpan cerita tentang cinta, pengorbanan, dan rasa syukur yang tulus.',
          'Selamat membaca, semoga engkau menemukan ketenangan di antara deretan baris kalimat bersahaja ini.'
        ]
      }
    ]
  },
  {
    id: 'sample-art-of-war',
    title: 'The Art of War: Sun Tzu',
    author: 'Sun Tzu (Master Sun)',
    totalPages: 10,
    currentPage: 1,
    coverDataUrl: '',
    fileSize: '350 KB',
    addedDate: Date.now() - 86400000 * 12,
    lastReadDate: Date.now() - 86400000 * 1,
    spineColor: '#2b3a4a', // Antique Navy leather
    spineTexture: 'leather',
    accentColor: '#e5c158', // Antique Brass
    bookmarkPages: [3],
    fileType: 'sample',
    sampleContent: [
      {
        pageNumber: 1,
        chapterTitle: 'Chapter I: Laying Plans',
        heading: 'The Moral Law & Ancient Strategy',
        content: [
          'Sun Tzu said: The art of war is of vital importance to the State.',
          'It is a matter of life and death, a road either to safety or to ruin. Hence it is a subject of inquiry which can on no account be neglected.',
          'The moral law causes the people to be in complete accord with their ruler, so that they will follow him regardless of their lives, undismayed by any danger.',
          'Heaven signifies night and day, cold and heat, times and the seasons. Earth comprises distances, great and small; danger and security; open ground and narrow passes.'
        ]
      },
      {
        pageNumber: 2,
        chapterTitle: 'Chapter I: Laying Plans',
        heading: 'The Five Constant Factors',
        content: [
          'The Commander stands for the virtues of wisdom, sincerely, benevolence, strictness, and courage.',
          'By method and discipline are to be understood the marshaling of the army in its proper subdivisions, the graduations of rank among the officers, the maintenance of roads by which supplies may reach the army, and the control of military expenditure.',
          'These five heads should be familiar to every general: he who knows them will be victorious; he who knows them not will fail.'
        ]
      },
      {
        pageNumber: 3,
        chapterTitle: 'Chapter II: Waging War',
        heading: 'Preserving the Harvest & Nation',
        content: [
          'In the operations of war, where there are in the field a thousand swift chariots, as many heavy chariots, and a hundred thousand mail-clad soldiers, with provisions enough to carry them a thousand li, the expenditure at home and at the front will reach the sum of a thousand ounces of silver per day.',
          'When you engage in actual fighting, if victory is long in coming, then men’s weapons will grow dull and their ardor will be damped.',
          'There is no instance of a country having benefited from prolonged warfare.'
        ]
      },
      {
        pageNumber: 4,
        chapterTitle: 'Chapter III: Attack by Stratagem',
        heading: 'The Supreme Art of Victorious Peace',
        content: [
          'In the practical art of war, the best thing of all is to take the enemy’s country whole and intact; to shatter and destroy it is not so good.',
          'Hence to fight and conquer in all your battles is not supreme excellence; supreme excellence consists in breaking the enemy’s resistance without fighting.',
          'Thus the highest form of generalship is to balk the enemy’s plans; the next best is to prevent the junction of the enemy’s forces; the next in order is to attack the enemy’s army in the field; and the worst policy of all is to besiege walled cities.'
        ]
      }
    ]
  },
  {
    id: 'sample-sherlock',
    title: 'A Study in Scarlet',
    author: 'Sir Arthur Conan Doyle',
    totalPages: 8,
    currentPage: 1,
    coverDataUrl: '',
    fileSize: '510 KB',
    addedDate: Date.now() - 86400000 * 20,
    lastReadDate: Date.now() - 86400000 * 4,
    spineColor: '#283e2e', // Forest Green antique cloth
    spineTexture: 'cloth',
    accentColor: '#d1b26f', // Aged Gold
    bookmarkPages: [],
    fileType: 'sample',
    sampleContent: [
      {
        pageNumber: 1,
        chapterTitle: 'Part I: Being a Reprint',
        heading: 'Mr. Sherlock Holmes at 221B Baker Street',
        content: [
          'In the year 1878 I took my degree of Doctor of Medicine of the University of London, and proceeded to Netley to go through the course prescribed for army surgeons.',
          'I had neither kith nor kin in England, and was therefore as free as air—or as free as an income of eleven shillings and sixpence a day will permit a man to be.',
          'Under such circumstances I naturally gravitated to London, that great cesspool into which all the loungers and idlers of the Empire are irresistibly drained.',
          'It was in the Criterion Bar that Stamford told me of a fellow who was working in the chemical laboratory at the hospital, looking for someone to go halves with him in nice rooms.'
        ]
      },
      {
        pageNumber: 2,
        chapterTitle: 'Part I: Being a Reprint',
        heading: 'The Science of Deduction',
        content: [
          'We met next day as he had arranged, and inspected the rooms at No. 221B, Baker Street, of which he had spoken at our meeting.',
          'They consisted of two comfortable bed-rooms and a single large airy sitting-room, cheerfully furnished, and illuminated by two broad windows overlooking the London fog.',
          'Holmes was certainly not a difficult man to live with. He was quiet in his ways, and his habits were regular. It was rare for him to be up after ten at night, and he had invariably breakfasted and gone out before I rose in the morning.'
        ]
      }
    ]
  }
];

export async function getStoredBooks(): Promise<Book[]> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const transaction = db.transaction(STORE_BOOKS, 'readonly');
      const store = transaction.objectStore(STORE_BOOKS);
      const request = store.getAll();

      request.onsuccess = () => {
        const stored = request.result as Book[];
        const hasInitialized = typeof localStorage !== 'undefined' ? localStorage.getItem('vintage_shelf_initialized') : null;
        if (!hasInitialized) {
          try {
            localStorage.setItem('vintage_shelf_initialized', 'true');
          } catch {
            // ignore
          }
          saveInitialSampleBooks(SAMPLE_BOOKS);
          resolve(SAMPLE_BOOKS);
        } else {
          resolve(stored || []);
        }
      };

      request.onerror = () => {
        resolve(SAMPLE_BOOKS);
      };
    });
  } catch {
    return SAMPLE_BOOKS;
  }
}

async function saveInitialSampleBooks(books: Book[]) {
  try {
    const db = await openDB();
    const transaction = db.transaction(STORE_BOOKS, 'readwrite');
    const store = transaction.objectStore(STORE_BOOKS);
    for (const book of books) {
      store.put(book);
    }
  } catch (err) {
    console.error('Error seeding initial books:', err);
  }
}

export async function saveBookRecord(book: Book, pdfData?: ArrayBuffer | Blob): Promise<void> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_BOOKS, STORE_PDFS], 'readwrite');
    const bookStore = transaction.objectStore(STORE_BOOKS);
    const pdfStore = transaction.objectStore(STORE_PDFS);

    bookStore.put(book);

    if (pdfData) {
      pdfStore.put({ id: book.id, data: pdfData });
    }

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

export async function getBookPdfBlob(id: string): Promise<ArrayBuffer | null> {
  const db = await openDB();
  return new Promise((resolve) => {
    const transaction = db.transaction(STORE_PDFS, 'readonly');
    const store = transaction.objectStore(STORE_PDFS);
    const request = store.get(id);

    request.onsuccess = async () => {
      try {
        if (request.result && request.result.data) {
          const data = request.result.data;
          if (data instanceof Blob) {
            const buffer = await data.arrayBuffer();
            resolve(buffer);
          } else if (data instanceof ArrayBuffer) {
            resolve(data.slice(0));
          } else if (data && data.buffer instanceof ArrayBuffer) {
            resolve(data.buffer.slice(0));
          } else {
            resolve(null);
          }
        } else {
          resolve(null);
        }
      } catch (err) {
        console.error('Error extracting PDF blob:', err);
        resolve(null);
      }
    };
    request.onerror = () => resolve(null);
  });
}

export async function updateBookProgress(
  id: string,
  currentPage: number,
  bookmarkPages?: number[]
): Promise<void> {
  try {
    const db = await openDB();
    const transaction = db.transaction(STORE_BOOKS, 'readwrite');
    const store = transaction.objectStore(STORE_BOOKS);
    const request = store.get(id);

    request.onsuccess = () => {
      const book = request.result as Book | undefined;
      if (book) {
        book.currentPage = currentPage;
        book.lastReadDate = Date.now();
        if (bookmarkPages) {
          book.bookmarkPages = bookmarkPages;
        }
        store.put(book);
      }
    };
  } catch (err) {
    console.error('Error updating book progress:', err);
  }
}

export async function deleteBookRecord(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_BOOKS, STORE_PDFS], 'readwrite');
    transaction.objectStore(STORE_BOOKS).delete(id);
    transaction.objectStore(STORE_PDFS).delete(id);

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}
