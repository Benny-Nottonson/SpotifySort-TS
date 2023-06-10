import { useEffect, useState } from 'react';

const PlaylistComponent = ({ token, playlistId }) => {
  const [playlist, setPlaylist] = useState(null);

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
    return <div>Loading playlist...</div>;
  }

  const { images, tracks, duration_ms } = playlist;
  const playlistImage = images && images.length > 0 ? images[0].url : null;
  const firstFiveSongs = tracks && tracks.items.slice(0, 5).map((item) => item.track.name);

  return (
    <div>
      {playlistImage && <img src={playlistImage} alt="Playlist" />}
      <ul>
        {firstFiveSongs.map((song, index) => (
          <li key={index}>{song}</li>
        ))}
      </ul>
      <p>Playlist Length: {Math.floor(duration_ms / 60000)} minutes</p>
      <button onClick={sortPlaylist}>Sort Playlist</button>
    </div>
  );
};

export default PlaylistComponent;
