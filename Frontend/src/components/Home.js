import { useContext, useEffect, useState, useRef } from "react";
import Navbar from "./Navbar";
import VolumeControl from "./VolumeControl";
import { MusicContext } from "../Context";
import "./Home.css";

function Home() {
  const [keyword, setKeyword] = useState("");
  const [message, setMessage] = useState("");
  const [tracks, setTracks] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1); // Volume state
  const audioRef = useRef(new Audio());

  const { isLoading, setIsLoading, resultOffset, setResultOffset } =
    useContext(MusicContext);

  const fetchMusicData = async (query = "", offset = 0) => {
    setTracks([]);
    setMessage("");
    window.scrollTo(0, 0);
    setIsLoading(true);

    try {
      const searchQuery = query || keyword;
      const response = await fetch(
        `https://cors-anywhere.herokuapp.com/https://api.deezer.com/search?q=${searchQuery}&index=${offset}&limit=10`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch music data: ${response.statusText}`);
      }

      const jsonData = await response.json();
      setTracks(jsonData.data);
      setHasSearched(true);
    } catch (error) {
      setMessage("We couldn't retrieve the music data. Please try again.");
      console.error("Error fetching music data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      setResultOffset(0);
      fetchMusicData(keyword, 0);
    }
  };

  const handleSearchClick = () => {
    setResultOffset(0);
    fetchMusicData(keyword, 0);
  };

  const playSong = (track) => {
    if (currentTrack && currentTrack.id === track.id && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.src = track.preview;
      audioRef.current.volume = volume; // Set volume
      audioRef.current.play().catch((error) => {
        console.error("Error playing audio:", error);
      });
      setCurrentTrack(track);
      setIsPlaying(true);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    const handleError = (e) => {
      console.error("Audio error:", e);
      setIsPlaying(false);
    };
    audio.addEventListener("error", handleError);
    return () => {
      audio.removeEventListener("error", handleError);
      audio.pause();
    };
  }, []);

  return (
    <>
      <Navbar
        keyword={keyword}
        setKeyword={setKeyword}
        handleKeyPress={handleKeyPress}
        fetchMusicData={handleSearchClick}
      />
      <div className="container">
        <div className={`row ${isLoading ? "" : "d-none"}`}>
          <div className="col-12 py-5 text-center">
            <div
              className="spinner-border"
              style={{ width: "3rem", height: "3rem" }}
              role="status"
            >
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
        <div className={`row ${message ? "" : "d-none"}`}>
          <div className="col-12 py-2 text-center">
            <h4 className="text-center text-danger">{message}</h4>
          </div>
        </div>
        <div className="row ">
          {hasSearched && tracks.length > 0
            ? tracks.map((track) => (
                <div key={track.id} className="col-md-4 mb-3">
                  <div className="card bg-dark text-white">
                    <img
                      src={track.album.cover_medium}
                      className="card-img-top"
                      alt={track.title}
                    />
                    <div className="card-body">
                      <h5 className="card-title">{track.title}</h5>
                      <p className="card-text">{track.artist.name}</p>
                      <button
                        onClick={() => playSong(track)}
                        className="btn btn-primary"
                      >
                        {currentTrack &&
                        currentTrack.id === track.id &&
                        isPlaying
                          ? "Pause"
                          : "Play"}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            : !hasSearched && (
                <div className="col-12 py-5 text-center">
                  <h3 className="animated-text py-5">
                    Please search for your favorite song
                  </h3>
                  <br />
                  <img
                    src="https://w0.peakpx.com/wallpaper/43/709/HD-wallpaper-hip-hop-hip-collage-music-hop.jpg"
                    alt="Hip Hop Music Collage"
                    className="img-fluid artistic-img"
                  />
                </div>
              )}
        </div>
        {hasSearched && tracks.length > 0 && (
          <div className="row">
            <div className="col">
              <button
                onClick={() => {
                  setResultOffset((previous) => Math.max(previous - 10, 0));
                  fetchMusicData(keyword, Math.max(resultOffset - 10, 0));
                }}
                className="btn btn-outline-success w-100"
                disabled={resultOffset === 0}
              >
                Previous Page: {resultOffset / 10}
              </button>
            </div>
            <div className="col">
              <button
                onClick={() => {
                  setResultOffset((previous) => previous + 10);
                  fetchMusicData(keyword, resultOffset + 10);
                }}
                className="btn btn-outline-success w-100"
              >
                Next Page: {resultOffset / 10 + 2}
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="fixed-bottom bg-dark p-3">
        <div className="d-flex justify-content-between align-items-center">
          <button
            onClick={() => {
              if (isPlaying) {
                audioRef.current.pause();
                setIsPlaying(false);
              } else if (currentTrack) {
                audioRef.current.play();
                setIsPlaying(true);
              }
            }}
            className="btn btn-primary"
          >
            {isPlaying ? "Pause" : "Play"}
          </button>
          <VolumeControl audioRef={audioRef} />
        </div>
      </div>
    </>
  );
}

export default Home;
