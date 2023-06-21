import { useEffect, useState } from "react";
import Image from "next/image";
import sortPlaylist from "@/utils/sortPlaylist";
import { PlaylistProp } from "@/types";

const PlaylistComponent = ({ token, playlistId }: PlaylistProp) => {
  const [playlist, setPlaylist] = useState<any>(null);
  const [isSorting, setIsSorting] = useState(false);
  const maxCharacters = 15;

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
                  {[1, 2, 3, 4, 5].map((item) => (
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
  const firstFiveSongs = tracks?.items
    .slice(0, 5)
    .map((item: { track: any }) => item.track);

  
  const songCount: number = tracks?.items.length;

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) {
      return text;
    }
    return `${text.slice(0, maxLength - 3)}...`;
  };

  return (
    <div className="flex items-center justify-center w-auto">
      <div className="relative bg-blue-500/10 rounded-xl perspective-800 rotate-y-2 ease-in border border-zinc-200/50 shadow-sm">
      <div className="relative bg-white bg-opacity-40 border-1 border-white border-opacity-15 rounded-lg shadow-xl backdrop-filter backdrop-blur-lg p-4">
        <div className="flex ">
          {playlistImage && (
            <div className="relative h-64 w-64 mr-4 bg-blue-500/10 rounded-xl perspective-800 rotate-y-8 transition-transform duration-300 ease-in border border-zinc-200/50 shadow-xs">
              <Image
                src={playlistImage}
                alt="Playlist"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                fill
                priority
                style={{ objectFit: "fill" }}
                className="rounded-lg shadow-lg"
              />
            </div>
          )}
          <div className="flex flex-col justify-between">
            <div>
              <ul className="text-black/80 space-y-1 text-left">
                {firstFiveSongs.map((song: any) => (
                  <li key={song.id} className="truncate">
                    {truncateText(song.name, maxCharacters)} -{" "}
                    {truncateText(
                      song.artists.map((artist: any) => artist.name).join(", "),
                      maxCharacters
                    )}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex justify-end items-end mt-4">
              <p className="text-gray-600 text-sm">
                Playlist Length: <br />
                {songCount} songs
              </p>
              <button
                  className={`px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-lg shadow-md ml-4 ${
                    isSorting ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  onClick={handleSortPlaylist}
                  disabled={isSorting}
                >
                  {isSorting ? (
                    <svg
                      className="animate-spin h-5 w-5 text-green-500 mr-2"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647zm10 3.647A7.962 7.962 0 0020 12h-4a7.962 7.962 0 01-3 7.938l3-2.647zm-6-9.578V2.362C9.973 2.135 10.978 2 12 2c4.411 0 8 3.589 8 8h-2c0-3.859-3.14-7-7-7z"
                      ></path>
                    </svg>
                  ) : (
                    "Sort Playlist"
                  )}
                </button>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default PlaylistComponent;
