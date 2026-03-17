import { useState } from 'react';
import { Printer, Search, FileText, Upload, Trash2, Download, Palette, ArrowsUpFromLine, Type, Sliders } from 'lucide-react';
import { FileUpload } from './components/FileUpload';
import { FileList } from './components/FileList';

function App() {
  const [showUploadManager, setShowUploadManager] = useState(false);
  const [addresses, setAddresses] = useState<Array<{ name: string; details: string[] }>>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const [config, setConfig] = useState({
    nameColor: '#000080',
    addressColor: '#006400',
    nameSize: 14,
    addressSize: 13,
    verticalSpacing: 12,
    showLine: true,
    lineColor: '#000080',
    boxColor: '#ffffff'
  });

  const parseData = (text: string) => {
    const blocks = text.split(/--------------------------+/);
    const parsed = blocks
      .map(block => block.trim())
      .filter(block => {
        const clean = block.toLowerCase();
        return block.length > 0 &&
               !clean.includes("communication address") &&
               !clean.includes("name (பெயர்)");
      })
      .map(block => {
        const lines = block.split('\n').map(l => l.trim());
        return {
          name: lines[0],
          details: lines.slice(1)
        };
      });
    setAddresses(parsed);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => parseData(event.target?.result as string);
      reader.readAsText(file);
    }
  };

  const filteredAddresses = addresses.filter(addr =>
    addr.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    addr.details.some(line => line.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handlePrint = () => window.print();

  const clearData = () => {
    if(window.confirm("Clear all loaded addresses?")) setAddresses([]);
  };

  const downloadHtml = () => {
    const labelHtml = filteredAddresses.map(addr => `
      <div class="label" style="background-color: ${config.boxColor};">
        <div class="name" style="color: ${config.nameColor}; border-bottom: ${config.showLine ? `2px solid ${config.lineColor}` : 'none'}; font-size: ${config.nameSize}px; margin-bottom: ${config.verticalSpacing}px;">
          ${addr.name}
        </div>
        <div class="details" style="color: ${config.addressColor}; font-size: ${config.addressSize}px;">
          ${addr.details.map(line => `<div>${line}</div>`).join('')}
        </div>
      </div>
    `).join('');

    const fullHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Address Labels Export</title>
  <style>
    body { font-family: sans-serif; background: #f1f5f9; padding: 20px; margin: 0; }
    .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; max-width: 1200px; margin: auto; }
    .label {
      background: white; border: 1px solid #cbd5e1; border-radius: 4px; padding: 15px;
      min-height: 140px; display: flex; flex-direction: column; box-sizing: border-box;
    }
    .name { font-weight: 900; text-transform: uppercase; padding-bottom: 6px; }
    .details { font-weight: 800; text-transform: uppercase; line-height: 1.3; }
    @media print {
      body { background: white; padding: 0; }
      .grid { grid-template-columns: repeat(3, 1fr); gap: 10px; }
      .label { border: 1px solid #ccc; box-shadow: none; page-break-inside: avoid; border-radius: 0; }
      * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    }
  </style>
</head>
<body>
  <div class="grid">${labelHtml}</div>
</body>
</html>`;

    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'custom_address_labels.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-50 print:bg-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto mb-8 print:hidden">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2 italic">
                <FileText className="text-blue-600" />
                BULK LABEL PRO
              </h1>
              <p className="text-slate-500 text-sm font-bold uppercase tracking-tighter">
                {addresses.length > 0 ? `${addresses.length} Labels Loaded` : "Upload TXT file to start"}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setShowUploadManager(!showUploadManager)}
                className="flex items-center gap-2 bg-slate-600 hover:bg-slate-700 text-white px-4 py-3 rounded-xl font-black text-sm transition-all uppercase"
              >
                <FileText size={18} />
                {showUploadManager ? 'Hide' : 'Manage'} Files
              </button>
              {addresses.length > 0 && (
                <>
                  <button onClick={clearData} title="Clear Data" className="p-3 text-slate-400 hover:text-red-500 transition-colors bg-slate-50 rounded-xl">
                    <Trash2 size={20} />
                  </button>
                  <button onClick={downloadHtml} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-xl font-black text-sm transition-all uppercase">
                    <Download size={18} />
                    HTML
                  </button>
                  <button onClick={handlePrint} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-black text-sm transition-all shadow-lg shadow-blue-200 uppercase">
                    <Printer size={18} />
                    Print / PDF
                  </button>
                </>
              )}
            </div>
          </div>

          {addresses.length > 0 && (
            <div className="bg-slate-50 p-6 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 border-b border-slate-100">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-slate-700 font-black text-xs uppercase">
                  <Palette size={14} /> Colors
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Name</span>
                      <input type="color" value={config.nameColor} onChange={(e) => setConfig({...config, nameColor: e.target.value})} className="h-10 w-12 rounded cursor-pointer" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Addr</span>
                      <input type="color" value={config.addressColor} onChange={(e) => setConfig({...config, addressColor: e.target.value})} className="h-10 w-12 rounded cursor-pointer" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Line</span>
                      <input type="color" value={config.lineColor} onChange={(e) => setConfig({...config, lineColor: e.target.value})} className="h-10 w-12 rounded cursor-pointer" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Box</span>
                      <input type="color" value={config.boxColor} onChange={(e) => setConfig({...config, boxColor: e.target.value})} className="h-10 w-12 rounded cursor-pointer" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-slate-700 font-black text-xs uppercase">
                  <Type size={14} /> Font Size (px)
                </div>
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase flex justify-between">Name <span>{config.nameSize}px</span></span>
                    <input type="range" min="10" max="30" value={config.nameSize} onChange={(e) => setConfig({...config, nameSize: parseInt(e.target.value)})} className="accent-blue-600 h-2" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase flex justify-between">Addr <span>{config.addressSize}px</span></span>
                    <input type="range" min="10" max="30" value={config.addressSize} onChange={(e) => setConfig({...config, addressSize: parseInt(e.target.value)})} className="accent-emerald-600 h-2" />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-slate-700 font-black text-xs uppercase">
                  <ArrowsUpFromLine size={14} /> Vertical Space
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase flex justify-between">Gap <span>{config.verticalSpacing}px</span></span>
                  <input type="range" min="0" max="60" value={config.verticalSpacing} onChange={(e) => setConfig({...config, verticalSpacing: parseInt(e.target.value)})} className="accent-slate-600 h-2" />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-slate-700 font-black text-xs uppercase">
                  <Sliders size={14} /> Styling
                </div>
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <div className={`w-12 h-6 rounded-full transition-all flex items-center px-1 ${config.showLine ? 'bg-blue-600' : 'bg-slate-300'}`} onClick={() => setConfig({...config, showLine: !config.showLine})}>
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${config.showLine ? 'translate-x-6' : 'translate-x-0'}`} />
                  </div>
                  <span className="text-sm font-black text-slate-600 uppercase">Underline Name</span>
                </label>
              </div>
            </div>
          )}

          <div className="p-4">
            {addresses.length === 0 ? (
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  const file = e.dataTransfer.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (ev) => parseData(ev.target?.result as string);
                    reader.readAsText(file);
                  }
                }}
                className={`border-4 border-dashed rounded-xl p-12 text-center transition-all ${
                  isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-slate-50'
                }`}
              >
                <Upload className="mx-auto mb-4 text-slate-300" size={48} />
                <p className="text-slate-800 font-black uppercase text-lg">Drop your Address File here</p>
                <input type="file" accept=".txt" onChange={handleFileUpload} className="hidden" id="fileInput" />
                <label htmlFor="fileInput" className="cursor-pointer bg-blue-600 text-white px-8 py-3 rounded-xl mt-4 inline-block font-black uppercase shadow-lg shadow-blue-100 hover:scale-105 transition-transform">
                  Choose File
                </label>
              </div>
            ) : (
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search labels by name or keyword..."
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-xl focus:outline-none focus:border-blue-500 font-bold"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {showUploadManager && (
        <div className="max-w-6xl mx-auto mb-8 print:hidden space-y-6">
          <FileUpload onFileUploaded={() => {}} />
          <FileList />
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 print:grid-cols-3 print:gap-4">
          {filteredAddresses.map((addr, index) => (
            <div
              key={index}
              className="border-2 border-slate-200 rounded-xl p-6 flex flex-col justify-start min-h-[160px] print:border-slate-300 print:rounded-none print:break-inside-avoid print:p-5"
              style={{
                backgroundColor: config.boxColor,
                WebkitPrintColorAdjust: 'exact',
                printColorAdjust: 'exact'
              } as React.CSSProperties}
            >
              <div
                className="font-black uppercase tracking-tight pb-2"
                style={{
                    color: config.nameColor,
                    borderBottom: config.showLine ? `2px solid ${config.lineColor}` : 'none',
                    fontSize: `${config.nameSize}px`,
                    marginBottom: `${config.verticalSpacing}px`,
                    WebkitPrintColorAdjust: 'exact',
                    printColorAdjust: 'exact'
                } as React.CSSProperties}
              >
                {addr.name}
              </div>
              <div className="space-y-1">
                {addr.details.map((line, lIdx) => (
                  <p
                    key={lIdx}
                    className="font-extrabold leading-tight uppercase"
                    style={{
                        color: config.addressColor,
                        fontSize: `${config.addressSize}px`,
                        WebkitPrintColorAdjust: 'exact',
                        printColorAdjust: 'exact'
                    } as React.CSSProperties}
                  >
                    {line}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media print {
          @page { margin: 1cm; size: A4; }
          body { background-color: white !important; padding: 0 !important; }
          .print\\:break-inside-avoid { page-break-inside: avoid; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; }
        }
      `}</style>
    </div>
  );
}

export default App;
