# SAT Acers — Ace it. Har kuni.

Digital SAT tayyorgarlik sayti (MVP, 1-kun).

## Ishga tushirish

```bash
npm install
npm run dev
```

Brauzerda: http://localhost:3000

## Sahifalar

| Yo'l | Nima |
|---|---|
| `/` | Bosh sahifa |
| `/practice` | Question bank: bo'lim, domen, qiyinlik, holat bo'yicha filtr; A–D va Enter tugmalari; o'zbekcha/inglizcha tushuntirish |
| `/mock`, `/mock/[id]` | Mock testlar: Bluebook uslubida modullar, taymer, Mark for Review, navigator, tanaffus, taxminiy ball va savollar tahlili. Mocklar `data/mocks.json` da |
| `/mistakes` | Xatonoma: xato savollar 1, 3, 7 kundan keyin qaytadi; streak va kunlik maqsad (5 ta) |

Progress hozircha brauzerning `localStorage`'ida saqlanadi (`lib/progress.ts`). 2-kunda Supabase ulanganda faqat shu fayl ichi o'zgaradi.

## Savollar qo'shish

Barcha savollar: `data/questions.json`. Ko'plab savolni CSV yoki JSON fayldan import qilish:

```bash
npm run import -- savollar.csv --dry-run   # avval faqat tekshiradi
npm run import -- savollar.csv             # mavjudlariga qo'shadi (bir xil id bo'lsa yangilaydi)
npm run import -- savollar.json --replace  # eskilarini o'chirib, faqat yangilarini qoldiradi
```

CSV ustunlari va namunasi: `scripts/sample-import.csv`. Skript har bir qatorni tekshiradi (bo'lim, domen nomi, javob variantlar orasida ekanligi va h.k.) va xatolarini ko'rsatadi.

- `section`: `math` yoki `rw`
- `domain`: Math — `Algebra`, `Advanced Math`, `Problem-Solving and Data Analysis`, `Geometry and Trigonometry`; R&W — `Information and Ideas`, `Craft and Structure`, `Expression of Ideas`, `Standard English Conventions`
- `difficulty`: `easy` / `medium` / `hard`
- `type`: `mcq` (A–D) yoki `spr` (javobni o'zi yozadi)
- `answer`: mcq uchun `A`–`D`; spr uchun javob(lar) `|` bilan: `2.5|5/2`

## Deploy (Vercel)

1. Loyihani GitHub'ga yuklang.
2. vercel.com → New Project → repo'ni tanlang → Deploy. Sozlash kerak emas.

## Keyingi qadamlar (2–3-kun)

- [ ] Supabase: Google login, `attempts` jadvali
- [ ] Natija sahifasi va taxminiy ball
- [ ] Mobil sayqal, dark mode, ishga tushirish

## Savollar sifati

- 5 ta mock (490 savol) + 30 ta namuna + 12 ta grafikli savol = 532 ta original savol.
- Math javob kalitlari to'liq qayta yechib tekshirilgan; R&W'da grammatika, so'z ma'nosi va o'tish so'zlari savollari ko'rib chiqilgan.
- Savolga grafik qo'shish: `figure` maydoni (`lib/types.ts` dagi `Figure`). Jadval: matnda `A — B — C` qatorlari avtomatik jadvalga aylanadi.
- Matematik yozuv: `a/b`, `x^(3/2)`, `√(x + 1)` avtomatik chiroyli ko'rsatiladi.
