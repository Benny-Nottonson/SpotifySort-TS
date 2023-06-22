import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { signOut } from "next-auth/react";
import Head from "next/head";
import Button from "../components/button";
import MyCarousel from "../components/carousel";
import BubbleBackground from "../components/background";
import BrightText from "../components/brightText";

export default function App() {
  const router = useRouter();
  const { session } = router.query;
  const [bearerToken, setBearerToken] = useState(null);
  const [playlistIDs, setPlaylistIDs] = useState([]);

  useEffect(() => {
    if (!session) {
      router.push("/");
    }
    if (session) {
      const parsedSession = JSON.parse(session as string);
      setBearerToken(parsedSession.user.accessToken);
    }
  }, [session, router]);

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        const response = await fetch(
          "https://api.spotify.com/v1/me/playlists",
          {
            headers: {
              Authorization: `Bearer ${bearerToken}`,
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          setPlaylistIDs(data.items.map((item: { id: string }) => item.id));
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

    if (bearerToken) {
      fetchPlaylists();
    }
  }, [bearerToken]);

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen py-2 overflow-x-hidden">
      <BubbleBackground />
      <BrightText />
      <Head>
        <title>Spotify Sort</title>
      </Head>
      <div>
        {bearerToken && (
          <MyCarousel playlistIDs={playlistIDs} token={bearerToken} />
        )}
      </div>
      <div className="pt-8 z-10">
        <Button image="signoutButton.png" onEvent={handleSignOut} />
      </div>
    </main>
  );
}
