import React from 'react';
import { createPortal } from 'react-dom';
import { X, FileText, Download } from 'lucide-react';

interface PDFViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  fileUrl: string | null;
}

const PDFViewerModal: React.FC<PDFViewerModalProps> = ({ isOpen, onClose, title, fileUrl }) => {
  if (!isOpen || !fileUrl) return null;

  // Check if it is a real data URL (uploaded by user in session) or a mock filename
  const isDataUrl = fileUrl.startsWith('data:');

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-4xl h-[85vh] flex flex-col mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
              <FileText size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white">{title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isDataUrl ? 'Document Preview' : 'Demo Record'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isDataUrl && (
              <a
                href={fileUrl}
                download={`${title.replace(/\s+/g, '_')}.pdf`}
                className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
                title="Download Original"
              >
                <Download size={20} />
              </a>
            )}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 bg-slate-100 dark:bg-slate-900 p-4 overflow-hidden relative">
          {isDataUrl ? (
            <iframe
              src={fileUrl}
              className="w-full h-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white"
              title="PDF Viewer"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
              <div className="bg-slate-200 dark:bg-slate-800 p-6 rounded-full mb-4">
                <FileText size={48} />
              </div>
              <h4 className="text-lg font-semibold text-slate-600 dark:text-slate-300 mb-2">
                Preview Not Available
              </h4>
              <p className="max-w-md text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                This is a demo record with a mock file reference (<code>{fileUrl}</code>).
                <br /><br />
                To test the PDF viewer, please edit this asset and upload a real PDF file (max 1MB).
              </p>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default PDFViewerModal;