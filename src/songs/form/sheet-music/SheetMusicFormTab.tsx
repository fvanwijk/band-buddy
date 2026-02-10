import { IconFileMusic, IconFileTypePdf, IconTrash, IconUpload } from '@tabler/icons-react';
import type { FieldError, UseFormRegisterReturn, UseFormSetValue } from 'react-hook-form';

import { useObjectUrl } from '../../../hooks/useObjectUrl';
import { Button } from '../../../ui/Button';
import { EmptyStateBlock } from '../../../ui/EmptyStateBlock';
import type { SongFormData } from '../SongForm';

type SheetMusicFormTabProps = {
  error?: FieldError;
  register: UseFormRegisterReturn;
  setValue: UseFormSetValue<SongFormData>;
  sheetMusicFiles?: FileList;
  sheetMusicFilename?: string;
};

export function SheetMusicFormTab({
  error,
  register,
  setValue,
  sheetMusicFiles,
  sheetMusicFilename,
}: SheetMusicFormTabProps) {
  const file = sheetMusicFiles?.[0];
  const displayFilename = file?.name || sheetMusicFilename;
  const fileSizeKB = file ? Math.round(file.size / 1024) : null;
  const pdfUrl = useObjectUrl(file);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    await register.onChange(event);

    const file = event.target.files?.[0];
    if (file) {
      setValue('sheetMusicFilename', file.name);
    }
  };

  const handleClear = () => {
    setValue('sheetMusicFiles', undefined);
    setValue('sheetMusicFilename', undefined);
  };

  if (!displayFilename) {
    return (
      <EmptyStateBlock icon={<IconFileMusic className="h-8 w-8" />}>
        <p className="mb-4">No sheet music added yet</p>
        <input
          {...register}
          accept="application/pdf"
          className="hidden"
          id="sheet-music-upload"
          onChange={handleFileChange}
          type="file"
        />
        <Button
          as="label"
          color="primary"
          htmlFor="sheet-music-upload"
          iconStart={<IconUpload className="h-4 w-4" />}
          variant="outlined"
        >
          Upload PDF
        </Button>
        {error && <p className="mt-2 text-xs text-red-400">{error.message}</p>}
      </EmptyStateBlock>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm text-slate-300">{displayFilename}</p>
          {fileSizeKB && <p className="text-xs text-slate-400">{fileSizeKB} kB</p>}
          {error && <p className="mt-1 text-xs text-red-400">{error.message}</p>}
        </div>
        <div className="flex gap-2">
          <input
            {...register}
            accept="application/pdf"
            className="hidden"
            id="sheet-music-replace"
            onChange={handleFileChange}
            type="file"
          />
          <Button
            as="label"
            htmlFor="sheet-music-replace"
            iconStart={<IconFileTypePdf className="h-4 w-4" />}
            variant="outlined"
          >
            Replace PDF
          </Button>
          <Button color="danger" icon onClick={handleClear} title="Delete PDF" variant="outlined">
            <IconTrash className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {pdfUrl && (
        <div className="mt-4">
          <iframe
            className="h-[600px] w-full rounded border border-slate-700"
            src={pdfUrl}
            title="Sheet Music Preview"
          />
        </div>
      )}
    </div>
  );
}
