# SpotifySort

[![Website](https://img.shields.io/website?label=Check%20it%20out&style=flat-square&url=https%3A%2F%2Fspotifysort.vercel.app)](https://spotifysort.vercel.app)
[![GitHub license](https://img.shields.io/github/license/benny-nottonson/spotifysort?style=flat-square)](https://github.com/benny-nottonson/spotifysort/blob/master/LICENSE.md)
[![GitHub stars](https://img.shields.io/github/stars/benny-nottonson/spotifysort?style=flat-square)](https://github.com/benny-nottonson/spotifysort/stargazers)
[![GitHub issues](https://img.shields.io/github/issues/benny-nottonson/spotifysort?style=flat-square)](https://github.com/benny-nottonson/spotifysort/issues)

> A playlist sorter for Spotify based on color coherence vectors and linear algebra.

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Technologies](#technologies)
- [Setup](#setup)
- [Usage](#usage)

## Introduction

SpotifySort is a web application that allows users to log in with their Spotify accounts, select any of their playlists, and sort them based on color. The color sorting algorithm utilizes color coherence vectors (CCVs) and linear algebra to determine the distance between different images, specifically using cosine distance and vectors.

The main goal of this project is to provide a unique and visually appealing way to organize and explore Spotify playlists. By sorting playlists based on color, users can easily group songs with similar visual characteristics together, adding a new dimension to the way they interact with their music collections.

## Features

- Log in with Spotify account
- Fetch and display user's playlists
- Sort playlists based on color coherence vectors
- Display sorted playlists with image previews
- Responsive design for various screen sizes

## Technologies

The project was built using the following technologies:

- **NextJS**: A React framework for building server-side rendered (SSR) and static websites.
- **Spotify Web API**: Used to authenticate users and retrieve playlist data.
- **CCV (Color Coherence Vector)**: A computer vision library that provides the color sorting algorithm.
- **Linear Algebra Libraries**: Utilized for vector calculations and distance measurements.
- **CSS Modules**: Used for modular and scoped CSS styling.

## Setup

To set up the project locally, follow these steps:

1. Clone the repository:

```bash
git clone https://github.com/benny-nottonson/spotifysort.git
```

2. Navigate to the project directory:

```bash
cd spotifysort
```

3. Install the dependencies:

```bash
npm install
```

4. Rename the `.env.example` file to `.env.local` and provide your Spotify API credentials. You can obtain these credentials by creating a new Spotify App in the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard).

5. Run the development server:

```bash
npm run dev
```

6. Open your browser and visit `http://localhost:3000` to see the website running locally.

## Usage

1. Open the deployed website: [https://spotifysort.vercel.app](https://spotifysort.vercel.app)

2. Click on the "Log in with Spotify" button to authenticate with your

 Spotify account.

3. Once logged in, you will see a list of your playlists. Click on any playlist to sort it based on color.

4. The sorted playlist will be displayed, showcasing the album art images with a visual color coherence.

5. Explore and enjoy your organized playlists!

**Disclaimer:** This project is not affiliated with or endorsed by Spotify. It is an independent project created for educational and personal use only.
