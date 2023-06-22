import React, { useRef } from "react";
import {
  Carousel,
  CarouselControllerHandle,
} from "react-configurable-carousel";
import Playlist from "./playlist";
import { CarouselProps } from "@/types";
import Arrow from "./arrow";

const ArrowPrev = React.memo(({ onClick }: { onClick: () => void }) => (
  <div className="absolute top-1/2 left-2 transform -translate-y-1/2 carousel-arrow left z-50 text-black hover:scale-110 duration-300">
    <Arrow onEvent={onClick} lr={false} />
  </div>
));
ArrowPrev.displayName = "ArrowPrev";

const ArrowNext = React.memo(({ onClick }: { onClick: () => void }) => (
  <div className="absolute top-1/2 right-2 transform -translate-y-1/2 carousel-arrow right z-50 text-black hover:scale-110 duration-300">
    <Arrow onEvent={onClick} lr={true} />
  </div>
));
ArrowNext.displayName = "ArrowNext";

const MyCarousel = ({ playlistIDs, token }: CarouselProps) => {
  const controllerRef = useRef<CarouselControllerHandle>(null);
  const blur = ["ease-out", "duration-500", "blur"];

  const handlePrev = () => {
    const carousel = document.querySelector(".car");
    if (carousel) {
      blur.forEach((className) => carousel.classList.add(className));
      setTimeout(() => {
        blur.forEach((className) => carousel.classList.remove(className));
      }, 300);
    }
    if (controllerRef.current) {
      controllerRef.current.shiftLeft();
    }
  };

  const handleNext = () => {
    const carousel = document.querySelector(".car");
    if (carousel) {
      blur.forEach((className) => carousel.classList.add(className));
      setTimeout(() => {
        blur.forEach((className) => carousel.classList.remove(className));
      }, 300);
    }
    if (controllerRef.current) {
      controllerRef.current.shiftRight();
    }
  };

  const slides = [...playlistIDs];
  const isMobile = window.innerWidth < 768;

  return (
    <div className="relative w-screen mt-24">
      <ArrowPrev onClick={handlePrev} />
      <ArrowNext onClick={handleNext} />
      <div className="text-center w-auto relative z-0 car duration-300 ease-in-out">
        {isMobile && (
          <Carousel
            arrows={false}
            dotsNavigation={false}
            width="100%"
            height="100%"
            carouselStyle="3d"
            ref={controllerRef}
            outOfFocusDarken={true}
          >
            {slides.map((playlistId, index) => (
              <div key={index}>
                <Playlist playlistId={playlistId} token={token} />
              </div>
            ))}
          </Carousel>
        )}
        {!isMobile && (
          <Carousel
            arrows={false}
            dotsNavigation={false}
            width="100%"
            height="100%"
            carouselStyle="3d"
            ref={controllerRef}
            outOfFocusDarken={true}
          >
            {slides.map((playlistId, index) => (
              <div key={index}>
                <Playlist playlistId={playlistId} token={token} />
              </div>
            ))}
          </Carousel>
        )}
      </div>
    </div>
  );
};

export default MyCarousel;
