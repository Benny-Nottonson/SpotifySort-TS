import React, { useRef, useEffect } from "react";
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

  const handlePrev = () => {
    if (controllerRef.current) {
      controllerRef.current.shiftLeft();
    }
  };

  const handleNext = () => {
    if (controllerRef.current) {
      controllerRef.current.shiftRight();
    }
  };

  useEffect(() => {
    if (controllerRef.current) {
      controllerRef.current.shiftRight();
    }
  }, []);

  const slides = [...playlistIDs];

  return (
    <div className="relative w-screen mt-24">
      <ArrowPrev onClick={handlePrev} />
      <ArrowNext onClick={handleNext} />
      <div className="text-center w-auto relative z-0 car duration-300 ease-in-out">
        <Carousel
          arrows={false}
          dotsNavigation={false}
          width="100%"
          height="100%"
          carouselStyle="3d"
          ref={controllerRef}
          outOfFocusDarken={false}
        >
          {slides.map((playlistId, index) => (
            <div key={index}>
              {index === 0 || index === 1 || index === slides.length - 1 ? (
                <Playlist playlistId={playlistId} token={token} />
              ) : (
                <React.Suspense fallback={<div>Loading...</div>}>
                  <Playlist playlistId={playlistId} token={token} />
                </React.Suspense>
              )}
            </div>
          ))}
        </Carousel>
      </div>
    </div>
  );
};

export default MyCarousel;
