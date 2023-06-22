import React from "react";
import Image from "next/image";

interface ButtonProps {
  onEvent?: () => void;
  image: string;
}

const Button: React.FC<ButtonProps> = React.memo(({ onEvent, image }) => {
  return (
    <button
      className="hover:scale-110 duration-500 ease-in-out my-2 px-4"
      onClick={onEvent}
    >
      <Image src={`/${image}`} alt="button" width={140} height={30} />
    </button>
  );
});
Button.displayName = "Button";

export default Button;
