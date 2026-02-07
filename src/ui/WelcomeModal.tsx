import { IconMusic, IconPlaylist, IconSettings } from '@tabler/icons-react';

import { Button } from './Button';
import { Dialog } from './Dialog';
import { DialogTitle } from './DialogTitle';
import { Logo } from './Logo';

type WelcomeModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function WelcomeModal({ isOpen, onClose }: WelcomeModalProps) {
  return (
    <Dialog onClose={onClose} open={isOpen}>
      <div className="mb-4 flex items-center gap-2">
        <Logo className="text-2xl" iconClassName="h-5 w-5" />
      </div>

      <DialogTitle>Welcome to Your Band Companion!</DialogTitle>

      <div className="mb-6 space-y-4 text-sm text-slate-300">
        <p>
          BandBuddy helps you organize your band's repertoire and manage your live performances with
          ease.
        </p>

        <div className="space-y-3">
          <div className="flex gap-3">
            <IconMusic className="text-brand-400 mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-semibold text-slate-100">Build Your Song Library</p>
              <p className="text-slate-400">
                Add songs with details like key, BPM, lyrics, and MIDI program changes for your
                instruments.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <IconPlaylist className="text-brand-400 mt-0.5 h-5 w-5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-slate-100">Create Setlists</p>
              <p className="text-slate-400">
                Organize songs into sets for your gigs. Track what you've played and what's coming
                up next.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <IconSettings className="text-brand-400 mt-0.5 h-5 w-5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-slate-100">Configure Your Instruments</p>
              <p className="text-slate-400">
                Set up your MIDI devices to automatically send program changes when selecting songs.
              </p>
            </div>
          </div>
        </div>

        <p className="pt-2">
          Start by adding some songs to your library or creating your first setlist. All your data
          is saved locally on this device.
        </p>
      </div>

      <div className="flex justify-end">
        <Button color="primary" onClick={onClose} type="button" variant="filled">
          Get Started
        </Button>
      </div>
    </Dialog>
  );
}
