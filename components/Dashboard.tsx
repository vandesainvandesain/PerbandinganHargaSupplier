import React, { useState, useMemo } from 'react';
import { AppData } from '../types';
import { Search } from 'lucide-react';

interface DashboardProps {
  data: AppData;
}

const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showBestOnly, setShowBestOnly] = useState(false);
  const [highlightDiff, setHighlightDiff] = useState(true);

  // Derive Categories
  const categories = useMemo(() => {
    return Array.from(new Set(data.masterItems.map(i => i.category))).sort();
  }, [data.masterItems]);

  // Calculations and Filtering
  const processedData = useMemo(() => {
    let countTotal = 0;
    const countBestMap: Record<string, number> = {};
    data.suppliers.forEach(s => countBestMap[s.name] = 0);

    const rows = data.masterItems.map(item => {
      // Filter logic
      if (selectedCategory !== 'All' && item.category !== selectedCategory) return null;
      const term = searchTerm.toLowerCase();
      if (term && !item.name.toLowerCase().includes(term) && !item.code.toLowerCase().includes(term)) return null;

      // Price logic
      const supplierPrices = data.suppliers.map(sup => {
        const p = sup.prices.find(p => p.itemCode === item.code);
        return {
          supplierName: sup.name,
          price: p ? p.price : null,
          lastUpdated: p ? p.lastUpdated : null
        };
      });

      const validPrices = supplierPrices
        .map(sp => sp.price)
        .filter((p): p is number => p !== null);
      
      const bestPrice = validPrices.length > 0 ? Math.min(...validPrices) : null;

      if (showBestOnly && bestPrice === null) return null;

      // Stats
      countTotal++;
      if (bestPrice !== null) {
        supplierPrices.forEach(sp => {
          if (sp.price === bestPrice) {
            countBestMap[sp.supplierName]++;
          }
        });
      }

      return {
        item,
        supplierPrices,
        bestPrice,
        bestSuppliers: supplierPrices.filter(sp => sp.price === bestPrice && bestPrice !== null).map(sp => sp.supplierName)
      };
    }).filter(Boolean);

    // Calc top supplier
    let topSupplier = '-';
    let maxCount = -1;
    Object.entries(countBestMap).forEach(([name, count]) => {
        if (count > maxCount && count > 0) {
            maxCount = count;
            topSupplier = name;
        }
    });

    return {
        rows,
        countTotal,
        topSupplier: topSupplier !== '-' ? `${topSupplier} (${maxCount} item)` : '-'
    };
  }, [data, searchTerm, selectedCategory, showBestOnly]);

  return (
    <div className="flex flex-1 overflow-hidden h-full">
      {/* Sidebar Filters - Desktop */}
      <aside className="w-72 bg-white border-r border-slate-200 flex-none flex flex-col hidden md:flex z-10 no-print">
        <div className="p-5 border-b border-slate-100">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Filter & Kontrol</h2>
          
          <div className="mb-5">
            <label className="block text-sm font-medium text-slate-700 mb-2">Cari Barang</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-slate-400" />
              </span>
              <input 
                type="text" 
                className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500 transition-colors outline-none" 
                placeholder="Nama item atau kode..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="mb-5">
            <label className="block text-sm font-medium text-slate-700 mb-2">Kategori</label>
            <select 
                className="block w-full py-2 pl-3 pr-10 text-sm border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 cursor-pointer border outline-none"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="All">Semua Kategori</option>
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          <div className="space-y-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input 
                    id="showBestOnly" 
                    type="checkbox" 
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                    checked={showBestOnly}
                    onChange={(e) => setShowBestOnly(e.target.checked)}
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="showBestOnly" className="font-medium text-slate-700 cursor-pointer">Hanya Best Price</label>
                <p className="text-xs text-slate-500">Sembunyikan item yang tidak ada data harga.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input 
                    id="highlightDiff" 
                    type="checkbox" 
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                    checked={highlightDiff}
                    onChange={(e) => setHighlightDiff(e.target.checked)}
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="highlightDiff" className="font-medium text-slate-700 cursor-pointer">Highlight Warna</label>
                <p className="text-xs text-slate-500">Warna hijau untuk termurah, merah untuk mahal.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-5 bg-slate-50 flex-1 overflow-y-auto">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Ringkasan Data</h3>
          <div className="space-y-3">
            <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
              <p className="text-xs text-slate-500">Item Ditampilkan</p>
              <p className="text-2xl font-bold text-slate-800">{processedData.countTotal}</p>
            </div>
            <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm border-l-4 border-l-green-500">
              <p className="text-xs text-slate-500">Best Supplier (Item Count)</p>
              <p className="text-sm font-bold text-slate-800 mt-1 truncate" title={processedData.topSupplier}>{processedData.topSupplier}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content (Table) */}
      <div className="flex-1 flex flex-col min-w-0 bg-white md:bg-slate-50/50">
        {/* Mobile Search Bar */}
        <div className="md:hidden p-4 bg-white border-b border-slate-200 no-print sticky top-0 z-20">
          <input 
            type="text" 
            className="block w-full px-3 py-2 border border-slate-300 rounded-md text-sm shadow-sm outline-none" 
            placeholder="Cari barang..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Table Container */}
        <div className="flex-1 overflow-auto custom-scrollbar p-0 md:p-6">
          <div className="bg-white md:rounded-xl md:shadow-sm md:border border-slate-200 overflow-hidden min-h-full relative">
            <div className="overflow-x-auto pb-10">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider sticky left-0 bg-slate-50 z-10 border-r border-slate-200 w-[250px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                      Item Details
                    </th>
                    <th scope="col" className="px-3 py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider w-[80px]">
                      Unit
                    </th>
                    {data.suppliers.map(sup => (
                        <th key={sup.id} scope="col" className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-50 border-r border-slate-100 min-w-[140px]">
                            {sup.name}
                        </th>
                    ))}
                    <th scope="col" className="px-4 py-3 text-right text-xs font-bold text-green-700 bg-green-50 uppercase tracking-wider border-l border-green-100 w-[150px]">
                      Best Price
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200 text-sm">
                    {processedData.rows.map((row: any) => (
                        <tr key={row.item.code} className="hover:bg-slate-50 transition-colors group">
                            <td className="px-4 py-3 sticky left-0 bg-white group-hover:bg-slate-50 border-r border-slate-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] w-[250px]">
                                <div>
                                    <div className="text-sm font-medium text-slate-900 truncate max-w-[220px]" title={row.item.name}>{row.item.name}</div>
                                    <div className="text-[10px] text-slate-400 font-mono">{row.item.code}</div>
                                </div>
                            </td>
                            <td className="px-3 py-3 text-center text-xs text-slate-500 w-[80px]">
                                <span className="px-2 py-1 bg-slate-100 rounded-md border border-slate-200">{row.item.unit}</span>
                            </td>
                            {row.supplierPrices.map((sp: any, idx: number) => {
                                let cellClass = "px-4 py-3 text-sm text-right whitespace-nowrap border-r border-slate-50";
                                let content = "-";
                                let dateInfo = "";

                                if (sp.price !== null) {
                                    content = `Rp ${sp.price.toLocaleString('id-ID')}`;
                                    dateInfo = sp.lastUpdated;

                                    if (highlightDiff && row.bestPrice !== null) {
                                        if (sp.price === row.bestPrice) {
                                            cellClass += " font-bold text-green-700 bg-green-50/30";
                                        } else if (sp.price > row.bestPrice) {
                                            cellClass += " text-red-500 bg-red-50/10";
                                        }
                                    }
                                } else {
                                    cellClass += " text-slate-300";
                                }

                                return (
                                    <td key={idx} className={cellClass} title={dateInfo ? `Updated: ${dateInfo}` : ''}>
                                        {content}
                                    </td>
                                );
                            })}
                            <td className="px-4 py-3 text-right text-sm font-bold text-green-700 bg-green-50 border-l border-green-100 w-[150px]">
                                {row.bestPrice !== null ? `Rp ${row.bestPrice.toLocaleString('id-ID')}` : '-'}
                                <div className="text-[10px] font-normal text-green-600 truncate max-w-[140px]" title={row.bestSuppliers.join(', ')}>
                                    {row.bestSuppliers.length > 0 ? row.bestSuppliers[0] : ''} {row.bestSuppliers.length > 1 ? `(+${row.bestSuppliers.length - 1})` : ''}
                                </div>
                            </td>
                        </tr>
                    ))}
                    {processedData.rows.length === 0 && (
                        <tr>
                            <td colSpan={3 + data.suppliers.length} className="px-4 py-10 text-center text-slate-500">
                                <div className="flex flex-col items-center justify-center">
                                    <span className="material-symbols-outlined text-4xl text-slate-400 mb-2">search_off</span>
                                    <p>Data tidak ditemukan</p>
                                </div>
                            </td>
                        </tr>
                    )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;