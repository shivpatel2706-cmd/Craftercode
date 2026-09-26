import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface QRCodeDisplayProps {
  value: string;
  certificateNumber: string;
  size?: number;
  includeLink?: boolean;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  value,
  certificateNumber,
  size = 140,
  includeLink = true,
}) => {
  const [copied, setCopied] = useState(false);

  const verificationUrl = `${window.location.origin}/verify/${certificateNumber}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(verificationUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col items-center p-4 bg-white rounded-xl border border-slate-200 shadow-sm text-center">
      <div className="p-2 bg-white rounded-lg border-2 border-slate-900 shadow-inner inline-block">
        <QRCodeSVG
          value={verificationUrl}
          size={size}
          level="H"
          includeMargin={false}
          imageSettings={{
            src: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%231e40af"><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/></svg>',
            x: undefined,
            y: undefined,
            height: 24,
            width: 24,
            excavate: true,
          }}
        />
      </div>

      <div className="mt-3 font-mono text-xs font-bold text-slate-800 tracking-wider">
        {certificateNumber}
      </div>
      <p className="text-[11px] text-slate-400 mt-0.5">Scan to verify authenticity</p>

      {includeLink && (
        <div className="mt-3 flex items-center gap-2">
          <Link
            to={`/verify/${certificateNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-800 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200 hover:bg-blue-100 transition-colors"
          >
            <span>Verify Live</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
          <button
            onClick={copyToClipboard}
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 hover:bg-slate-200 transition-colors"
            title="Copy verification link"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      )}
    </div>
  );
};
