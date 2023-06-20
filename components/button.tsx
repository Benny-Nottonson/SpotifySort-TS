import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconProp } from "@fortawesome/fontawesome-svg-core";

interface ButtonProps {
  onEvent?: () => void;
  text: string;
  icon?: IconProp;
}

const Button: React.FC<ButtonProps> = ({ onEvent, text, icon }) => {
  return (
    <button
      className={
        "bg-green-500 hover:scale-110 duration-500 ease-in-out text-black font-bold py-2 px-4 rounded"
      }
      onClick={onEvent}
    >
      {icon && <FontAwesomeIcon icon={icon} className="pr-2" />}
      {text}
    </button>
  );
};

export default Button;
