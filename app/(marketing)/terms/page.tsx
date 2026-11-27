import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = { title: "Foydalanish shartlari — SAT Acers" };

export default function TermsPage() {
  return (
    <LegalPage title="Foydalanish shartlari" updated="27-noyabr, 2026">
      <p>SAT Acers'dan foydalanish orqali quyidagi shartlarga rozilik bildirasiz.</p>

      <h2>Xizmat</h2>
      <p>
        SAT Acers — Digital SAT'ga tayyorlanish uchun bepul mashq sayti. Savollar, mock testlar va ball baholari
        faqat mashq uchun. Ular rasmiy SAT natijasini bashorat qilmaydi.
      </p>

      <h2>Akkaunt</h2>
      <ul>
        <li>Akkauntingizga kirishni boshqalarga bermang.</li>
        <li>Saytni buzishga, boshqa foydalanuvchilarning ma'lumotlariga kirishga yoki ortiqcha yuk berishga urinmang.</li>
        <li>Bu shartlar buzilsa, akkauntni o'chirib qo'yishimiz mumkin.</li>
      </ul>

      <h2>Kontent</h2>
      <p>
        Saytdagi savollar va izohlar SAT Acers jamoasi tomonidan yozilgan. Ularni shaxsiy tayyorgarlik uchun
        bemalol ishlating, lekin ruxsatsiz boshqa saytga ko'chirmang yoki sotmang.
      </p>
      <p>
        SAT® — College Board'ning ro'yxatdan o'tgan savdo belgisi. College Board bu sayt bilan bog'liq emas va uni
        qo'llab-quvvatlamaydi.
      </p>

      <h2>Javobgarlik</h2>
      <p>
        Sayt "boricha" taqdim etiladi. Uzluksiz ishlashi yoki xatosiz bo'lishiga kafolat bermaymiz, lekin topilgan
        xatolarni tez tuzatishga harakat qilamiz.
      </p>

      <h2>O'zgarishlar</h2>
      <p>
        Shartlar o'zgarsa, shu sahifa yangilanadi. Savollar uchun:{" "}
        <a href="mailto:inomovhusan5@gmail.com">inomovhusan5@gmail.com</a>
      </p>
    </LegalPage>
  );
}
