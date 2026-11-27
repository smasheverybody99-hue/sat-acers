import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = { title: "Maxfiylik siyosati — SAT Acers" };

export default function PrivacyPage() {
  return (
    <LegalPage title="Maxfiylik siyosati" updated="27-noyabr, 2026">
      <p>
        SAT Acers — Digital SAT'ga tayyorlanish uchun bepul sayt. Bu sahifa qaysi ma'lumotlarni saqlashimiz va ular
        bilan nima qilishimizni tushuntiradi.
      </p>

      <h2>Qanday ma'lumot saqlanadi</h2>
      <ul>
        <li>
          <b>Akkauntsiz foydalansangiz:</b> javoblaringiz, Xatonoma, streak va mock natijalari faqat brauzeringizda
          (localStorage) saqlanadi. Ular bizga yuborilmaydi.
        </li>
        <li>
          <b>Email yoki Google orqali kirsangiz:</b> email manzilingiz, Google akkauntidagi ismingiz va yuqoridagi
          mashq ma'lumotlari bulutda saqlanadi, shunda ular barcha qurilmalaringizda bir xil bo'ladi.
        </li>
      </ul>
      <p>
        Google orqali kirganda biz faqat ismingiz, email manzilingiz va profil rasmingizni olamiz. Google
        Drive, kontaktlar yoki boshqa ma'lumotlaringizga kirmaymiz.
      </p>

      <h2>Ma'lumotlar qayerda turadi</h2>
      <p>
        Akkaunt va mashq ma'lumotlari Supabase xizmatida saqlanadi. Sayt Vercel'da joylashgan. Har bir foydalanuvchi
        faqat o'z ma'lumotlarini ko'ra oladi.
      </p>

      <h2>Nima qilmaymiz</h2>
      <ul>
        <li>Ma'lumotlaringizni sotmaymiz va reklama uchun bermaymiz.</li>
        <li>Reklama yoki kuzatuv cookie'larini ishlatmaymiz.</li>
        <li>Sizga reklama xatlari yubormaymiz. Faqat siz so'ragan kirish havolasi yuboriladi.</li>
      </ul>

      <h2>Ma'lumotni o'chirish</h2>
      <p>
        Akkauntingiz va undagi barcha ma'lumotlarni o'chirish uchun{" "}
        <a href="mailto:inomovhusan5@gmail.com">inomovhusan5@gmail.com</a> manziliga yozing. 7 kun ichida
        o'chiramiz. Brauzerdagi ma'lumotlarni sayt ma'lumotlarini tozalash orqali o'zingiz o'chira olasiz.
      </p>

      <h2>Bog'lanish</h2>
      <p>
        Savollar bo'lsa: <a href="mailto:inomovhusan5@gmail.com">inomovhusan5@gmail.com</a>
      </p>
    </LegalPage>
  );
}
