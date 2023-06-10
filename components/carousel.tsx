import React, { useRef } from "react";
import {
	Carousel,
	CarouselControllerHandle,
} from "react-configurable-carousel";
import Playlist from "./playlist";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { CarouselProps } from "@/types/types";

const ArrowPrev = ({ onClick }: { onClick: () => void }) => (
	<button
		className="absolute top-1/2 left-2 transform -translate-y-1/2 carousel-arrow left z-50 text-black hover:scale-110 duration-300"
		onClick={onClick}
	>
		<ArrowLeft size={32} />
	</button>
);

const ArrowNext = ({ onClick }: { onClick: () => void }) => (
	<button
		className="absolute top-1/2 right-2 transform -translate-y-1/2 carousel-arrow right z-50 text-black hover:scale-110 duration-300"
		onClick={onClick}
	>
		<ArrowRight size={32} />
	</button>
);

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

	const slides = [...playlistIDs];

	return (
		<div className="relative w-screen">
			<ArrowPrev onClick={handleNext} />
			<ArrowNext onClick={handlePrev} />
			<div className="text-center w-auto relative z-0">
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
			</div>
		</div>
	);
};

export default MyCarousel;
