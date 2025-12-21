import React from 'react';
import { createPortal } from 'react-dom';
import { X, Download, ZoomIn } from 'lucide-react';

interface ImageViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string | undefined;
  title: string;
}

const ImageViewerModal: React.FC<ImageViewerModalProps> = ({ isOpen, onClose, imageUrl, title }) => {
  if (!isOpen || !imageUrl) return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/95 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div className="relative w-full h-full flex items-center justify-center p-4">
        
        {/* Toolbar */}
        <div className="absolute top-4 right-4 flex items-center gap-3 z-20">
          <a 
            href={imageUrl} 
            download={`${title.replace(/\s+/g, '_')}_image`}
            onClick={(e) => e.stopPropagation()}
            className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors backdrop-blur-md group"
            title="Download Image"
          >
            <Download size={20} className="opacity-75 group-hover:opacity-100" />
          </a>
          <button 
            onClick={onClose}
            className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors backdrop-blur-md group"
          >
            <X size={20} className="opacity-75 group-hover:opacity-100" />
          </button>
        </div>

        {/* Title Caption */}
        <div className="absolute bottom-6 left-0 w-full text-center pointer-events-none z-20 px-4">
            <span className="inline-block px-4 py-2 bg-black/50 backdrop-blur-md rounded-full text-white/90 text-sm font-medium">
              {title}
            </span>
        </div>

        {/* Image Container */}
        <div 
          className="relative max-w-full max-h-full flex items-center justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          <img 
              src={imageUrl} 
              alt={title} 
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl ring-1 ring-white/10"
          />
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ImageViewerModal;