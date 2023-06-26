import { useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { useSession, signIn } from "next-auth/react";
import { MySession } from "@/types";
import BrightText from "@/components/brightText";
import Button from "@/components/button";

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
    <>
      <Head>
        <title>Spotify Sort</title>
        <meta name="description" content="Spotify Sort" />
      </Head>
      <main className="flex flex-col items-center justify-center min-h-screen py-2 overflow-x-hidden">
        <BrightText />
        {!session && (
          <div className="z-50">
            <Button text={"Sign In"} onEvent={handleSignIn} />
          </div>
        )}
      </main>
    </>
  );
}
