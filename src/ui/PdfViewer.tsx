import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Set up worker from local package
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

type PdfViewerProps = {
  file: File | Blob | string | null;
  height?: string;
};

export function PdfViewer({ file, height = 'h-[600px]' }: PdfViewerProps) {
  const [numPages, setNumPages] = useState(0);

  if (!file) return null;

  const handleDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  return (
    <div className={`${height} overflow-y-auto rounded-lg border border-slate-800 bg-slate-950`}>
      <Document
        file={file}
        onLoadSuccess={handleDocumentLoadSuccess}
        onLoadError={(error) => console.error('PDF load error:', error)}
      >
        {Array.from({ length: numPages }, (_, i) => (
          <div key={i + 1} className="flex justify-center bg-slate-950 py-2">
            <Page
              pageNumber={i + 1}
              width={Math.min(window.innerWidth - 32, 800)}
              renderTextLayer={false}
            />
          </div>
        ))}
      </Document>
    </div>
  );
}
