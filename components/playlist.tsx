import React, { useEffect, useState } from "react";
import Image from "next/image";
import sortPlaylist from "@/utils/sortPlaylist";
import { PlaylistProp } from "@/types";

const PlaylistComponent = ({ token, playlistId }: PlaylistProp) => {
  const [playlist, setPlaylist] = useState<any>(null);
  const [isSorting, setIsSorting] = useState(false);
  const maxCharacters = 25;

  useEffect(() => {
    const fetchPlaylist = async () => {
      if (!playlistId) {
        return;
      }

      try {
        const response = await fetch(
          `https://api.spotify.com/v1/playlists/${playlistId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          setPlaylist(data);
        } else {
          console.error(
            "Error fetching playlist:",
            response.status,
            response.statusText
          );
        }
      } catch (error) {
        console.error("Error fetching playlist:", error);
      }
    };

    fetchPlaylist();
  }, [token, playlistId]);

  const handleSortPlaylist = async () => {
    if (isSorting) {
      return;
    }

    setIsSorting(true);
    await sortPlaylist(playlistId, token);
    setIsSorting(false);
  };

  if (!playlist) {
    return <div className="h-64 m-3" />;
  }

  const { images, tracks } = playlist;
  const playlistImage = images && images.length > 0 ? images[0].url : null;
  const firstThreeSongs = tracks?.items
    .slice(0, 3)
    .map((item: { track: any }) => item.track);

  const songCount: number = tracks?.items.length;
  const playlistTitle: string = playlist.name;

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) {
      return text;
    }
    return `${text.slice(0, maxLength - 3)}...`;
  };

  const isMobile = window.innerWidth < 768;

  if (!isMobile) {
    return (
      <div className="flex items-center justify-center w-auto">
        <div className="p-4 pb-3 block w-[55vh] rounded-3xl perspective-800 rotate-y-2 ease-in backdrop-blur-2xl bg-white/5 tracking-wide">
          <div className="flex">
            {playlistImage && (
              <>
                <div className="flex-col">
                  <div className="relative h-48 w-48 mr-4 rounded-full perspective-800 rotate-y-8 transition-transform duration-300">
                    <Image
                      src={playlistImage}
                      alt="Playlist"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      fill
                      priority
                      style={{ objectFit: "fill" }}
                      className="rounded-md opacity-90"
                    />
                  </div>
                  <div className="grid float-left">
                    <p className="text-gray-400 text-base mt-2 text-left">
                      {songCount} songs
                    </p>
                    <p className="text-gray-200 text-lg text-left">
                      {playlistTitle}
                    </p>
                  </div>
                </div>
              </>
            )}
            <div className="flex flex-col justify-between">
              <div>
                <ul className="text-black/80 space-y-1 text-left">
                  {firstThreeSongs.map((song: any) => (
                    <React.Fragment key={song.id}>
                      <li className="truncate text-gray-200 text-base">
                        {truncateText(song.name, maxCharacters)} -
                      </li>
                      <li className="text-gray-400 text-lg">
                        {truncateText(
                          song.artists
                            .map((artist: any) => artist.name)
                            .join(", "),
                          maxCharacters
                        )}
                      </li>
                    </React.Fragment>
                  ))}
                </ul>
              </div>
              <div className="flex justify-end items-end mt-4">
                <button
                  className={`float-right ml-36 duration-500 ease-in-out hover:scale-110 rounded-lg brightness-110 ${
                    isSorting ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                  onClick={handleSortPlaylist}
                  disabled={isSorting}
                >
                  <Image
                    src="/sortButton.png"
                    alt="sort button"
                    width={130}
                    height={40}
                    priority
                  />
                </button>
              </div>
            </div>
            <Image
              src="/card.png"
              fill
              priority
              style={{ objectFit: "fill" }}
              className="brightness-110 -z-20"
              alt="card"
            />
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div className="flex items-center justify-center w-auto">
        <div className="p-4 block h-[80vw] w-[50vw] rounded-3xl perspective-800 rotate-y-2 ease-in backdrop-blur-2xl tracking-wide">
          {playlistImage && (
            <div className="flex flex-col items-center">
              <div className="relative h-36 w-36 rounded-full perspective-800 rotate-y-8 transition-transform duration-300">
                <Image
                  src={playlistImage}
                  alt="Playlist"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  fill
                  priority
                  style={{ objectFit: "fill" }}
                  className="rounded-md opacity-90"
                />
              </div>
              <div className="mt-1 -space-y-1">
                <p className="text-gray-400 text-sm">{songCount} songs</p>
                <p className="text-gray-200 text-md pb-4">{playlistTitle}</p>
              </div>
              <div className="align-bottom">
                <button
                  className={`duration-500 pt-4 ease-in-out hover:scale-110 rounded-lg brightness-110 ${
                    isSorting ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                  onClick={handleSortPlaylist}
                  disabled={isSorting}
                >
                  <Image
                    src="/sortButton.png"
                    alt="sort button"
                    width={130}
                    height={40}
                    priority
                  />
                </button>
              </div>
            </div>
          )}
          <Image
            src="/cardMobile.png"
            fill
            priority
            style={{ objectFit: "fill" }}
            className="brightness-110 -z-20"
            alt="mobileCard"
          />
        </div>
      </div>
    );
  }
};

export default PlaylistComponent;
