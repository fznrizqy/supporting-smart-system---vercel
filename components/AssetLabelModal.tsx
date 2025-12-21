import React from 'react';
import { createPortal } from 'react-dom';
import QRCode from 'react-qr-code';
import { Equipment } from '../types';
import { X, Printer, Microscope } from 'lucide-react';

interface AssetLabelModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipment: Equipment | null;
}

const AssetLabelModal: React.FC<AssetLabelModalProps> = ({ isOpen, onClose, equipment }) => {
  if (!isOpen || !equipment) return null;

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Asset Label - ${equipment.id}</title>
          <style>
            @page { size: auto; margin: 0; }
            body { 
              font-family: sans-serif; 
              margin: 0; 
              padding: 20px; 
              display: flex; 
              justify-content: center; 
              align-items: flex-start;
            }
            .label-container {
              border: 3px solid #000;
              width: 380px;
              height: 200px;
              display: flex;
              padding: 10px;
              box-sizing: border-box;
              border-radius: 8px;
            }
            .qr-section {
              width: 140px;
              display: flex;
              align-items: center;
              justify-content: center;
              border-right: 2px dashed #ccc;
              padding-right: 10px;
            }
            .info-section {
              flex: 1;
              padding-left: 15px;
              display: flex;
              flex-direction: column;
              justify-content: center;
            }
            .header {
              font-size: 10px;
              text-transform: uppercase;
              color: #666;
              margin-bottom: 4px;
              font-weight: bold;
              display: flex;
              align-items: center;
              gap: 5px;
            }
            .asset-id {
              font-size: 18px;
              font-weight: 900;
              margin-bottom: 4px;
              font-family: monospace;
            }
            .asset-name {
              font-size: 14px;
              font-weight: bold;
              margin-bottom: 8px;
              line-height: 1.2;
            }
            .detail-row {
              font-size: 11px;
              margin-bottom: 2px;
            }
            .detail-label {
              font-weight: 600;
              color: #444;
            }
            .logo {
               font-weight: 900; 
               letter-spacing: -1px;
               color: #0284c7;
            }
          </style>
        </head>
        <body>
          <div class="label-container">
            <div class="qr-section">
              ${document.getElementById('qr-code-source')?.outerHTML || ''}
            </div>
            <div class="info-section">
              <div class="header">
                 <span class="logo">S3</span> PROPERTY TAG
              </div>
              <div class="asset-id">${equipment.id}</div>
              <div class="asset-name">${equipment.brand} ${equipment.model}</div>
              
              <div class="detail-row">
                <span class="detail-label">Div:</span> ${equipment.division}
              </div>
              <div class="detail-row">
                <span class="detail-label">Cat:</span> ${equipment.category}
              </div>
              <div class="detail-row">
                <span class="detail-label">Date:</span> ${equipment.installationDate}
              </div>
            </div>
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-sm mx-4 flex flex-col overflow-hidden">
        
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
          <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
             <Printer size={18} className="text-sky-500"/> Print Asset Tag
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 flex flex-col items-center">
            {/* The Label Preview */}
            <div className="border-[3px] border-slate-900 dark:border-slate-400 rounded-lg p-4 w-full flex gap-4 bg-white text-slate-900 shadow-lg">
                <div className="border-r-2 border-dashed border-slate-300 pr-4 flex items-center justify-center">
                    <div id="qr-code-source">
                        <QRCode 
                            value={JSON.stringify({id: equipment.id, model: equipment.model})} 
                            size={100}
                            viewBox={`0 0 256 256`}
                            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                        />
                    </div>
                </div>
                <div className="flex flex-col justify-center flex-1 min-w-0">
                    <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        <Microscope size={10} className="text-sky-600"/> Supporting Smart System
                    </div>
                    <div className="font-mono font-black text-lg leading-none mb-1 truncate">{equipment.id}</div>
                    <div className="font-bold text-sm leading-tight mb-2 truncate">{equipment.brand} {equipment.model}</div>
                    <div className="text-xs space-y-0.5 text-slate-600">
                        <div><span className="font-semibold">Div:</span> {equipment.division}</div>
                        <div><span className="font-semibold">Loc:</span> {equipment.location || 'N/A'}</div>
                    </div>
                </div>
            </div>
            
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-6 text-center max-w-xs">
                Scan this code to verify equipment status or access maintenance logs via the mobile dashboard.
            </p>
        </div>

        <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3 bg-slate-50 dark:bg-slate-800/50">
            <button 
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handlePrint}
              className="px-4 py-2 text-sm font-medium text-white bg-sky-500 hover:bg-sky-600 rounded-lg shadow-sm shadow-sky-500/30 transition-colors flex items-center gap-2"
            >
               <Printer size={16} /> Print Label
            </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default AssetLabelModal;