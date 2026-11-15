# Example APIs 🐕

✨ Easy to fetch example APIs made for training purposes.

[🔗 GitHub Repository](https://github.com/neuefische/web-example-apis)

## 🎲 Status

### `GET` `/api/status`

Randomly returns status code 200 or error codes after a random delay.

```
https://example-apis.vercel.app/api/status
```

## 🙄 Bad Jokes

### `GET` `/api/bad-jokes`

Retrieve a list of bad jokes:

```
https://example-apis.vercel.app/api/bad-jokes
```

### `GET` `/api/bad-jokes/[id]`

Retrieve a bad joke for the given id:

```
https://example-apis.vercel.app/api/bad-jokes/1
```

### `GET` `/api/bad-jokes/random`

Retrieve a random bad joke:

```
https://example-apis.vercel.app/api/bad-jokes/random
```

## 🛒 Shopping Items

### `GET` `/api/shopping/categories`

Retrieve a list of shopping categories:

```
https://example-apis.vercel.app/api/shopping/categories
```

### `GET` `/api/shopping/items`

Retrieve a list of shopping items:

```
https://example-apis.vercel.app/api/shopping/items
```

## 🌤️ Weather

### `GET` `/api/weather`

Retrieve a seeded random weather for "europe" based on the current hour:

```
https://example-apis.vercel.app/api/weather
```

### `GET` `/api/weather/[location]`

Retrieve a seeded random weather for a location based on the current hour.

Only the following locations are supported:

```
https://example-apis.vercel.app/api/weather/europe
```

```
https://example-apis.vercel.app/api/weather/arctic
```

```
https://example-apis.vercel.app/api/weather/sahara
```

```
https://example-apis.vercel.app/api/weather/rainforest
```

## 🎨 Art

### `GET` `/api/art`

Retrieve a list of artworks:

```
https://example-apis.vercel.app/api/art
```

## 🎬 Watchlist

A movie watchlist you can read **and write**. Every person picks their own `[key]` (3 to 32 characters: lowercase letters, digits and `-`, for example your first name). The first request with a new key creates your own copy with five movies. Your data is deleted after 24 hours without a change.

Base URL: `https://example-apis.vercel.app/api/watchlist/[key]`

A movie looks like this: `{ "id": 1, "title": "Spirited Away", "year": 2001, "watched": true }`

| Method   | Path                    | What it does                                         | Success                         |
| -------- | ----------------------- | ---------------------------------------------------- | ------------------------------- |
| `GET`    | `/movies`               | List all movies, optional filter `?watched=true`     | `200`                           |
| `POST`   | `/movies`               | Create a movie (`title`, `year`, optional `watched`) | `201` with `Location` header    |
| `GET`    | `/movies/[id]`          | Read one movie                                       | `200`                           |
| `PUT`    | `/movies/[id]`          | Replace a movie (`title`, `year` and `watched`)      | `200`                           |
| `PATCH`  | `/movies/[id]`          | Change parts of a movie                              | `200`                           |
| `DELETE` | `/movies/[id]`          | Delete a movie and its notes                         | `204`                           |
| `GET`    | `/movies/[id]/notes`    | List the notes of a movie                            | `200`                           |
| `POST`   | `/movies/[id]/notes`    | Add a note (`text`)                                  | `201` with `Location` header    |
| `DELETE` | `/` (the key itself)    | Reset your watchlist to the five starting movies     | `204`                           |

Requests with a body need the header `Content-Type: application/json`.

Errors are JSON like `{ "error": "Invalid movie", "details": ["year is required"] }`:

| Status | When                                                                  |
| ------ | --------------------------------------------------------------------- |
| `400`  | Invalid JSON, missing or invalid fields, invalid key                  |
| `404`  | The movie does not exist (for example after it was deleted)           |
| `405`  | The URL exists, but not for this method (see the `Allow` header)      |
| `409`  | Limit reached (50 movies, 20 notes per movie)                         |
| `413`  | The request body is larger than 1 KB                                  |
| `415`  | `Content-Type` is missing or not `application/json`                   |

```
https://example-apis.vercel.app/api/watchlist/your-name/movies
```
