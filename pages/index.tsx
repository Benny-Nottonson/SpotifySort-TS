import { useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Button from "../components/button";
import { useSession, signIn } from "next-auth/react";
import { MySession } from "@/types";
import BubbleBackground from "../components/background";
import BrightText from "../components/brightText";

interface UseSession {
  data: MySession | null;
  status: any;
}

export default function Home() {
  const { data: session }: UseSession = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session?.error === "RefreshAccessTokenError") {
      signIn("spotify", { callbackUrl: process.env.REDIRECT_URI });
    } else if (session) {
      router.push({
        pathname: "/authenticated",
        query: { session: JSON.stringify(session) },
      });
    }
  }, [session, router]);

  const handleSignIn = () => {
    signIn("spotify", { callbackUrl: process.env.REDIRECT_URI });
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen py-2 overflow-x-hidden">
      <Head>
        <title>Spotify Sort</title>
      </Head>
      <BrightText />
      <BubbleBackground />
      {!session && (
        <div className="z-50">
          <Button image={"signinButton.png"}onEvent={handleSignIn} />
        </div>
      )}
    </main>
  );
}
