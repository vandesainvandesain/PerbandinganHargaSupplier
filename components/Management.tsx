import React, { useState } from 'react';
import { MasterItem, Supplier, SupplierPrice, ManagementTab } from '../types';
import { Plus, Trash2, Edit2, AlertTriangle, Save, X, Calendar, Upload } from 'lucide-react';
import Modal from './Modal';
import DataImporter from './DataImporter';

interface ManagementProps {
  masterItems: MasterItem[];
  suppliers: Supplier[];
  onUpdateItems: (items: MasterItem[]) => void;
  onUpdateSuppliers: (suppliers: Supplier[]) => void;
}

const Management: React.FC<ManagementProps> = ({ masterItems, suppliers, onUpdateItems, onUpdateSuppliers }) => {
  const [activeTab, setActiveTab] = useState<ManagementTab>('suppliers');
  
  // State for Supplier CRUD
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [deleteConfirmSupplier, setDeleteConfirmSupplier] = useState<Supplier | null>(null);
  
  // State for Item CRUD (Inside Supplier)
  const [editingPrice, setEditingPrice] = useState<Partial<SupplierPrice> | null>(null);
  const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);
  const [currentSupplierIdForPrice, setCurrentSupplierIdForPrice] = useState<string | null>(null);

  // State for Master Item CRUD
  const [editingMasterItem, setEditingMasterItem] = useState<Partial<MasterItem> | null>(null);
  const [isMasterItemModalOpen, setIsMasterItemModalOpen] = useState(false);

  // --- Supplier Handlers ---

  const handleSaveSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSupplier) return;

    if (editingSupplier.id) {
      // Update existing
      onUpdateSuppliers(suppliers.map(s => s.id === editingSupplier.id ? editingSupplier : s));
    } else {
      // Create new
      const newSupplier = { ...editingSupplier, id: `sup_${Date.now()}`, prices: [] };
      onUpdateSuppliers([...suppliers, newSupplier]);
    }
    setIsSupplierModalOpen(false);
    setEditingSupplier(null);
  };

  const handleDeleteSupplier = () => {
    if (deleteConfirmSupplier) {
      onUpdateSuppliers(suppliers.filter(s => s.id !== deleteConfirmSupplier.id));
      setDeleteConfirmSupplier(null);
    }
  };

  // --- Price Handlers ---

  const handleOpenPriceModal = (supplierId: string, priceData?: SupplierPrice) => {
    setCurrentSupplierIdForPrice(supplierId);
    if (priceData) {
        setEditingPrice({ ...priceData });
    } else {
        setEditingPrice({ itemCode: '', price: 0, lastUpdated: new Date().toISOString().split('T')[0] });
    }
    setIsPriceModalOpen(true);
  };

  const handleSavePrice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSupplierIdForPrice || !editingPrice || !editingPrice.itemCode) return;

    const supplierIndex = suppliers.findIndex(s => s.id === currentSupplierIdForPrice);
    if (supplierIndex === -1) return;

    const updatedSuppliers = [...suppliers];
    const supplier = { ...updatedSuppliers[supplierIndex] };
    const existingPriceIndex = supplier.prices.findIndex(p => p.itemCode === editingPrice.itemCode);

    const newPriceEntry: SupplierPrice = {
        itemCode: editingPrice.itemCode,
        price: Number(editingPrice.price),
        lastUpdated: editingPrice.lastUpdated || new Date().toISOString().split('T')[0]
    };

    if (existingPriceIndex >= 0) {
        // Update existing price for this item
        const newPrices = [...supplier.prices];
        newPrices[existingPriceIndex] = newPriceEntry;
        supplier.prices = newPrices;
    } else {
        // Add new item price
        supplier.prices = [...supplier.prices, newPriceEntry];
    }

    updatedSuppliers[supplierIndex] = supplier;
    onUpdateSuppliers(updatedSuppliers);
    setIsPriceModalOpen(false);
    setEditingPrice(null);
  };

  const handleDeletePrice = (supplierId: string, itemCode: string) => {
    if (!window.confirm("Hapus harga barang ini dari supplier?")) return;
    const updatedSuppliers = suppliers.map(s => {
        if (s.id === supplierId) {
            return {
                ...s,
                prices: s.prices.filter(p => p.itemCode !== itemCode)
            };
        }
        return s;
    });
    onUpdateSuppliers(updatedSuppliers);
  };

  // --- Master Item Handlers ---
  const handleSaveMasterItem = (e: React.FormEvent) => {
      e.preventDefault();
      if (!editingMasterItem || !editingMasterItem.name) return;

      if (editingMasterItem.code && masterItems.some(i => i.code === editingMasterItem.code)) {
          // Update
           onUpdateItems(masterItems.map(i => i.code === editingMasterItem.code ? editingMasterItem as MasterItem : i));
      } else {
          // Create
          const code = editingMasterItem.code || `ITM-${Date.now()}`;
          onUpdateItems([...masterItems, { ...editingMasterItem, code } as MasterItem]);
      }
      setIsMasterItemModalOpen(false);
      setEditingMasterItem(null);
  }

  const handleDeleteMasterItem = (code: string) => {
      if(window.confirm("Menghapus Master Item tidak menghapus harga di supplier (hanya referensinya). Lanjutkan?")) {
        onUpdateItems(masterItems.filter(i => i.code !== code));
      }
  }


  return (
    <div className="flex flex-col h-full bg-slate-50/50">
      {/* Tab Navigation */}
      <div className="flex border-b border-slate-200 bg-white px-6">
        <button
          onClick={() => setActiveTab('suppliers')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'suppliers' 
              ? 'border-blue-600 text-blue-600' 
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Kelola Supplier & Harga
        </button>
        <button
          onClick={() => setActiveTab('items')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'items' 
              ? 'border-blue-600 text-blue-600' 
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Master Data Barang
        </button>
         <button
          onClick={() => setActiveTab('importer')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'importer' 
              ? 'border-blue-600 text-blue-600' 
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Upload size={16} /> Import Data
        </button>
      </div>

      <div className="flex-1 overflow-auto p-6">
        
        {/* SUPPLIERS TAB */}
        {activeTab === 'suppliers' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-800">Daftar Supplier</h2>
              <button 
                onClick={() => { setEditingSupplier({ id: '', name: '', prices: [] }); setIsSupplierModalOpen(true); }}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
              >
                <Plus size={16} /> Tambah Supplier
              </button>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {suppliers.map(supplier => (
                <div key={supplier.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="bg-indigo-100 text-indigo-700 p-2 rounded-lg">
                            <span className="font-bold text-lg">{supplier.name.charAt(0)}</span>
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800">{supplier.name}</h3>
                            <p className="text-xs text-slate-500">{supplier.prices.length} Item terdaftar</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => { setEditingSupplier(supplier); setIsSupplierModalOpen(true); }}
                            className="p-2 text-slate-500 hover:bg-slate-200 rounded-lg transition-colors" title="Edit Nama Supplier">
                            <Edit2 size={16} />
                        </button>
                        <button 
                            onClick={() => setDeleteConfirmSupplier(supplier)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Hapus Supplier">
                            <Trash2 size={16} />
                        </button>
                    </div>
                  </div>
                  
                  {/* Supplier Price List */}
                  <div className="p-0">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50/50 border-b border-slate-100">
                            <tr>
                                <th className="px-4 py-2">Nama Barang</th>
                                <th className="px-4 py-2">Harga</th>
                                <th className="px-4 py-2">Update Terakhir</th>
                                <th className="px-4 py-2 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {supplier.prices.map((price) => {
                                const itemDetails = masterItems.find(m => m.code === price.itemCode);
                                return (
                                    <tr key={price.itemCode} className="hover:bg-slate-50 group">
                                        <td className="px-4 py-2 font-medium text-slate-700">
                                            {itemDetails ? itemDetails.name : price.itemCode}
                                            <span className="block text-[10px] text-slate-400 font-mono">{price.itemCode}</span>
                                        </td>
                                        <td className="px-4 py-2">
                                            Rp {price.price.toLocaleString('id-ID')}
                                        </td>
                                        <td className="px-4 py-2 text-slate-500 text-xs flex items-center gap-1">
                                            <Calendar size={12} />
                                            {price.lastUpdated}
                                        </td>
                                        <td className="px-4 py-2 text-right">
                                            <button 
                                                onClick={() => handleOpenPriceModal(supplier.id, price)}
                                                className="text-blue-600 hover:text-blue-800 mr-2">Edit</button>
                                            <button 
                                                onClick={() => handleDeletePrice(supplier.id, price.itemCode)}
                                                className="text-red-500 hover:text-red-700">Hapus</button>
                                        </td>
                                    </tr>
                                );
                            })}
                            {supplier.prices.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-4 py-6 text-center text-slate-400 italic">
                                        Belum ada data harga barang
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    <div className="p-3 border-t border-slate-100 bg-slate-50/30">
                        <button 
                            onClick={() => handleOpenPriceModal(supplier.id)}
                            className="w-full py-2 border border-dashed border-slate-300 rounded-lg text-slate-500 hover:bg-slate-50 hover:border-slate-400 hover:text-slate-600 transition-all text-sm flex items-center justify-center gap-2">
                            <Plus size={14} /> Tambah / Update Barang ke Supplier
                        </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MASTER ITEMS TAB */}
        {activeTab === 'items' && (
           <div className="space-y-6">
               <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-800">Master Data Barang</h2>
              <button 
                onClick={() => { setEditingMasterItem({ code: '', name: '', category: 'Umum', unit: 'Pcs' }); setIsMasterItemModalOpen(true); }}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
              >
                <Plus size={16} /> Tambah Item Baru
              </button>
            </div>
            
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs">
                        <tr>
                            <th className="px-4 py-3">Kode</th>
                            <th className="px-4 py-3">Nama Barang</th>
                            <th className="px-4 py-3">Kategori</th>
                            <th className="px-4 py-3">Unit</th>
                            <th className="px-4 py-3 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {masterItems.map(item => (
                            <tr key={item.code} className="hover:bg-slate-50">
                                <td className="px-4 py-2 font-mono text-xs text-slate-500">{item.code}</td>
                                <td className="px-4 py-2 font-medium text-slate-800">{item.name}</td>
                                <td className="px-4 py-2">
                                    <span className="px-2 py-1 bg-slate-100 rounded text-xs text-slate-600 border border-slate-200">
                                        {item.category}
                                    </span>
                                </td>
                                <td className="px-4 py-2">{item.unit}</td>
                                <td className="px-4 py-2 text-right">
                                    <button onClick={() => { setEditingMasterItem(item); setIsMasterItemModalOpen(true); }} className="text-blue-600 hover:text-blue-800 mr-3"><Edit2 size={16}/></button>
                                    <button onClick={() => handleDeleteMasterItem(item.code)} className="text-red-500 hover:text-red-700"><Trash2 size={16}/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
           </div> 
        )}

        {/* IMAGE IMPORTER TAB */}
        {activeTab === 'importer' && (
           <DataImporter 
            masterItems={masterItems}
            suppliers={suppliers}
            onUpdateItems={onUpdateItems}
            onUpdateSuppliers={onUpdateSuppliers}
           />
        )}
      </div>

      {/* --- MODALS --- */}

      {/* 1. Supplier Modal (Add/Edit) */}
      <Modal
        isOpen={isSupplierModalOpen}
        onClose={() => setIsSupplierModalOpen(false)}
        title={editingSupplier?.id ? "Edit Supplier" : "Tambah Supplier Baru"}
        footer={
            <>
                <button onClick={() => setIsSupplierModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium">Batal</button>
                <button onClick={handleSaveSupplier} className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-sm font-medium">Simpan</button>
            </>
        }
      >
        <form onSubmit={handleSaveSupplier} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nama Supplier</label>
                <input 
                    type="text" 
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={editingSupplier?.name || ''}
                    onChange={e => setEditingSupplier(prev => prev ? { ...prev, name: e.target.value } : null)}
                />
            </div>
        </form>
      </Modal>

      {/* 2. Delete Supplier Warning Modal */}
      <Modal
        isOpen={!!deleteConfirmSupplier}
        onClose={() => setDeleteConfirmSupplier(null)}
        title="Peringatan Hapus Supplier"
        type="danger"
        footer={
            <>
                <button onClick={() => setDeleteConfirmSupplier(null)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium">Batal</button>
                <button onClick={handleDeleteSupplier} className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg text-sm font-medium">Ya, Hapus Permanen</button>
            </>
        }
      >
        <div className="flex flex-col items-center text-center p-2">
            <div className="bg-red-100 p-3 rounded-full mb-3 text-red-600">
                <AlertTriangle size={32} />
            </div>
            <p className="text-slate-800 font-medium mb-2">
                Apakah Anda yakin ingin menghapus supplier <span className="font-bold text-red-600">"{deleteConfirmSupplier?.name}"</span>?
            </p>
            <p className="text-sm text-slate-500">
                Tindakan ini akan <strong className="text-slate-700">menghapus semua daftar harga barang</strong> yang terkait dengan supplier ini. Data yang dihapus tidak dapat dikembalikan.
            </p>
        </div>
      </Modal>

      {/* 3. Price/Item Modal */}
      <Modal
         isOpen={isPriceModalOpen}
         onClose={() => setIsPriceModalOpen(false)}
         title="Kelola Harga Barang Supplier"
         footer={
             <>
                 <button onClick={() => setIsPriceModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium">Batal</button>
                 <button onClick={handleSavePrice} className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-sm font-medium">Simpan Harga</button>
             </>
         }
      >
        <form onSubmit={handleSavePrice} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Pilih Barang</label>
                <select 
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={editingPrice?.itemCode || ''}
                    onChange={e => setEditingPrice(prev => prev ? { ...prev, itemCode: e.target.value } : null)}
                    required
                >
                    <option value="">-- Pilih Barang Master --</option>
                    {masterItems.map(item => (
                        <option key={item.code} value={item.code}>{item.name} ({item.unit})</option>
                    ))}
                </select>
                <p className="text-xs text-slate-400 mt-1">Barang tidak ada di list? Tambahkan di tab Master Data Barang dulu.</p>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Harga (Rp)</label>
                <input 
                    type="number" 
                    required
                    min="0"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={editingPrice?.price || ''}
                    onChange={e => setEditingPrice(prev => prev ? { ...prev, price: Number(e.target.value) } : null)}
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal Harga / Periode</label>
                <input 
                    type="date" 
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={editingPrice?.lastUpdated || ''}
                    onChange={e => setEditingPrice(prev => prev ? { ...prev, lastUpdated: e.target.value } : null)}
                />
            </div>
        </form>
      </Modal>

      {/* 4. Master Item Modal */}
      <Modal
        isOpen={isMasterItemModalOpen}
        onClose={() => setIsMasterItemModalOpen(false)}
        title={editingMasterItem?.code ? "Edit Master Barang" : "Tambah Master Barang"}
        footer={
             <>
                 <button onClick={() => setIsMasterItemModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium">Batal</button>
                 <button onClick={handleSaveMasterItem} className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-sm font-medium">Simpan</button>
             </>
         }
      >
           <form onSubmit={handleSaveMasterItem} className="space-y-4">
            {editingMasterItem?.code && (
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Kode Item (Tidak bisa diubah)</label>
                    <input type="text" disabled value={editingMasterItem.code} className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-lg text-slate-500" />
                </div>
            )}
            {!editingMasterItem?.code && (
                <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">Kode Item (Manual Input)</label>
                     <input 
                        type="text" 
                        placeholder="Contoh: BP-BRS-005"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        value={editingMasterItem?.code || ''}
                        onChange={e => setEditingMasterItem(prev => prev ? { ...prev, code: e.target.value } : null)}
                    />
                     <p className="text-xs text-slate-400 mt-1">Kosongkan untuk auto-generate.</p>
                </div>
            )}
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nama Barang</label>
                <input 
                    type="text" 
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={editingMasterItem?.name || ''}
                    onChange={e => setEditingMasterItem(prev => prev ? { ...prev, name: e.target.value } : null)}
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Kategori</label>
                <input 
                    type="text" 
                    list="categoryList"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={editingMasterItem?.category || ''}
                    onChange={e => setEditingMasterItem(prev => prev ? { ...prev, category: e.target.value } : null)}
                />
                <datalist id="categoryList">
                    <option value="Bahan Pokok Kering" />
                    <option value="Bahan Segar" />
                    <option value="Minyak" />
                    <option value="Kebersihan" />
                    <option value="Bumbu" />
                </datalist>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Unit / Satuan</label>
                <select 
                     className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                     value={editingMasterItem?.unit || 'Kg'}
                     onChange={e => setEditingMasterItem(prev => prev ? { ...prev, unit: e.target.value } : null)}
                >
                    <option value="Kg">Kg</option>
                    <option value="Pcs">Pcs</option>
                    <option value="Bks">Bks</option>
                    <option value="L">Liter</option>
                    <option value="Btr">Butir</option>
                    <option value="Klg">Kaleng</option>
                    <option value="Pch">Pouch</option>
                </select>
            </div>
        </form>
      </Modal>
    </div>
  );
};

export default Management;