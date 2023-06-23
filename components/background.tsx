import dynamic from "next/dynamic";
import Image from "next/image";

const BubbleBackground = () => {
  const scene = "https://prod.spline.design/RBSwFfmfPdDv-eOh/scene.splinecode";

  const Spline = dynamic(
    () => import("@/customSpline/react-spline"),
    { loading: () => <div>Loading...</div> }
  );

  return (
    <>
      <div className="-z-50 absolute w-screen h-screen">
        <Image
          src="/titlePre.png"
          alt="title image"
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
