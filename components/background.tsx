import Spline from '@splinetool/react-spline';
import Image from "next/image";

const BubbleBackground = () => {
  return (
    <>
    <div className='-z-50 absolute w-screen h-screen'>
      <Image
        src="/titlePreloadedImage.png"
        alt="title preloaded image"
        fill
        style={{ objectFit : "cover" }}
      ></Image>
    </div>
    <div className='-z-1 absolute w-screen h-screen'>
      <Spline scene="https://prod.spline.design/RBSwFfmfPdDv-eOh/scene.splinecode" />
    </div>
    </>
  );
};

export default BubbleBackground;
