"use client";

import React, { useState, useEffect } from "react";
import TransitionLink from "../ui/TransitionLink";
import { ChevronRight, ChevronLeft } from "lucide-react";

const slides = [
  {
    id: 1,
    bgImage: "/images/hero2.webp",
    title: (
      <>
        مرکز جامع تخصصی مشاوره و رواندرمانی{" "}
        <strong className="text-beige">ابراز</strong>
      </>
    ),
    subtitle: (
      <>
        با تاسیس و مدیریت <span className="text-beige">دکتر علی محرابی</span>،
        متخصص روانشناسی بالینی و عضو هیئت علمی دانشگاه اصفهان
      </>
    ),
    // buttonText: "دریافت نوبت ارزیابی اولیه رایگان",
    buttonLink: "/appointment#assessment",
    isTransitionLink: true,
  },
  {
    id: 2,
    bgImage: "/images/hero2.webp",
    title: "ارزیابی اولیه رایگان",
    subtitle:
      "به منظور تشخیص دقیق نیازهای مشاوره ای و درمانی مراجع و تعیین بهترین متخصصان حرفه ای لازم برای شما، یک مصاحبه اولیه مختصر (به صورت تلفنی و رایگان و در صورت ضرورت به صورت حضوری یا آنلاین) انجام خواهد شد.",
    buttonText: "دریافت نویت ارزیابی اولیه رایگان",
    buttonLink: "/appointment/#assessment",
    isTransitionLink: false,
  },
  {
    id: 3,
    bgImage: "/images/hero2.webp",
    title: "روانشناس آنکال",
    subtitle:
      "در صورت نیاز به گفتگوی اورژانسی با روانشناس در مواقع بسیار بحرانی، در طی ساعات کاری کلینیک (9 تا 21)، با شماره 09228728245 و در خارج از این بازه، با شماره 09939924313 تماس بگیرید تا بتوانید با روانشناس آنکال مرکز صحبت بفرمایید.",
    buttonText: "تماس با روانشناس آنکال",
    buttonLink: "tel:09228728245",
    isTransitionLink: false,
  },
];

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      !isHovered &&
        setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, [isHovered]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-black">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
            index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
          style={{
            backgroundImage: `url(${slide.bgImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="w-full min-h-screen bg-black/75 backdrop-blur-lg flex flex-col items-center justify-between pt-24 pb-10">
            <p></p>
            <div
              className={`space-y-10 px-8 flex flex-col items-center mx-auto transform transition-all duration-1000 delay-300 ${
                index === currentSlide
                  ? "translate-y-0 opacity-100"
                  : "translate-y-8 opacity-0"
              }`}
            >
              <h1
                className="text-white text-2xl lg:text-[70px] font-semibold text-center"
                onMouseEnter={() => {
                  setIsHovered(true);
                }}
                onMouseLeave={() => {
                  setIsHovered(false);
                }}
              >
                {slide.title}
              </h1>
              <p className="text-center text-white lg:text-xl max-w-4xl">
                {slide.subtitle}
              </p>
              {slide.buttonText && (
                <div className="w-full flex items-center justify-center">
                  {slide.isTransitionLink ? (
                    <TransitionLink
                      href={slide.buttonLink}
                      className="text-center text-beige py-3 rounded-md border border-beige cursor-pointer hover:bg-beige hover:text-black transition duration-200 w-46 lg:w-[408px]"
                    >
                      {slide.buttonText}
                    </TransitionLink>
                  ) : (
                    <a
                      href={slide.buttonLink}
                      className="text-center text-beige py-3 rounded-md border border-beige cursor-pointer hover:bg-beige hover:text-black transition duration-200 w-46 lg:w-[408px]"
                    >
                      {slide.buttonText}
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Scroll Down Indicator */}
            <div className="w-full flex items-center justify-center">
              <a href="#departments">
                <div className="w-5 h-12 mt-32 md:mt-10 border border-shelfish text-shelfish rounded-full animate-bounce flex items-end justify-center">
                  .
                </div>
              </a>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Buttons */}
      <button
        onClick={prevSlide}
        className="absolute top-1/2 right-4 z-10 -translate-y-1/2 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 backdrop-blur-md transition"
        aria-label="Previous slide"
      >
        <ChevronRight size={24} />
      </button>
      <button
        onClick={nextSlide}
        className="absolute top-1/2 left-4 z-10 -translate-y-1/2 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 backdrop-blur-md transition"
        aria-label="Next slide"
      >
        <ChevronLeft size={24} />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex space-x-1 space-x-reverse">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === currentSlide ? "bg-beige w-4" : "bg-white/50 w-2"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default Hero;
