export default function BrightText({mobile}: {mobile?: boolean}) {
  if (mobile) {
    return (
      <div className="z-50 absolute left-1/2 transform -translate-x-1/2 mix-blend-exclusion text-center">
      <h1
        style={{
          textShadow:
            '0 0 16px rgba(255, 255, 255, 0.4), 0 0 24px rgba(255, 255, 255, 0.5), 0 0 96px rgba(255, 255, 255, .5)',
        }}
        className="text-transparent bg-clip-text bg-gradient-to-br from-green-700 to-fuchsia-300 via-teal-600 text-5xl font-semibold pb-4 -mt-4"
      >
        Spotify Sort
      </h1>
    </div>
    )
  }
  return (
    <div className="z-50 absolute top-52 left-1/2 transform -translate-x-1/2 -translate-y-1/2 mix-blend-exclusion text-center">
      <h1
        style={{
          textShadow:
            '0 0 16px rgba(255, 255, 255, 0.4), 0 0 24px rgba(255, 255, 255, 0.5), 0 0 96px rgba(255, 255, 255, .5)',
        }}
        className="text-transparent bg-clip-text bg-gradient-to-br from-green-700 to-fuchsia-300 via-teal-600 text-7xl font-semibold pb-4"
      >
        Spotify Sort
      </h1>
    </div>
  );
};
