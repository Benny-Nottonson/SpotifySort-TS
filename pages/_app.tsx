import { useEffect, useState } from "react";
import { SessionProvider } from "next-auth/react";
import type { AppProps } from "next/app";
import dynamic from "next/dynamic";
import "@/styles/globals.css";

const DynamicBubbleBackground = dynamic(
  () => import("../components/background"),
);

function MyApp({
  Component,
  pageProps: { session, ...restPageProps },
}: AppProps) {
  const [showBubbleBackground, setShowBubbleBackground] = useState(false);

  useEffect(() => {
    setShowBubbleBackground(true);
  }, []);

  return (
    <SessionProvider session={session}>
      {showBubbleBackground && <DynamicBubbleBackground />}
      <Component {...restPageProps} />
    </SessionProvider>
  );
}

export default MyApp;
