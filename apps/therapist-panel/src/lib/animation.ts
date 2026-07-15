import gsap from "gsap";

export const animatePageIn = () => {
  const banner = document.getElementById("banner");

  if (banner) {
    const tl = gsap.timeline();

    tl.to(banner, {
      opacity: 0,
      duration: 0.8,
      ease: "power2.out",
      onComplete: () => {
        banner.style.display = "none";
      },
    });
  }
};

export const animatePageOut = () => {
  const banner = document.getElementById("banner");

  if (banner) {
    return new Promise<void>((resolve) => {
      banner.style.display = "flex";
      const tl = gsap.timeline();

      tl.fromTo(
        banner,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.8,
          ease: "power2.inOut",
          onComplete: resolve,
        }
      );
    });
  }

  return Promise.resolve();
};
