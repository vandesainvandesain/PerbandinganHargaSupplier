import React, { useState } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { MasterItem, Supplier, SupplierPrice } from '../types';
import { UploadCloud, Loader2, Wand2, AlertCircle, Inbox, Save, FileText, FileSpreadsheet, Image } from 'lucide-react';

interface DataImporterProps {
  masterItems: MasterItem[];
  suppliers: Supplier[];
  onUpdateItems: (items: MasterItem[]) => void;
  onUpdateSuppliers: (suppliers: Supplier[]) => void;
}

type ParsedItem = {
  id: number;
  itemName: string;
  price: number;
  match: string; // 'NEW', 'EXISTING', 'IGNORE'
  matchedItemCode: string | null;
};

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

const DataImporter: React.FC<DataImporterProps> = ({ masterItems, suppliers, onUpdateItems, onUpdateSuppliers }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedItems, setParsedItems] = useState<ParsedItem[]>([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (file.type.startsWith('image/')) {
        setPreviewUrl(URL.createObjectURL(file));
      } else {
        setPreviewUrl(null);
      }
      setParsedItems([]);
      setError(null);
    }
  };
  
  const parseCSV = (file: File) => {
    return new Promise<void>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const text = event.target?.result as string;
          const lines = text.split(/\r\n|\n/).filter(line => line.trim() !== '');
          if (lines.length < 2) throw new Error("File CSV kosong atau hanya berisi header.");
          
          const header = lines[0].split(',').map(h => h.trim().toLowerCase());
          const nameIndex = header.indexOf('itemname');
          const priceIndex = header.indexOf('price');

          if (nameIndex === -1 || priceIndex === -1) {
            throw new Error("Header CSV tidak valid. Harus mengandung 'itemName' dan 'price'.");
          }

          const items: ParsedItem[] = lines.slice(1).map((line, index) => {
            const data = line.split(',');
            const name = data[nameIndex]?.trim();
            const price = parseFloat(data[priceIndex]);

            if (!name || isNaN(price)) {
              console.warn(`Skipping invalid row ${index + 2}: ${line}`);
              return null;
            }
            
            const existingItem = masterItems.find(mi => mi.name.toLowerCase() === name.toLowerCase());
            return {
              id: index,
              itemName: name,
              price: price,
              match: existingItem ? 'EXISTING' : 'NEW',
              matchedItemCode: existingItem ? existingItem.code : null,
            };
          }).filter((i): i is ParsedItem => i !== null);

          setParsedItems(items);
          resolve();
        } catch (e: any) {
          reject(e);
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsText(file);
    });
  };

  const processWithAI = async (file: File) => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    const filePart = await fileToGenerativePart(file);

    const response = await ai.models.generateContent({
      model: 'gemini-flash-latest',
      contents: {
        parts: [
          filePart,
          { text: "Analisa file (bisa berupa gambar atau dokumen) berisi daftar harga ini. Ekstrak nama barang dan harganya. Abaikan barang yang tidak memiliki harga. Kembalikan hasilnya dalam format JSON. Produk-produk ini adalah bahan makanan dari Indonesia." }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              itemName: { type: Type.STRING, description: "Nama barang yang terdeteksi" },
              price: { type: Type.NUMBER, description: "Harga barang" }
            },
            required: ["itemName", "price"]
          }
        }
      }
    });
    
    const parsedJson = JSON.parse(response.text);
    
    if (!Array.isArray(parsedJson)) {
      throw new Error("Format respons AI tidak valid.");
    }
    
    const processedItems = parsedJson.map((item: any, index: number): ParsedItem => {
      const existingItem = masterItems.find(mi => mi.name.toLowerCase() === item.itemName.toLowerCase().trim());
      return {
        id: index,
        itemName: item.itemName,
        price: item.price,
        match: existingItem ? 'EXISTING' : 'NEW',
        matchedItemCode: existingItem ? existingItem.code : null,
      };
    });

    setParsedItems(processedItems);
  };

  const processFile = async () => {
    if (!selectedFile) return;
    setIsLoading(true);
    setError(null);
    setParsedItems([]);

    try {
        const fileType = selectedFile.type;
        if (fileType === 'text/csv') {
            await parseCSV(selectedFile);
        } else if (fileType.startsWith('image/') || fileType === 'application/pdf') {
            await processWithAI(selectedFile);
        } else {
            throw new Error(`Tipe file tidak didukung: ${fileType}. Harap unggah Gambar, PDF, atau CSV.`);
        }
    } catch (err: any) {
      console.error("Error processing file:", err);
      setError("Gagal memproses file. " + (err.message || "Unknown error"));
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleItemMatchChange = (id: number, newItemCode: string) => {
      setParsedItems(prev => prev.map(item => {
          if (item.id === id) {
              if (newItemCode === 'NEW') {
                  return { ...item, match: 'NEW', matchedItemCode: null };
              }
              if (newItemCode === 'IGNORE') {
                  return { ...item, match: 'IGNORE', matchedItemCode: null };
              }
              return { ...item, match: 'EXISTING', matchedItemCode: newItemCode };
          }
          return item;
      }));
  }

  const handleSaveChanges = () => {
    if (!selectedSupplierId) {
        alert("Pilih supplier terlebih dahulu!");
        return;
    }

    const itemsToAdd: MasterItem[] = [];
    const pricesToAdd: SupplierPrice[] = [];
    const today = new Date().toISOString().split('T')[0];

    parsedItems.forEach(item => {
        if (item.match === 'IGNORE') return;

        let itemCode = item.matchedItemCode;

        if (item.match === 'NEW') {
            const newItem: MasterItem = {
                code: `ITM-IMP-${Date.now()}-${item.id}`,
                name: item.itemName,
                category: 'Hasil Import',
                unit: 'Pcs'
            };
            itemsToAdd.push(newItem);
            itemCode = newItem.code;
        }

        if (itemCode) {
            pricesToAdd.push({
                itemCode: itemCode,
                price: item.price,
                lastUpdated: today
            });
        }
    });
    
    if (itemsToAdd.length > 0) {
        onUpdateItems([...masterItems, ...itemsToAdd]);
    }

    const updatedSuppliers = suppliers.map(s => {
        if (s.id === selectedSupplierId) {
            const newPrices = [...s.prices];
            pricesToAdd.forEach(newPrice => {
                const existingIndex = newPrices.findIndex(p => p.itemCode === newPrice.itemCode);
                if (existingIndex > -1) {
                    newPrices[existingIndex] = newPrice;
                } else {
                    newPrices.push(newPrice);
                }
            });
            return { ...s, prices: newPrices };
        }
        return s;
    });
    onUpdateSuppliers(updatedSuppliers);
    
    alert(`${pricesToAdd.length} harga berhasil ditambahkan/diupdate ke supplier!`);
    
    setSelectedFile(null);
    setPreviewUrl(null);
    setParsedItems([]);
    setSelectedSupplierId('');
  };

  const handleDownloadTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8,itemName,price\nBeras Premium 5kg,75000\nTelur Ayam Negeri,30000";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "template_harga.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-1">Pusat Impor Data</h2>
          <p className="text-sm text-slate-500 mb-4">Unggah daftar harga dalam format Gambar, PDF, atau CSV. Biarkan AI dan sistem membantu Anda.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-4">
                  <label htmlFor="file-upload" className="relative w-full h-48 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 hover:border-blue-500 transition-all">
                      {previewUrl ? (
                          <img src={previewUrl} alt="Preview" className="h-full w-full object-contain rounded-lg p-2" />
                      ) : (
                          <>
                              <UploadCloud size={32} className="text-slate-400 mb-2"/>
                              <span className="text-slate-600 font-medium">Klik untuk memilih file</span>
                              <span className="text-xs text-slate-400 mt-1">
                                {selectedFile ? selectedFile.name : 'Gambar, PDF, CSV'}
                              </span>
                          </>
                      )}
                  </label>
                  <input id="file-upload" type="file" accept="image/*,application/pdf,text/csv" className="hidden" onChange={handleFileChange} capture="environment" />
                  
                  <div className='text-center text-xs text-slate-500'>
                    Untuk hasil terbaik dengan CSV, <button onClick={handleDownloadTemplate} className="text-blue-600 hover:underline font-medium">unduh template</button>.
                  </div>

                  <button 
                    onClick={processFile} 
                    disabled={!selectedFile || isLoading}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Wand2 size={20} />}
                    {isLoading ? 'Memproses...' : 'Proses File'}
                  </button>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex flex-col items-center justify-center text-center">
                  {isLoading && <Loader2 size={40} className="text-blue-500 animate-spin" />}
                  {error && <AlertCircle size={40} className="text-red-500" />}
                  {!isLoading && !error && parsedItems.length === 0 && (
                    <div className="flex gap-4 text-slate-400">
                        <Image size={32} />
                        <FileText size={32} />
                        <FileSpreadsheet size={32} />
                    </div>
                  )}

                  <h3 className="text-lg font-bold text-slate-800 mt-4">
                      {isLoading ? "Sistem sedang bekerja..." : error ? "Terjadi Kesalahan" : parsedItems.length > 0 ? `${parsedItems.length} Item Ditemukan` : "Hasil Akan Tampil di Sini"}
                  </h3>
                  <p className="text-sm text-slate-500 mt-1 max-w-sm">
                      {isLoading ? "Harap tunggu sejenak, file sedang dianalisa." : error ? error : parsedItems.length > 0 ? "Silakan periksa dan cocokkan hasil di bawah ini sebelum menyimpan." : "Setelah file diunggah dan diproses, hasil ekstraksi akan muncul di bawah."}
                  </p>
              </div>
          </div>
      </div>

      {parsedItems.length > 0 && (
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-4">
                  <h3 className="text-lg font-bold text-slate-800">Review Hasil Import</h3>
                  <div className="flex gap-3 items-center w-full sm:w-auto">
                      <select 
                        value={selectedSupplierId}
                        onChange={(e) => setSelectedSupplierId(e.target.value)}
                        className="block w-full sm:w-64 py-2 pl-3 pr-10 text-sm border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 cursor-pointer border outline-none"
                      >
                          <option value="">-- Pilih Supplier Tujuan --</option>
                          {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                      <button 
                        onClick={handleSaveChanges}
                        disabled={!selectedSupplierId || isLoading}
                        className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:bg-slate-400"
                      >
                          <Save size={16} /> Simpan
                      </button>
                  </div>
              </div>

              <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                      <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs">
                          <tr>
                              <th className="px-4 py-3 text-left">Nama Terdeteksi</th>
                              <th className="px-4 py-3 text-right">Harga (Rp)</th>
                              <th className="px-4 py-3 text-left">Cocokkan dengan Master Data</th>
                              <th className="px-4 py-3 text-left">Status</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                          {parsedItems.map(item => (
                              <tr key={item.id} className="hover:bg-slate-50">
                                  <td className="px-4 py-2 font-medium text-slate-800">{item.itemName}</td>
                                  <td className="px-4 py-2 text-right font-mono">{item.price.toLocaleString('id-ID')}</td>
                                  <td className="px-4 py-2">
                                      <select 
                                        value={item.match === 'NEW' ? 'NEW' : item.match === 'IGNORE' ? 'IGNORE' : item.matchedItemCode || ''}
                                        onChange={(e) => handleItemMatchChange(item.id, e.target.value)}
                                        className="w-full text-sm p-1 border-slate-300 rounded-md outline-none focus:ring-1 focus:ring-blue-500"
                                      >
                                          <option value={item.matchedItemCode || ''} disabled hidden>{item.matchedItemCode ? masterItems.find(mi => mi.code === item.matchedItemCode)?.name : '-- Pilih --'}</option>
                                          <optgroup label="Aksi">
                                            <option value="NEW">Buat Item Baru</option>
                                            <option value="IGNORE">Abaikan Item Ini</option>
                                          </optgroup>
                                          <optgroup label="Master Item Tersedia">
                                            {masterItems.map(mi => <option key={mi.code} value={mi.code}>{mi.name}</option>)}
                                          </optgroup>
                                      </select>
                                  </td>
                                  <td className="px-4 py-2">
                                      {item.match === 'NEW' && <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">Baru</span>}
                                      {item.match === 'EXISTING' && <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">Cocok</span>}
                                      {item.match === 'IGNORE' && <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full">Diabaikan</span>}
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          </div>
      )}
    </div>
  );
};

export default DataImporter;
