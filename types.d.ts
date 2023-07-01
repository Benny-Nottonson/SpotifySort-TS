import { DefaultSession } from "next-auth";

interface MyUser {
  name?: string | null;
  email?: string | null;
  picture?: string | null;
  image?: string | null;
  accessToken?: string | null;
}

export interface MySession extends Omit<DefaultSession, "user"> {
  user?: MyUser;
  expires: string;
  error?: string;
}

export interface CarouselProps {
  playlistIDs: string[];
  token: string;
}

export interface PlaylistProp {
  playlistId: string;
  token: string;
}

interface Image {
  height: number | null;
  url: string | null;
  width: number | null;
}

type RGB = [number, number, number];
type RGBA = [number, number, number, number];
type MacbethColor = RGB;
type MacbethData = number[][];
type CCV = MacbethData;
type CoherencePair = {
  [key: number]: { alpha: number; beta: number; color: number };
};
type NumberMatrix = number[][];
type Track = { trackId: string; imageUrl: string };
type TrackWithCCV = [string, number[][]];
type CCVCollection = { label: string; ccv: number[][] };

declare module 'node-spotify-api-fetch';