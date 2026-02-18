import { useEffect, useRef, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { cn } from '../utils/cn';

// Set up worker from local package
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

type PdfViewerProps = {
  file: File | Blob | string | null;
  className?: string;
};

export function PdfViewer({ file, className }: PdfViewerProps) {
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth;
        // Scale based on container width (assuming base width of 612px)
        const newScale = Math.max(0.5, Math.min(2, width / 612));
        setScale(newScale);
      }
    };

    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!file) return null;

  return (
    <div ref={containerRef} className={cn('flex justify-center overflow-y-auto', className)}>
      <Document
        file={file}
        onLoadSuccess={handleDocumentLoadSuccess}
        onLoadError={(error) => console.error('PDF load error:', error)}
        scale={scale}
      >
        {Array.from({ length: numPages }, (_, i) => (
          <div key={i + 1} className="py-2">
            <Page pageNumber={i + 1} renderTextLayer={false} />
          </div>
        ))}
      </Document>
    </div>
  );
}
