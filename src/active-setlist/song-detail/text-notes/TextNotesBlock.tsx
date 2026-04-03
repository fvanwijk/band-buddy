type TextNotesBlockProps = {
  notes?: string;
};

export function TextNotesBlock({ notes }: TextNotesBlockProps) {
  return (
    <div className="flex flex-1 flex-col p-6">
      <pre className="font-sans text-sm text-slate-200">{notes}</pre>
    </div>
  );
}
