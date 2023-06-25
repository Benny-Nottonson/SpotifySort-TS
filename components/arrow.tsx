import React from "react";

interface ArrowProps {
  onEvent?: () => void;
  lr: boolean;
}

const Arrow: React.FC<ArrowProps> = React.memo(({ onEvent, lr }) => {
  return (
    <button
      className="hover:scale-110 duration-500 ease-in-out my-2 px-4"
      onClick={onEvent}
    >
      <div
        className={
          "bg-gradient-to-br from-green-700 to-blue-600/50 via-teal-600/60 w-8 h-8 opacity-80 rounded-full"
        }
      >
      <div className="flex justify-center items-center h-full">
        {lr ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            fill="currentColor"
            viewBox="0 0 16 16"
          >
            <path
              fillRule="evenodd"
              d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            fill="currentColor"
            viewBox="0 0 16 16"
          >
            <path
              fillRule="evenodd"
              d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"
            />
          </svg>
        )}
        </div>
      </div>
    </button>
  );
});
Arrow.displayName = "Arrow";

export default Arrow;
