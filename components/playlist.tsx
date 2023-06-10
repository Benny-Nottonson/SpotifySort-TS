import { useEffect, useState } from 'react';
import Image from 'next/image';

const PlaylistComponent = ({ token, playlistId }) => {
  const [playlist, setPlaylist] = useState(null);
  const maxCharacters = 15;

  useEffect(() => {
    const fetchPlaylist = async () => {
      try {
        const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setPlaylist(data);
        } else {
          console.error('Error fetching playlist:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('Error fetching playlist:', error);
      }
    };

    fetchPlaylist();
  }, [token, playlistId]);

  const sortPlaylist = () => {
    console.log('Sorting the playlist...');
  };

  if (!playlist) {
    return null;
  }

  const { images, tracks } = playlist;
  const playlistImage = images && images.length > 0 ? images[0].url : null;
  const firstFiveSongs = tracks && tracks.items.slice(0, 5).map((item) => item.track);

  const playlistDuration = tracks && tracks.items.reduce((acc, item) => acc + item.track.duration_ms, 0);
  const durationInMinutes = Math.floor(playlistDuration / 60000);

  const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) {
      return text;
    }
    return text.slice(0, maxLength - 3) + '...';
  };

  return (
    <div className="flex items-center justify-center m-4">
      <div className="relative max-w-3xl min-w-full bg-white bg-opacity-40 border-1 border-white border-opacity-15 rounded-lg shadow-xl backdrop-filter backdrop-blur-lg p-4">
        <div className="flex">
          {playlistImage && (
            <div className="relative h-64 w-64 mr-4">
              <Image src={playlistImage} alt="Playlist" fill={true} style={{objectFit:"fill"}} className="rounded-lg shadow-lg" />
            </div>
          )}
          <div className="flex flex-col justify-between">
            <div>
              <ul className="text-white space-y-1 text-left">
                {firstFiveSongs.map((song) => (
                  <li key={song.id} className="truncate">
                    {truncateText(song.name, maxCharacters)} -{' '}
                    {truncateText(song.artists.map((artist) => artist.name).join(', '), maxCharacters)}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex justify-end items-end mt-4">
              <p className="text-gray-400 text-sm">Playlist Length: <br />{durationInMinutes} minutes</p>
              <button
                className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-lg shadow-md ml-4"
                onClick={sortPlaylist}
              >
                Sort Playlist
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaylistComponent;
