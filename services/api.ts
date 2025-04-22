export const TMDB_CONFIG = {
  BASE_URL: "https://api.themoviedb.org/3",
  API_KEY: process.env.EXPO_PUBLIC_MOVIE_API_KEY,
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${process.env.EXPO_PUBLIC_MOVIE_API_KEY}`,
  },
};

// Fetch movies based on search query or top 50 popular if no query is given
export const fetchMovies = async ({
  query,
  region,
}: {
  query?: string;
  region?: string;
}): Promise<Movie[]> => {
  try {
    const headers = TMDB_CONFIG.headers;

    const regionFilters: Record<string, string> = {
      pakistani: "PK",
      bollywood: "IN",
      south: "IN", // You can refine this using genres or keywords
      hollywood: "US",
    };

    // 🟢 If a query is entered, fetch 1 page of search results
    if (query) {
      const endpoint = `${TMDB_CONFIG.BASE_URL}/search/movie?query=${encodeURIComponent(query)}&page=1`;
      const response = await fetch(endpoint, { method: "GET", headers });

      if (!response.ok) {
        throw new Error(`Failed to fetch movies: ${response.statusText}`);
      }

      const data = await response.json();
      return data.results;
    }

    // 🟡 If a region is selected, fetch at least 2 pages (30-40 movies)
    if (region && regionFilters[region]) {
      const pages = await Promise.all(
        [1, 2].map((page) =>
          fetch(
            `${TMDB_CONFIG.BASE_URL}/discover/movie?with_origin_country=${regionFilters[region]}&sort_by=popularity.desc&page=${page}`,
            {
              method: "GET",
              headers,
            }
          ).then((res) => {
            if (!res.ok) {
              throw new Error(`Failed to fetch movies for region ${region}: ${res.statusText}`);
            }
            return res.json();
          })
        )
      );

      const allMovies = pages.flatMap((pageData) => pageData.results);
      return allMovies.slice(0, 40); // return at least 30, ideally 40
    }

    // 🔵 Default: fetch 3 pages (60 movies)
    const pages = await Promise.all(
      [1, 2, 3].map((page) =>
        fetch(`${TMDB_CONFIG.BASE_URL}/discover/movie?sort_by=popularity.desc&page=${page}`, {
          method: "GET",
          headers,
        }).then((res) => {
          if (!res.ok) {
            throw new Error(`Failed to fetch movies on page ${page}: ${res.statusText}`);
          }
          return res.json();
        })
      )
    );

    const allMovies = pages.flatMap((pageData) => pageData.results);
    return allMovies.slice(0, 60); // Return top 60 movies
  } catch (error) {
    console.error("Error fetching movies:", error);
    throw error;
  }
};




// Fetch detailed information about a single movie by its ID
export const fetchMovieDetails = async (
  movieId: string
): Promise<MovieDetails> => {
  try {
    const response = await fetch(`${TMDB_CONFIG.BASE_URL}/movie/${movieId}`, {
      method: "GET",
      headers: TMDB_CONFIG.headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch movie details: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching movie details:", error);
    throw error;
  }
};
