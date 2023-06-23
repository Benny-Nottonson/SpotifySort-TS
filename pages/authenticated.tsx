import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { signOut } from "next-auth/react";
import Head from "next/head";
import Button from "../components/button";
import MyCarousel from "../components/carousel";
import BrightText from "../components/brightText";

export default function App() {
  const router = useRouter();
  const { session } = router.query;
  const [authData, setAuthData] = useState({
    bearerToken: null,
    playlistIDs: [],
  });

  useEffect(() => {
    if (!session) {
      router.push("/");
    } else {
      const parsedSession = JSON.parse(session as string);
      setAuthData((prevState) => ({
        ...prevState,
        bearerToken: parsedSession.user.accessToken,
      }));
    }
  }, [session, router]);

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        const response = await fetch(
          "https://api.spotify.com/v1/me/playlists",
          {
            headers: {
              Authorization: `Bearer ${authData.bearerToken}`,
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          setAuthData((prevState) => ({
            ...prevState,
            playlistIDs: data.items.map((item: { id: string }) => item.id),
          }));
        } else {
          console.error(
            "Error fetching playlists:",
            response.status,
            response.statusText,
            signOut({ callbackUrl: "/" })
          );
        }
      } catch (error) {
        console.error("Error fetching playlists:", error);
      }
    };

    if (authData.bearerToken) {
      fetchPlaylists();
    }
  }, [authData.bearerToken]);

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
  };

  return (
    <>
      <Head>
        <title>Spotify Sort</title>
      </Head>
      <main className="flex flex-col items-center justify-center min-h-screen py-2 overflow-x-hidden">
        <BrightText />
        <div>
          {authData.bearerToken && (
            <MyCarousel
              playlistIDs={authData.playlistIDs}
              token={authData.bearerToken}
            />
          )}
        </div>
        <div className="pt-8 z-10">
          <Button text="Sign Out" onEvent={handleSignOut} />
        </div>
      </main>
    </>
  );
}
