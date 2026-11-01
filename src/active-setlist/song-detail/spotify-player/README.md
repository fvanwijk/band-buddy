# Spotify player

A full-width player at the bottom of the song detail page, below the previous/next buttons. It has a
Play/Pause button and an interactive progress bar to play the current song from Spotify.

It is shown when all of these are true:

- Spotify is connected (Settings → Spotify).
- "Show Spotify player" is checked in the song settings panel (`showSpotifyPlayer` setting).
- The song has a `spotifyId`. Playlist import fills it in, and it can be entered on the Details tab
  of the song form (a track link, `spotify:track:` URI or bare ID).

Playing music requires Spotify Premium. After the player was added, Spotify has to be disconnected
and reconnected once, because it needs the extra scopes `streaming`, `user-read-email`,
`user-read-private`, `user-read-playback-state` and `user-modify-playback-state`
(see `SpotifyContext.tsx`).

There are two ways to play, chosen automatically. Both are exposed through `useSpotifyPlayback`,
which `SpotifyPlayer` uses, so the UI is the same for both.

```
SpotifyPlayer
└── useSpotifyPlayback          chooses between the two players and merges their state
    ├── useSpotifyBrowserPlayback   first-class player: this browser is the Spotify device
    └── useSpotifyRemotePlayback    fallback player: remote controls the Spotify app on a device
```

## First-class player: this browser

`useSpotifyBrowserPlayback` uses Spotify's
[Web Playback SDK](https://developer.spotify.com/documentation/web-playback-sdk). The SDK registers
the browser as a Spotify Connect device named "BandBuddy", so the music always comes from the device
BandBuddy runs on.

- The SDK script is loaded once by `loadSpotifySdk.ts`.
- Playback state comes from the SDK's `player_state_changed` event, so no polling is needed.
- Play starts the song on the BandBuddy device through the Web API. Pause, resume and seek go
  straight to the SDK player.
- Browsers only allow audio after a user gesture, so `activateElement()` is called from the click
  handler.
- The player connects while the Spotify player is visible and disconnects when it is hidden or the
  page is left, which stops the music.

The SDK needs DRM (Encrypted Media Extensions) support. It does not work in mobile browsers
(`EMEError: No supported keysystem was found`, reported as `initialization_error`). The player falls
back to the remote player when the SDK reports `initialization_error`, fails to connect or load, or
is not ready within 10 seconds. A `Premium required` or authentication problem is shown as an error
instead.

## Fallback player: remote control a Spotify app

`useSpotifyRemotePlayback` is used on mobile browsers (detected up front by `isMobileBrowser.ts`, so
the SDK is not even loaded) and whenever the first-class player can't be used. It does not play any
sound itself. It controls the Spotify app on one of your devices through the Web API, usually the
phone BandBuddy runs on.

- **Device menu:** an icon button left of the Play button (`SpotifyDeviceMenu.tsx`) lists the
  available Spotify devices. The choice is remembered in the browser's `localStorage` (`band-buddy-spotify-device-id`, see
  `useSpotifyDeviceId.ts`). It is deliberately not part of the store, so it is not included in
  backups: a device ID means nothing on another device. Only the chosen
  device is ever controlled. Without a choice the device Spotify considers active is used. If the
  chosen device is offline, Play is disabled and a hint explains why. It never falls back to another
  device.
- **Polling:** playback state and the device list are fetched every 3 seconds (every second while
  waiting for a started song), and immediately when the tab becomes visible again. The progress bar
  is interpolated in between (`usePlaybackPosition`).
- **Only this song is shown:** if Spotify plays another song, the player shows 0:00 and Play. Play
  then starts this song.
- **Waking a device:** a device that is not active, like a sleeping app, gets a playback transfer
  before the command is sent.
- **Starting a song:** the song is started inside its album (`context_uri` plus an `offset`). This
  was found by experiment, the cause is not known: with another song loaded on a desktop Spotify
  app, `{"uris": [track]}` answered 204 but left the app with an empty player (nothing playing, all
  controls disabled), while the album command with an offset started the song at 0:00. Spotify
  documents both as equivalent. Because the album would continue with the next track, the player
  pauses 300 ms before the song ends. Pressing Play on a song that reached its end starts it from
  the beginning. Starting from a position starts the song and then seeks, as the SDK ignores a
  start position.
- **Not started:** if Spotify still doesn't report the song as playing after 10 seconds, an error
  asks to open the Spotify app on that device.

Limits: the pause at the end is a timer in the page, so on a phone that suspends the browser in the
background the next album track may start playing. The pause also cuts off the last 300 ms of a
song.

## Shared

- `getPlayableTrack.ts` looks the track up for the user's market. A track that is unavailable there
  is reported before sending a command, because Spotify accepts the command and then plays nothing.
  Relinked tracks are played through their relinked URI.
- `playbackSnapshot.ts` has the shared state shape, error messages and position interpolation.
- Spotify's player endpoints answer with plain text, which the Spotify SDK for JavaScript fails to
  parse. `SpotifyContext.tsx` therefore configures a tolerant deserializer.

## Debugging on a phone

1. Enable USB debugging, then run `adb devices` and
   `adb -s <serial> reverse tcp:5173 tcp:5173` (the dev server listens on `127.0.0.1`).
2. Open `http://127.0.0.1:5173` on the phone.
3. In desktop Chrome open `chrome://inspect/#devices` and inspect the tab. The Network tab shows the
   Spotify requests (`me/player`, `me/player/play`) and their responses.
