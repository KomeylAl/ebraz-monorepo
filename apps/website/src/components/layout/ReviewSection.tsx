"use client";

import React, { useState } from "react";
import { Star, MessageCircle, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import Input from "@/components/common/Input";
import Label from "@/components/common/Label";

// Mock data for approved reviews
const mockReviews = [
  {
    id: 1,
    name: "احمد محمدی",
    rating: 5,
    text: "تجربه بسیار خوبی داشتم. درمانگر بسیار حرفه‌ای و دلسوز بود.",
    date: "۱۴۰۲/۱۰/۱۵",
    isAnonymous: false,
  },
  {
    id: 2,
    name: "نام‌نشناس",
    rating: 4,
    text: "خدمات فوق‌العاده بود و کاملا راضی منتظم شدم.",
    date: "۱۴۰۲/۱۰/۱۲",
    isAnonymous: true,
  },
  {
    id: 3,
    name: "فاطمه احمدی",
    rating: 5,
    text: "بهترین انتخاب برای مشاوره. توصیه می‌کنم برای همه.",
    date: "۱۴۰۲/۱۰/۰۸",
    isAnonymous: false,
  },
];

interface ReviewFormData {
  name: string;
  phone: string;
  rating: number;
  text: string;
  isAnonymous: boolean;
}

const ReviewSection = ({ doctorId }: { doctorId: string }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState<ReviewFormData>({
    name: "",
    phone: "",
    rating: 5,
    text: "",
    isAnonymous: false,
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleRatingChange = (newRating: number) => {
    setFormData((prev) => ({
      ...prev,
      rating: newRating,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.phone.trim()) {
      alert("شماره موبایل الزامی است.");
      return;
    }
    // TODO: Connect to API
    console.log("Submitting review:", formData);
    alert("نظر شما با موفقیت ارسال شد و در انتظار تایید است.");
    setFormData({
      name: "",
      phone: "",
      rating: 5,
      text: "",
      isAnonymous: false,
    });
    setIsFormOpen(false);
  };

  const calculateAverageRating = () => {
    if (mockReviews.length === 0) return 0;
    const total = mockReviews.reduce((acc, review) => acc + review.rating, 0);
    return (total / mockReviews.length).toFixed(1);
  };

  const StarRating = ({
    rating,
    onChange,
    interactive = false,
  }: {
    rating: number;
    onChange?: (rating: number) => void;
    interactive?: boolean;
  }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => interactive && onChange?.(star)}
          className={`transition-all ${
            interactive ? "cursor-pointer hover:scale-110" : "cursor-default"
          }`}
          disabled={!interactive}
        >
          <Star
            size={20}
            className={`${
              star <= rating
                ? "fill-beige text-beige"
                : "text-gray-300"
            }`}
          />
        </button>
      ))}
    </div>
  );

  return (
    <section className="w-full space-y-6 py-10">
      {/* Reviews Header */}
      <div className="w-full">
        <h2 className="text-2xl md:text-3xl font-bold mb-2 flex items-center gap-2">
          <MessageCircle className="w-7 h-7 text-primary" />
          نظرات و امتیازات
        </h2>
        <p className="text-gray-600">
          نظرات دیگران درباره این متخصص را مطالعه کنید یا خود نظر خود را با ما
          شریک کنید.
        </p>
      </div>

      {/* Stats and Add Review Button */}
      <div className="w-full flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white/30 border border-gray-300 rounded-md p-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold text-primary">
              {calculateAverageRating()}
            </span>
            <div className="flex flex-col gap-1">
              <StarRating rating={Math.round(parseFloat(calculateAverageRating()))} />
              <p className="text-sm text-gray-600">
                {mockReviews.length} نظر تایید شده
              </p>
            </div>
          </div>
        </div>

        <Button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="w-full md:w-auto bg-primary hover:bg-primary/90 text-white"
        >
          {isFormOpen ? "بستن فرم" : "نوشتن نظر"}
        </Button>
      </div>

      {/* Review Form */}
      {isFormOpen && (
        <div className="w-full bg-white/30 border border-gray-300 rounded-md p-6 space-y-4">
          <h3 className="text-lg font-semibold mb-4">نوشتن نظر جدید</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Anonymous Checkbox */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isAnonymous"
                name="isAnonymous"
                checked={formData.isAnonymous}
                onChange={handleInputChange}
                className="w-4 h-4 rounded cursor-pointer"
              />
              <label htmlFor="isAnonymous" className="cursor-pointer text-sm">
                نظر ناشناس
              </label>
            </div>

            {/* Name (Optional if Anonymous) */}
            {!formData.isAnonymous && (
              <div>
                <Label htmlFor="name">نام و نام خانوادگی (اختیاری)</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="نام و نام خانوادگی"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="mt-1"
                />
              </div>
            )}

            {/* Phone (Required) */}
            <div>
              <Label htmlFor="phone">شماره موبایل *</Label>
              <Input
                id="phone"
                name="phone"
                placeholder="شماره موبایل"
                value={formData.phone}
                onChange={handleInputChange}
                className="mt-1"
                required
              />
            </div>

            {/* Rating */}
            <div>
              <Label>امتیاز *</Label>
              <div className="mt-2">
                <StarRating
                  rating={formData.rating}
                  onChange={handleRatingChange}
                  interactive
                />
              </div>
            </div>

            {/* Review Text */}
            <div>
              <Label htmlFor="text">نظر شما *</Label>
              <textarea
                id="text"
                name="text"
                placeholder="نظر خود را بنویسید..."
                value={formData.text}
                onChange={handleInputChange}
                className="w-full mt-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                rows={4}
                required
              />
            </div>

            {/* Submit Button */}
            <div className="flex gap-2">
              <Button
                type="submit"
                className="flex-1 bg-primary hover:bg-primary/90 text-white"
              >
                ارسال نظر
              </Button>
              <Button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800"
              >
                انصراف
              </Button>
            </div>

            <p className="text-xs text-gray-600">
              * نظرات پس از تایید در سایت نمایش داده می‌شوند.
            </p>
          </form>
        </div>
      )}

      {/* Reviews List */}
      <div className="w-full space-y-4">
        {mockReviews.length > 0 ? (
          mockReviews.map((review) => (
            <div
              key={review.id}
              className="w-full bg-white/30 border border-gray-300 rounded-md p-6 space-y-3 hover:shadow-md transition-shadow"
            >
              {/* Header with Name and Date */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-shelfish flex items-center justify-center text-white">
                    <User size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">
                      {review.name}
                    </p>
                    {review.isAnonymous && (
                      <p className="text-xs text-gray-500">نظر ناشناس</p>
                    )}
                  </div>
                </div>
                <p className="text-xs text-gray-500">{review.date}</p>
              </div>

              {/* Rating */}
              <div>
                <StarRating rating={review.rating} />
              </div>

              {/* Review Text */}
              <p className="text-gray-700 leading-relaxed text-justify">
                {review.text}
              </p>
            </div>
          ))
        ) : (
          <div className="w-full bg-white/30 border border-gray-300 rounded-md p-6 text-center text-gray-600">
            هنوز نظری ثبت نشده است. شما می‌توانید اولین نظر را بنویسید.
          </div>
        )}
      </div>
    </section>
  );
};

export default ReviewSection;
