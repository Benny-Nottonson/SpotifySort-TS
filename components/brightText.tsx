import React from "react";
import Image from "next/image";

const BrightText = ({ }) => {
  return (
    <div className="z-50 absolute top-52 left-1/2 transform -translate-x-1/2 -translate-y-1/2 mix-blend-difference">
        <Image
            src='/titleImage.png'
            alt="titleImage"
            width={500}
            height={100}
        />
    </div>
  );
};

export default BrightText;
