import React, { useState, useEffect } from 'react';
import { PackageSearch, Download, Printer, TableProperties, Settings, BarChart3 } from 'lucide-react';
import Dashboard from './components/Dashboard';
import Management from './components/Management';
import { AppData, ViewMode, MasterItem, Supplier } from './types';
import { INITIAL_MASTER_ITEMS, INITIAL_SUPPLIERS } from './constants';

function App() {
  // State Management
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [data, setData] = useState<AppData>({
    masterItems: INITIAL_MASTER_ITEMS,
    suppliers: INITIAL_SUPPLIERS
  });

  // Persist to LocalStorage (Basic persistence)
  useEffect(() => {
    const saved = localStorage.getItem('procurement_data_v1');
    if (saved) {
      try {
        setData(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load local data", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('procurement_data_v1', JSON.stringify(data));
  }, [data]);

  // Handlers for Data Updates
  const updateMasterItems = (newItems: MasterItem[]) => {
      setData(prev => ({ ...prev, masterItems: newItems }));
  };

  const updateSuppliers = (newSuppliers: Supplier[]) => {
      setData(prev => ({ ...prev, suppliers: newSuppliers }));
  };

  const handleExportCSV = () => {
     // Basic Export Logic for the current view state
     let csvContent = "data:text/csv;charset=utf-8,";
     
     // Headers
     const headerRow = ['Kode Item', 'Nama Item', 'Unit', 'Kategori', 'Harga Terbaik', 'Supplier Termurah'];
     data.suppliers.forEach(s => headerRow.push(`Harga ${s.name}`));
     csvContent += headerRow.join(",") + "\r\n";

     data.masterItems.forEach(item => {
        const prices = data.suppliers.map(s => s.prices.find(p => p.itemCode === item.code)?.price || null);
        const validPrices = prices.filter((p): p is number => p !== null);
        const bestPrice = validPrices.length ? Math.min(...validPrices) : 0;
        
        // Find best supplier name
        let bestSupName = '-';
        if (bestPrice > 0) {
            const bestSup = data.suppliers.find(s => s.prices.find(p => p.itemCode === item.code && p.price === bestPrice));
            if (bestSup) bestSupName = bestSup.name;
        }

        const row = [
            `"${item.code}"`,
            `"${item.name}"`,
            item.unit,
            item.category,
            bestPrice,
            `"${bestSupName}"`
        ];
        
        prices.forEach(p => row.push(p ? p.toString() : ""));
        csvContent += row.join(",") + "\r\n";
     });

     const encodedUri = encodeURI(csvContent);
     const link = document.createElement("a");
     link.setAttribute("href", encodedUri);
     link.setAttribute("download", "laporan_harga_supplier.csv");
     document.body.appendChild(link);
     link.click();
     document.body.removeChild(link);
  };

  return (
    <div className="bg-slate-50 text-slate-800 h-screen flex flex-col overflow-hidden font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm flex-none z-20 no-print">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center h-auto md:h-16 py-3 md:py-0 gap-3">
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="bg-blue-600 text-white p-2 rounded-lg shadow-sm">
                        <PackageSearch size={24} />
                    </div>
                    <div>
                        <h1 className="text-lg md:text-xl font-bold text-slate-900 tracking-tight">Procurement Dashboard</h1>
                        <p className="text-xs text-slate-500 font-medium">Perbandingan Harga Supplier</p>
                    </div>
                </div>
                
                {/* Navigation & Actions */}
                <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                    
                    {/* View Switcher */}
                    <div className="flex bg-slate-100 p-1 rounded-lg mr-2">
                        <button 
                            onClick={() => setViewMode('dashboard')}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-all ${viewMode === 'dashboard' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <BarChart3 size={16} /> <span className="hidden sm:inline">Dashboard</span>
                        </button>
                        <button 
                            onClick={() => setViewMode('management')}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-all ${viewMode === 'management' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <Settings size={16} /> <span className="hidden sm:inline">Kelola Data</span>
                        </button>
                    </div>

                    <div className="h-6 w-px bg-slate-300 mx-1 hidden sm:block"></div>

                    <button 
                        onClick={() => window.print()}
                        className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
                    >
                        <Printer size={18} />
                        <span className="hidden sm:inline">Print</span>
                    </button>
                    
                    {viewMode === 'dashboard' && (
                        <button 
                            onClick={handleExportCSV}
                            className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors shadow-sm"
                        >
                            <TableProperties size={18} />
                            <span className="hidden sm:inline">Export CSV</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden relative">
        {viewMode === 'dashboard' ? (
            <Dashboard data={data} />
        ) : (
            <div className="w-full h-full overflow-hidden">
                <Management 
                    masterItems={data.masterItems} 
                    suppliers={data.suppliers}
                    onUpdateItems={updateMasterItems}
                    onUpdateSuppliers={updateSuppliers}
                />
            </div>
        )}
      </main>
    </div>
  );
}

export default App;