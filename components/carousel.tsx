import React, { useState } from 'react';
import { Carousel } from 'react-responsive-carousel';
import "react-responsive-carousel/lib/styles/carousel.min.css";
import Playlist from './playlist';
import slideAnimationHandler from './slideanimation';

const MyCarousel = ({ playlistIDs, token }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  return (
    <div className="relative overflow-hidden">
      <div className="flex items-center justify-center mb-4">
        <Carousel
          showArrows={true}
          onChange={setCurrentSlide}
          selectedItem={currentSlide}
          animationHandler={slideAnimationHandler}
          showThumbs={false}
          showIndicators={false}
          showStatus={false}
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
