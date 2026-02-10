# BandBuddy

<div align="center">
  <img src="public/logo.svg" alt="BandBuddy Logo" width="240" height="64">
</div>

A musician companion app for managing songs, setlists, and MIDI instruments. Built to help musicians organize their repertoire and control MIDI instruments during live performances.

## Features

### Core Features

- **Song Library** - Manage your songs with details like key, BPM, time signature, lyrics, and custom notes
- **Setlist Management** - Create and organize setlists for performances with songs, sets, and breaks
- **MIDI Integration** - Configure MIDI instruments and send program change messages
- **Program Names** - Define custom names for MIDI programs for easier program selection
- **Active Setlist** - Navigate through your current setlist during performances with lyrics and MIDI controls

### Import/Export

- **Data Portability** - Import and export your entire library (songs, setlists, instruments) as JSON
- **Spotify Integration** - Import playlists from Spotify to quickly build your song library
- **Share with band members** - Easily sync your data across devices or share with your band

### Additional Features

- **PWA Support** - Install as a Progressive Web App for offline access during gigs
- **Search & Sort** - Quickly find songs in your library with search and multiple sorting options
- **Custom Themes** - Choose from multiple color themes to match your style
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices

## Privacy & Data

- **No account required** - Start using the app immediately without sign-up
- **Privacy-first** - No data collection, analytics, or tracking
- **Local storage** - All your data stays on your device using browser localStorage

## Tech

- Vite + TypeScript + React
- React Hook Form for form management
- TinyBase for state management with localStorage persistence
- Tailwind CSS 4 (dark mode only)
- Web MIDI API for MIDI device control
- Spotify Web API SDK for playlist import
