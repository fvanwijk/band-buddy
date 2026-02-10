import { useEffect, useState } from 'react';

/**
 * Hook to create an object URL from a File or Blob and automatically revoke it on cleanup
 */
export function useObjectUrl(file: File | Blob | null | undefined): string | null {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  return url;
}
