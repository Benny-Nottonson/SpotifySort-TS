import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Playlist from './playlist';

const Carousel = ({ playlists, token }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? playlists.length - 1 : prevIndex - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex === playlists.length - 1 ? 0 : prevIndex + 1));
  };


  return (
    <div className="relative">
      <div className="flex items-center justify-center mb-4">
        <button
          className="text-gray-500 hover:text-gray-700 focus:outline-none"
          onClick={handlePrevious}
        >
          <ChevronLeft size={24} />
        </button>
        <Playlist
          token={token}
          playlistId={playlists[currentIndex]}
        />
        <button
          className="text-gray-500 hover:text-gray-700 focus:outline-none"
          onClick={handleNext}
        >
          <ChevronRight size={24} />
        </button>
      </div>
    </div>
  );
};

export default Carousel;
