# World of Savior

**SysOne Studio · v0.2** — besh jangchili 2.5D brauzer fighting o‘yini.

## Tez boshlash

```bash
git clone https://github.com/QobilbekOdilov21/saviorworld.git
cd saviorworld
python3 RUN_GAME.py
```

Windows’da `START_WINDOWS.bat`, Linux’da `sh START_LINUX.sh` ishlatiladi.
Tayyor o‘yinga Python 3 va brauzer yetadi; npm paketlari talab qilinmaydi.

## Tekshirish

Node.js 20 yoki yangiroq versiyada:

```bash
npm run check
npm test
```

Repozitoriyda ishlaydigan o‘yin, barcha media, qayta yaratilgan sprite manbalari,
360 poza ma’lumotlari, 90 Hz animatsiya maydonlari va 45 ta test mavjud.
Assetslarni qayta yig‘ish uchun ixtiyoriy Python kutubxonalari: Pillow, numpy, scipy.
O‘yin va assetslar haqidagi batafsil yo‘riqnomalar quyida va `ASSETS_V02_UZ.md` faylida.

---

# World of Savior — Najotkorlar olami

SysOne Studio · v0.2 · Qayta yaratilgan kadrlar va yangilangan jang tizimi

## Ishga tushirish

1. ZIP arxivni to‘liq oching.
2. Python 3 mavjud bo‘lishi kerak. Qo‘shimcha kutubxona kerak emas.
3. Windows: `START_WINDOWS.bat` faylini oching yoki `py RUN_GAME.py` buyrug‘ini bajaring.
4. Linux: papkada `python3 RUN_GAME.py` yoki `sh START_LINUX.sh` buyrug‘ini bajaring.
5. Brauzer avtomatik ochiladi. Ochilmasa, terminaldagi `http://127.0.0.1:...` manzilini oching.
6. Serverni yopish uchun terminalda Ctrl+C bosing.

`dist/index.html` faylini ikki marta bosish orqali ochmang: JavaScript modullari HTTP server orqali ishlaydi. Birinchi yuklashdan keyin ushbu mahalliy paketga internet kerak emas. Tavsiya etiladigan holat — keng ekran; telefonni yonboshlatib ishlating.

## Mavjud imkoniyatlar

- Savior, Ignis, Glacia, Aether-X va Malakor.
- Beshta arena, kamera harakati, yomg‘ir/qor/uchqun effektlari.
- Kompyuterga qarshi jang: oson, o‘rtacha va qiyin.
- Bitta klaviaturada ikki o‘yinchi; ikkita standart gamepad uchun boshqaruv.
- To‘rt raqiblik arcade minora va cheksiz energiyali mashq rejimi.
- Yengil, og‘ir, havodagi va pastki zarbalar, maxsus o‘qlar, himoya va ushlash.
- Ikki raund g‘alabasi, har bir jangchining X-ray va fatality animatsiyasi.
- 10 soniyalik original SysOne Studio videosi, beshta to‘liq soundtrack, sintezlangan jang effektlari.
- Musiqa tanlash, ovoz balandligi, tasvir sifati, kamera tebranishi va sozlamalarni saqlash.
- Sensorli tugmalar, pauza, fokus yo‘qolganda avtomatik to‘xtash va to‘liq ekran.

## Boshqaruv

| Harakat | 1-o‘yinchi | 2-o‘yinchi |
| --- | --- | --- |
| Yurish | A / D | Chap / o‘ng strelka |
| Sakrash / egilish | W / S | Yuqori / past strelka |
| Yengil / og‘ir zarba | J / K | 1 / 2 |
| Maxsus hujum | L | 3 |
| Yakuniy kuch | O | 7 |
| Himoya | Space | 0 |
| Ushlash | I | 5 |
| X-ray | U | 4 |
| Fatality | F | 6 |

ESC yoki P — pauza. Enter — personajlar kirish sahnasidan o‘tish. R — mashqni tiklash. Ikkinchi o‘yinchi yuqori raqamlar yoki NumPad’dan foydalanishi mumkin.

S + K — pastdan zarba. S + Space — pastdan himoya. Ushlash himoyani yoradi. Maxsus hujumga 22%, yakuniy kuchga 100% energiya kerak. X-ray’ga 100% energiya va yaqin masofa kerak. Fatality jangdagi ikkinchi g‘alabadan so‘ng, “Yakuniy zarba” paytida bajariladi.

## Ushbu talqinning chegaralari

Bu qayta yaratilgan PNG spritelar asosidagi, chuqurlik effektlari bilan ishlaydigan brauzer o‘yini. Jang simulyatsiyasi 120 qadam/soniya bilan, animatsiya va oraliq pozalar 90 Hz vaqt chizig‘ida ishlaydi. WebGL2 mavjud bo‘lmaganda me’yorlangan tayanch pozalar bevosita chiziladi. Ekrandagi haqiqiy FPS qurilma va monitorga bog‘liq.

Barcha 360 jangchi pozasi qayta yaratildi. X-ray va fatality kadrlari qahramon hamda neytral nishon ishtirokidagi tayyor kompozitsiyalardir; raqib nomi va zarari joriy jangga bog‘langan. Ushbu talqin 2.5D sprite o‘yini: alohida 3D model fayllari mavjud emas.

## Tuzilishi

`dist/` — tayyor o‘yin va barcha media. `RUN_GAME.py` — mahalliy ishga tushirgich. Asosiy kod: `game.js` — ekranlar va boshqaruv, `combat.js` — jang qoidalari, `renderer-v2.js` — chizish, `animation.js` — oraliq harakatlar, `audio.js` — soundtrack va effektlar. `asset-manifest.js`, `frame-manifest.js`, `ui-manifest.js`, `motion-manifest.js` — media xaritalari.

Ishlab chiqish checkout’ida `npm test` jami 45 ta testni, jumladan 1 250 ta jangchi juftligi va masofa holatini tekshiradi. `npm run check` media yo‘llari, 360 poza, oraliq harakat ma’lumotlari va JavaScript sintaksisini tekshiradi.

## v0.2 yangiliklari

- Besh jangchi uchun 360 ta yangi tayanch poza (har birida 72 ta). Ixcham atlas kataklari 512×512; alohida foydalanish uchun barcha fizik kadrlar 1024×768.
- Atlasda [256,480], fizik kadrlarda [512,696] oyoq tayanchi; tik tananing balandligi 340 birlik. Qurol va effekt kengligi sabab tana kichraytirilmaydi.
- Har bir jangchining barcha 8 ta X-ray va 4 ta fatality pozasi ketma-ket ijro etiladi.
- Menyu tugmalari, avatar kartalari, to‘liq HUD bezagi, energiya chiziqlari, raund bannerlari, sensor tugmalar va 8 ta animatsiyali effekt o‘z manba rasmlari bilan ishlaydi.
- Jangchilar ustaxonasi: har bir animatsiyani tanlash, 90 Hz vaqt chizig‘ida qo‘lda kadr ko‘rish, UI galereyasi.
- Zarba hududlari ko‘rinadigan tanaga moslandi. Tugmalar tiklanish vaqtida yo‘qolib ketmaydi; tez uchadigan o‘qlar nishondan o‘tib ketmaydi.
- O yoki 7 — 100% energiyali uzoq masofadagi yakuniy kuch. X-ray U yoki 4 bilan alohida bajariladi.
- Mashq rejimida zarba hududlarini ko‘rsatish mumkin.

90 FPS — maqsadli chizish/animatsiya chastotasi. Har bir jangchining 72 ta tayanch pozasi 90 Hz vaqt chizig‘ida geometrik oraliq harakatlar bilan ijro etiladi. Ekranda erishiladigan FPS monitor va qurilmaga bog‘liq; haqiqiy qiymat yuqorida ko‘rsatiladi. Oddiy ikki tasvirni shaffoflashtirib ustma-ust qo‘yish ishlatilmaydi.
