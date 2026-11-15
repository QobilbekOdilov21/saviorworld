# World of Savior — yangi personaj kadrlari

Bu paketda besh personajning qayta yaratilgan 360 ta tayanch pozasi bor: har personajda 72 ta. To‘g‘ridan-to‘g‘ri ishlatiladigan barcha kadrlar `physical_frames/` ichida bir xil 1024×768 piksel, [512,696] oyoq tayanchi va o‘zgarmas fizik masshtab bilan berilgan. Qurol, qanot, yashin va boshqa keng effektlar tana kattaligini o‘zgartirmaydi.

| Harakat | Har personaj uchun poza |
| --- | ---: |
| Tik turish, yurish, havodagi harakat, himoya | 16 |
| Yengil, og‘ir, maxsus hujum, yakuniy kuch | 16 |
| Zarba olish, yiqilish/turish, himoya, egilish, ushlash | 16 |
| Jangga kirish | 8 |
| X-ray | 8 |
| Fatality | 4 |
| G‘alaba | 4 |
| Jami | 72 |

Tik holatda tana 340 birlik balandlikda. Egilish, sakrashdagi bukilish va yiqilishning rasm chegarasi tabiiy ravishda o‘zgaradi; katak va fizik masshtab bir xil qoladi.

`physical_frames/` — har biri 1024×768 bo‘lgan 360 ta to‘liq PNG; boshqa dvigatelda ham bir xil masshtabda ishlatish uchun shu variantni tanlang. `normalized_frames/` — xotirani tejaydigan, har biri 512×512 bo‘lgan 360 ta atlas katagi. `atlases/` — kataklarning siqilgan WebP sahifalari. `source_sheets/` — yangidan chizilgan A/B/C/D varaqlar. `inspection/` — barcha pozalarni solishtirish varaqlari. `frame-manifest.js` — kadr raqamlari, tayanch, fizik masshtab va 90 Hz vaqt xaritasi. `motion/` — oraliq geometrik harakat maydonlari.

Keng effektli ayrim kadrlar atlas ichida xavfsiz kichikroq joylanadi. Ularni alohida ishlatishda `frameMeta.renderScale` koeffitsientini [256,480] tayanch atrofida qo‘llang; ushbu koeffitsientni e’tiborsiz qoldirish personaj yana kichrayib ko‘rinishiga sabab bo‘ladi. Tayyor o‘yin buni avtomatik bajaradi.

Animatsiya vaqt chizig‘i 90 FPS uchun tuzilgan. Tayanch pozalar orasidagi harakat bitta siluetning geometrik siljishi bilan hosil qilinadi; ikki butun personaj rasmini oddiy shaffof ustma-ust qo‘yish ishlatilmaydi. Ko‘rsatiladigan haqiqiy FPS qurilma va ekran yangilanish chastotasiga bog‘liq.

V0.1 dagi bo‘sh, noto‘g‘ri kesilgan va kichik ikki sahnali personaj kadrlari faol o‘yin atlaslariga kiritilmagan. Barcha X-ray va fatality harakatlari qayta yaratilgan to‘liq ketma-ketlik bilan almashtirilgan.
