import Spline from "@/customSpline/react-spline";
import Image from "next/image";

const BubbleBackground = () => {
  const scene = "https://prod.spline.design/RBSwFfmfPdDv-eOh/scene.splinecode";
  return (
    <>
      <div className="-z-50 absolute w-screen h-screen">
        <Image
          src="/titlePreloadedImage.png"
          alt="title preloaded image"
          fill
          style={{ objectFit: "cover" }}
        />
      </div>
      <div className="-z-1 absolute w-screen h-screen">
        <Spline scene={scene} />
      </div>
    </>
  );
};

export default BubbleBackground;
