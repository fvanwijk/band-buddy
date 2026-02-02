# BandBuddy

A musician companion app for managing songs, setlists, and MIDI instruments. Built to help musicians organize their repertoire and control MIDI instruments during live performances.

## Features

- **Song Library** - Manage your songs with details like key, BPM, time signature, and custom notes
- **Setlist Management** - Create and organize setlists for performances with songs, sets, and breaks
- **MIDI Integration** - Configure MIDI instruments and send program change messages
- **Program Names** - Define custom names for MIDI programs for easier program selection
- **Active Setlist** - Navigate through your current setlist during performances

## Privacy & Data

- **No account required** - Start using the app immediately without sign-up
- **Privacy-first** - No data collection, analytics, or tracking
- **Local storage** - All your data stays on your device using browser localStorage
- **Future portability** - Import/export functionality planned for sharing data between band members or syncing across your devices

## Tech

- Vite + TypeScript + React
- React Hook Form for form management
- TinyBase for state management with localStorage persistence
- Tailwind CSS 4 (dark mode only)
- Web MIDI API for MIDI device control
