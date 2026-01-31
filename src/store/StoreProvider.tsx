import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Provider } from "tinybase/ui-react";
import { store, initializeStore } from "./store";

type StoreProviderProps = {
  children: ReactNode;
};

export function StoreProvider({ children }: StoreProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    async function init() {
      await initializeStore();

      // If store is empty (first load), populate with mock data
      // if (Object.keys(store.getTables()).length === 0) {
      //   // Store songs
      //   mockSetlist.songs.forEach((song) => {
      //     store.setRow("songs", song.id, {
      //       artist: song.artist,
      //       title: song.title,
      //       key: song.key,
      //       timeSignature: song.timeSignature,
      //     });
      //   });

      //   // Store setlist with song references
      //   store.setRow("setlists", mockSetlist.id, {
      //     name: mockSetlist.name,
      //     date: mockSetlist.date,
      //     venue: mockSetlist.venue,
      //     songIds: mockSetlist.songs.map((s) => s.id).join(","),
      //   });

      //   // Mark the active setlist
      //   store.setValue("activeSetlistId", mockSetlist.id);
      // }

      setIsInitialized(true);
    }

    init();
  }, []);

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  return <Provider store={store}>{children}</Provider>;
}
