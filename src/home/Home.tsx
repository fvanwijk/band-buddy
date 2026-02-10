import {
  IconBolt,
  IconBrandGithub,
  IconBrowserCheck,
  IconDeviceSpeaker,
  IconMusic,
  IconPlaylist,
} from '@tabler/icons-react';
import { Link } from 'react-router-dom';

import { Button } from '../ui/Button';
import { Logo } from '../ui/Logo';

export const Home = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between border-b border-slate-900 px-4 py-2">
        <Link to="/">
          <Logo className="text-md sm:text-2xl" iconClassName="h-4 w-4" />
        </Link>
        <a
          className="hover:text-brand-400 text-slate-300 transition-colors"
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
              BandBuddy keeps your songs, setlists, lyrics, and MIDI program changes together so you
              can focus on the performance and rehearsal.
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
          <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900/50 to-slate-950 p-6 shadow-xl">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <IconPlaylist className="text-brand-300 h-6 w-6" />
                <div>
                  <p className="text-sm font-semibold text-slate-100">Active setlist view</p>
                  <p className="text-xs text-slate-400">Navigate songs hands-free on stage.</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <IconDeviceSpeaker className="text-brand-300 h-6 w-6" />
                <div>
                  <p className="text-sm font-semibold text-slate-100">Instant MIDI changes</p>
                  <p className="text-xs text-slate-400">
                    Trigger patches and program changes with a tap.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <IconMusic className="text-brand-300 h-6 w-6" />
                <div>
                  <p className="text-sm font-semibold text-slate-100">Song intelligence</p>
                  <p className="text-xs text-slate-400">Keep your song library in one place.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
            <IconBolt className="text-brand-300 mb-4 h-6 w-6" />
            <h3 className="text-lg font-semibold text-slate-100">Free and privacy-first</h3>
            <p className="mt-2 text-sm text-slate-400">
              Open source and completely free. Your data stays local in your browser—no accounts, no
              tracking, no cloud required.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
            <IconPlaylist className="text-brand-300 mb-4 h-6 w-6" />
            <h3 className="text-lg font-semibold text-slate-100">Setlist-first workflow</h3>
            <p className="mt-2 text-sm text-slate-400">
              Build shows around your repertoire and jump between songs in seconds.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
            <IconBrowserCheck className="text-brand-300 mb-4 h-6 w-6" />
            <h3 className="text-lg font-semibold text-slate-100">Works everywhere</h3>
            <p className="mt-2 text-sm text-slate-400">
              Runs in any modern browser—desktop, tablet, or phone. Install as a PWA for offline
              access.
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-900 bg-slate-950 py-6">
        <div className="text-center text-sm text-slate-400">
          Built by{' '}
          <a
            className="hover:text-brand-400 text-slate-300 transition-colors"
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
