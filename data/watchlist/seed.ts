export interface Movie {
  id: number;
  title: string;
  year: number;
  watched: boolean;
}

export interface Note {
  id: number;
  movieId: number;
  text: string;
}

export interface WatchlistState {
  movieSeq: number;
  noteSeq: number;
  movies: Movie[];
  notes: Note[];
}

export const createSeedState = (): WatchlistState => ({
  movieSeq: 5,
  noteSeq: 2,
  movies: [
    { id: 1, title: 'Spirited Away', year: 2001, watched: true },
    { id: 2, title: 'The Matrix', year: 1999, watched: true },
    { id: 3, title: 'Arrival', year: 2016, watched: false },
    { id: 4, title: 'Parasite', year: 2019, watched: false },
    { id: 5, title: 'Paddington 2', year: 2017, watched: false },
  ],
  notes: [
    { id: 1, movieId: 1, text: 'Watch it again with subtitles.' },
    { id: 2, movieId: 3, text: 'Recommended by a friend.' },
  ],
});
