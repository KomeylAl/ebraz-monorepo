"use client";

import React from "react";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";

const HeroSlider = () => {
  const [sliderRef] = useKeenSlider<HTMLDivElement>(
    {
      loop: true,
      rtl: true,
      mode: "snap",
      renderMode: "performance",
      drag: false,
      slides: {
        perView: 1,
        spacing: 0,
      },
    },
    [
      (slider) => {
        let timeout: ReturnType<typeof setTimeout>;
        let mouseOver = false;

        function clearNextTimeout() {
          clearTimeout(timeout);
        }

        function nextTimeout() {
          clearTimeout(timeout);
          if (mouseOver) return;
          timeout = setTimeout(() => {
            slider.next();
          }, 5000);
        }

        slider.on("created", () => {
          slider.container.addEventListener("mouseover", () => {
            mouseOver = true;
            clearNextTimeout();
          });
          slider.container.addEventListener("mouseout", () => {
            mouseOver = false;
            nextTimeout();
          });
          nextTimeout();
        });

        slider.on("dragStarted", clearNextTimeout);
        slider.on("animationEnded", nextTimeout);
        slider.on("updated", nextTimeout);
      },
    ]
  );

  return (
    <div
      ref={sliderRef}
      className="keen-slider w-full min-h-screen overflow-hidden"
    >
      <div className="keen-slider__slide flex items-center justify-center bg-amber-500 min-h-screen text-6xl font-bold text-white">
        1
      </div>
      <div className="keen-slider__slide flex items-center justify-center bg-blue-500 min-h-screen text-6xl font-bold text-white">
        2
      </div>
      <div className="keen-slider__slide flex items-center justify-center bg-red-500 min-h-screen text-6xl font-bold text-white">
        3
      </div>
      <div className="keen-slider__slide flex items-center justify-center bg-violet-500 min-h-screen text-6xl font-bold text-white">
        4
      </div>
      <div className="keen-slider__slide flex items-center justify-center bg-green-500 min-h-screen text-6xl font-bold text-white">
        5
      </div>
      <div className="keen-slider__slide flex items-center justify-center bg-cyan-500 min-h-screen text-6xl font-bold text-white">
        6
      </div>
    </div>
  );
};

export default HeroSlider;
