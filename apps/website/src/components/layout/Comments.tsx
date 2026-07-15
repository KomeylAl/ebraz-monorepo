import React from "react";
import CommentItem from "./CommentItem";
import Link from "next/link";

const items = [
  {
    name: "مسلم زراعتکار",
    comment:
      "سلام و درود بسیار از کلینیک شما سپاسگزارم و به دوستان با اطمینان کامل پیشنهاد میکنم به کلینیک شما مراجعه کنند.",
  },
  {
    name: "Maryam",
    comment:
      "میشه گفت متفاوت ترین کلینیک. وقتی توی این کلینیک تجربه درمان داشته باشی تازه میفهمی چقدر تجربه تراپی میتونه خاص و موثر باشه.",
  },
  {
    name: "nazanin farkhani",
    comment:
      "یکی از بهترین مراکز روانشناختی که به شدت روی روان‌درمانگرانشون حساس هستند. میشه به جرات گفت این کلینیک داره در سطح استانداردهای جهانی کار میکنه که خوب با وجود دکتر علی محرابی به عنوان موسس چیز دور از ذهنی نیست. پرسنل دلسوز و مدیریت عالی کلینیک هم اگر تعریفی بشه ازشون حق مطلب ادا نمیشه باید رفت و تجربه کرد",
  },
];

function previewText(text: string, maxLength = 100) {
  if (text.length > maxLength) {
    return text.slice(0, maxLength) + "...";
  }
  return text;
}

const Comments = () => {
  return (
    <div className="w-full px-5 md:px-24 lg:px-48 py-12 space-y-6 text-center mt-10">
      <h2 className="text-3xl font-semibold">نظرات مراجعین</h2>
      <p className="text-xl">نظرات برخی از مراجعین کلینیک ابراز</p>
      <Link
        href="https://www.google.com/search?sca_esv=bff55ff221f7a59a&rlz=1C1GCEA_enIR1014IR1014&sxsrf=AE3TifPp87hi14PsBVB6gt88jMpUklQdsQ:1753514330390&uds=AOm0WdE2fekQnsyfYEw8JPYozOKz9yncncpwQCf_a89vUAKSzn8hWcn0wSGg6ETcp5_4lCFnEbT4Wxbkc0KY2TNpbjLlkqpelP5lw69SuX6dATEv8sHp5Px4UT71jiNDUZVquOKdk797MnOj3SW66u4OQN64UW6WVheC-gTlfNX-Ld7pUvRnMigCiN3Cfuplgv3N5vkjDEr54EAfYxcUoppeAjCZ8T_OyQ&q=%DA%A9%D9%84%DB%8C%D9%86%DB%8C%DA%A9+%D8%AA%D8%AE%D8%B5%D8%B5%DB%8C+%D9%85%D8%B4%D8%A7%D9%88%D8%B1%D9%87+%D9%88+%D8%B1%D9%88%D8%A7%D9%86%D8%AF%D8%B1%D9%85%D8%A7%D9%86%DB%8C+%D8%A7%D8%A8%D8%B1%D8%A7%D8%B2+%D9%86%D8%B8%D8%B1%D8%A7%D8%AA&si=AMgyJEtREmoPL4P1I5IDCfuA8gybfVI2d5Uj7QMwYCZHKDZ-E88UqeJemLb5XyAVTGKxA4X7F1Xw9mkhuj9XookbafVSxjjxBQ3-qSbUGizt3ZapudusuB4zKQXLJSsAKCSvqTvxoEwfadZpc8DtZecgXqP7Mk7wDSuIvRiOSvJKCSxL_iEWjpAxxiRRWPt448MaZnd8D3mtfZLiHjW9VKLj8pbE1b14aA%3D%3D&hl=fa-IT&sa=X&ved=2ahUKEwjR1ZX2_dmOAxVOiv0HHUnZBzMQ_4MLegQIRxAN&biw=1724&bih=826&dpr=1"
        className="text-blue-500"
        target="_blanck"
      >
        مرور های گوگل
      </Link>
      <div className="w-full flex flex-wrap items-center justify-center gap-5 mt-5">
        {items.map((items: any, index: any) => (
          <CommentItem
            key={index}
            name={items.name}
            comment={previewText(items.comment, 130)}
          />
        ))}
      </div>
    </div>
  );
};

export default Comments;
