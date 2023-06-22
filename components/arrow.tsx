import React from "react";
import Image from "next/image";

interface ArrowProps {
  onEvent?: () => void;
  lr: boolean;
}

const Arrow: React.FC<ArrowProps> = ({ onEvent, lr }) => {
    const image = lr ? "arrowR.png" : "arrowL.png";
  return (
    <button
      className={
        "hover:scale-110 duration-500 ease-in-out my-2 px-4"
      }
      onClick={onEvent}
    >
      <Image 
        src={'/' + image}
        alt="arrow"
        width={40}
        height={40}
      />
    </button>
  );
};

export default Arrow;
