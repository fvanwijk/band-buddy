import {
  IconBolt,
  IconBrandGithub,
  IconBrandSpotify,
  IconBrowserCheck,
  IconMetronome,
  IconMusic,
  IconNotes,
  IconPiano,
  IconPlaylist,
} from '@tabler/icons-react';
import { Link } from 'react-router-dom';

import { Button } from '../ui/Button';
import { FeatureCard } from '../ui/feature-card/FeatureCard';
import { Logo } from '../ui/Logo';

export const Home = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between border-b border-slate-900 px-4 py-2">
        <Link to="/">
          <Logo className="text-md sm:text-2xl" iconClassName="h-4 w-4" />
        </Link>
        <a
          className="text-slate-300 transition-colors hover:text-brand-400"
          href="https://github.com/fvanwijk/band-buddy"
          rel="noopener noreferrer"
          target="_blank"
        >
          <IconBrandGithub className="h-6 w-6" />
        </a>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-16 px-4 py-10">
        <section className="grid gap-8 md:grid-cols-[1.3fr_1fr] md:items-center">
          <div className="space-y-6">
            <h1 className="text-3xl font-semibold text-slate-100 sm:text-4xl md:text-5xl">
              Run your setlists, control your MIDI gear, and stay locked in.
            </h1>
            <p className="text-base text-slate-300 sm:text-lg">
              BandBuddy keeps your songs, setlists, lyrics, clicktracks, and MIDI program changes
              together so you can focus on the performance and rehearsal.
            </p>

            <Button
              as={Link}
              className="inline-flex h-16 px-6 text-lg"
              color="primary"
              to="/play"
              variant="filled"
            >
              Start the app
            </Button>
          </div>
          <div className="rounded-3xl border border-slate-800 bg-linear-to-br from-slate-900 via-slate-900/50 to-slate-950 p-6 shadow-xl">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <IconPlaylist className="h-6 w-6 shrink-0 text-brand-300" />
                <div>
                  <p className="text-sm font-semibold text-slate-100">Active setlist view</p>
                  <p className="text-xs text-slate-400">Navigate songs hands-free on stage.</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <IconPiano className="h-6 w-6 shrink-0 text-brand-300" />
                <div>
                  <p className="text-sm font-semibold text-slate-100">Instant MIDI changes</p>
                  <p className="text-xs text-slate-400">
                    Trigger patches and program changes with a tap or automatically on song change.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <IconMetronome className="h-6 w-6 shrink-0 text-brand-300" />
                <div>
                  <p className="text-sm font-semibold text-slate-100">Clicktracks</p>
                  <p className="text-xs text-slate-400">
                    Metronome with pre-count, spoken cues, and song announcements.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <IconMusic className="h-6 w-6 shrink-0 text-brand-300" />
                <div>
                  <p className="text-sm font-semibold text-slate-100">Song intelligence</p>
                  <p className="text-xs text-slate-400">Keep your song library in one place.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <FeatureCard
            description="Open source and completely free. Your data stays local in your browser. No accounts, no tracking, no cloud required."
            icon={<IconBolt className="h-6 w-6" />}
            title="Free and privacy-first"
          />
          <FeatureCard
            description="Keep lyrics, text notes, and sheet music with every song, and draw on your lyrics."
            icon={<IconNotes className="h-6 w-6" />}
            title="Everything per song"
          />
          <FeatureCard
            description="Import a Spotify playlist to build a setlist in seconds."
            icon={<IconBrandSpotify className="h-6 w-6" />}
            title="Import from Spotify"
          />
          <FeatureCard
            description="Runs in any modern browser. Desktop, tablet, or phone. Install as a PWA for offline access."
            icon={<IconBrowserCheck className="h-6 w-6" />}
            title="Works everywhere"
          />
        </section>
      </main>

      <footer className="border-t border-slate-900 bg-slate-950 py-6">
        <div className="text-center text-sm text-slate-400">
          Built by{' '}
          <a
            className="text-slate-300 transition-colors hover:text-brand-400"
            href="https://github.com/fvanwijk"
            rel="noopener noreferrer"
            target="_blank"
          >
            Frank van Wijk
          </a>
        </div>
      </footer>
    </div>
  );
};
