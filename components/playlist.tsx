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
    return (
      <div className="flex items-center justify-center m-4">
        <div className="relative bg-white bg-opacity-40 border-1 border-white border-opacity-15 rounded-lg shadow-xl backdrop-filter backdrop-blur-lg p-4">
          <div className="flex">
            <div className="relative h-64 w-64 mr-4 bg-gray-200 rounded-lg" />
            <div className="flex flex-col justify-between">
              <div>
                <ul className="text-white space-y-1">
                  {[1, 2, 3].map((item) => (
                    <li
                      key={item}
                      className="truncate bg-gray-200 h-4 w-3/4 mb-1 rounded"
                    />
                  ))}
                </ul>
              </div>
              <div className="flex justify-end items-end mt-4">
                <p className="text-gray-400 text-sm">
                  Playlist Length: <br />
                  -- minutes
                </p>
                <button
                  className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-lg shadow-md ml-4"
                  disabled
                >
                  Sort Playlist
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { images, tracks } = playlist;
  const playlistImage = images && images.length > 0 ? images[0].url : null;
  const firstThreeSongs = tracks?.items
    .slice(0, 3)
    .map((item: { track: any }) => item.track);

  const songCount: number = tracks?.items.length;
  const playlistTitle: string = playlist.name;

  const isMobile = window.innerWidth < 768;

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) {
      return text;
    }
    return `${text.slice(0, maxLength - 3)}...`;
  };

  return (
    <div className="flex items-center justify-center w-auto">
      <div className="p-4 block w-[55vh] rounded-3xl perspective-800 rotate-y-2 ease-in backdrop-blur-2xl bg-white/5 tracking-wide">
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
            className="opacity-1 brightness-110 -z-20"
            alt="card"
          />
        </div>
      </div>
    </div>
  );
};

export default PlaylistComponent;
