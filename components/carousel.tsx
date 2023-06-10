import React, { useState } from 'react';
import { Carousel } from 'react-responsive-carousel';
import "react-responsive-carousel/lib/styles/carousel.min.css";
import Playlist from './playlist';
import slideAnimationHandler from './slideanimation';

const MyCarousel = ({ playlistIDs, token }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const handlePrev = () => {
    setCurrentSlide((prevSlide) => (prevSlide === 0 ? playlistIDs.length - 1 : prevSlide - 1));
  };

  const handleNext = () => {
    setCurrentSlide((prevSlide) => (prevSlide === playlistIDs.length - 1 ? 0 : prevSlide + 1));
  };

  return (
    <div className="relative overflow-hidden">
      <div className="flex items-center justify-center mb-4">
        <div className="carousel-buttons">
          <button className="carousel-button" onClick={handlePrev}>
            Previous
          </button>
          <button className="carousel-button" onClick={handleNext}>
            Next
          </button>
        </div>
        <Carousel
          showArrows={false}
          onChange={setCurrentSlide}
          selectedItem={currentSlide}
          animationHandler={slideAnimationHandler}
          showThumbs={false}
          showIndicators={false}
          showStatus={false}
          renderArrowPrev={() => null}
          renderArrowNext={() => null}
        >
          {playlistIDs.map((playlistId, index) => (
            <div key={index}>
              {currentSlide === index && (
                <Playlist playlistId={playlistId} token={token} />
              )}
            </div>
          ))}
        </Carousel>
      </div>
    </div>
  );
};

export default MyCarousel;
