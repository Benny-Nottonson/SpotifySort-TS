import SpotifyWebApi from "spotify-web-api-node";
import getCCV, { ccvDistance } from "./imageProcessing";
import { Track, TrackWithCCV, CCVCollection } from "@/types";

const imageSize = 32;

export default async function sortPlaylist(
  playlistId: string,
  bearerToken: string
) {
  const spotifyApi = new SpotifyWebApi();
  spotifyApi.setAccessToken(bearerToken);
  const data = await spotifyApi.getPlaylist(playlistId);
  const tracks = data.body.tracks.items;
  const trackIdWithImage: Track[] = tracks.map((track) => {
    if (!track.track) {
      throw new Error("Track is undefined");
    }
    const trackId = track.track.id;
    const imageUrl = track.track.album.images[0].url;
    return { trackId, imageUrl };
  });
  const trackIdWithCcv: TrackWithCCV[] = await Promise.all(
    trackIdWithImage.map(async (track) => {
      const trackId = track.trackId;
      const ccv = await getCCV(track.imageUrl, imageSize);
      return [trackId, ccv] as [string, number[][]];
    })
  );
  const sortedLoop = ccvSort(trackIdWithCcv);
  await spotifyApi.removeTracksFromPlaylist(
    playlistId,
    tracks.map((track) => {
      return { uri: track.track!.uri };
    })
  );
  await spotifyApi.addTracksToPlaylist(
    playlistId,
    sortedLoop.map((trackId) => {
      return `spotify:track:${trackId}`;
    })
  );
}

function ccvSort(trackIdWithCcv: TrackWithCCV[]) {
  const ccvCollection = trackIdWithCcv.map((track) => {
    return { label: track[0], ccv: track[1] };
  });
  const sortedCollection = sortCCVsByDistance(ccvCollection);
  return sortedCollection;
}

function sortCCVsByDistance(ccvCollection: CCVCollection[]): string[] {
  const numCCVs = ccvCollection.length;
  const distanceMatrix: number[][] = [];
  for (let i = 0; i < numCCVs; i++) {
    const distances: number[] = [];
    for (let j = 0; j < numCCVs; j++) {
      if (i === j) {
        distances.push(0);
      } else {
        const distance = ccvDistance(
          ccvCollection[i].ccv,
          ccvCollection[j].ccv
        );
        distances.push(distance);
      }
    }
    distanceMatrix.push(distances);
  }

  const tspResult = solveTSP(distanceMatrix);

  const sortedCCVs = tspResult.map((index) => ccvCollection[index].label);

  return sortedCCVs;
}

function solveTSP(distanceMatrix: number[][]): number[] {
  const numVertices = distanceMatrix.length;
  const initialSolution = [0];
  for (let i = 1; i < numVertices; i++) {
    initialSolution.push(i);
  }
  let bestSolution = initialSolution.slice();
  let bestDistance = getTotalDistance(bestSolution, distanceMatrix);
  let improved = true;
  while (improved) {
    improved = false;
    for (let i = 0; i < numVertices - 1; i++) {
      for (let j = i + 1; j < numVertices; j++) {
        const newSolution = opt2Swap(bestSolution, i, j);
        const newDistance = getTotalDistance(newSolution, distanceMatrix);
        if (newDistance < bestDistance) {
          bestSolution = newSolution;
          bestDistance = newDistance;
          improved = true;
        }
      }
    }
  }
  return bestSolution;
}

function opt2Swap(solution: number[], i: number, j: number): number[] {
  const newSolution = solution.slice();
  let k = i + 1;
  let l = j;
  while (k < l) {
    const temp = newSolution[k];
    newSolution[k] = newSolution[l];
    newSolution[l] = temp;
    k++;
    l--;
  }
  return newSolution;
}

function getTotalDistance(
  solution: number[],
  distanceMatrix: number[][]
): number {
  let distance = 0;
  const numVertices = solution.length;
  for (let i = 0; i < numVertices - 1; i++) {
    const from = solution[i];
    const to = solution[i + 1];
    distance += distanceMatrix[from][to];
  }
  distance += distanceMatrix[solution[numVertices - 1]][solution[0]];

  return distance;
}
