import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { store } from "../store/store";
import { FormField } from "../components/FormField";
import type { Song } from "../types/setlist";

type SongFormData = Omit<Song, "id">;

function AddSongPage() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SongFormData>({
    defaultValues: {
      artist: "",
      title: "",
      key: "",
      timeSignature: "4/4",
    },
  });

  const onSubmit = (data: SongFormData) => {
    store.addRow("songs", data);
    navigate("/songs");
  };

  return (
    <section className="flex h-full flex-col gap-6">
      <header>
        <div className="mb-6 flex items-center gap-3">
          <button
            onClick={() => navigate("/songs")}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-100"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-300">
              Library
            </p>
            <h1 className="text-2xl font-semibold text-slate-100">
              Add New Song
            </h1>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            label="Artist"
            id="artist"
            placeholder="Enter artist name"
            error={errors.artist}
            register={register("artist", { required: "Artist is required" })}
          />

          <FormField
            label="Title"
            id="title"
            placeholder="Enter song title"
            error={errors.title}
            register={register("title", { required: "Title is required" })}
          />

          <FormField
            label="Key"
            id="key"
            placeholder="e.g., C, Dm, F#"
            error={errors.key}
            register={register("key", { required: "Key is required" })}
          />

          <FormField
            label="Time Signature"
            id="timeSignature"
            placeholder="e.g., 4/4, 3/4, 6/8"
            error={errors.timeSignature}
            register={register("timeSignature", {
              required: "Time signature is required",
            })}
          />

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate("/songs")}
              className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 rounded-lg border border-brand-400/30 bg-brand-400/10 px-4 py-2 text-sm font-medium text-brand-200 hover:bg-brand-400/20"
            >
              Add Song
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

export default AddSongPage;
