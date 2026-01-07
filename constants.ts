import { MasterItem, Supplier } from './types';

export const INITIAL_MASTER_ITEMS: MasterItem[] = [
  { code: 'BP-BRS-001', name: 'Beras Ramos/Jembar', category: 'Bahan Pokok Kering', unit: 'Kg' },
  { code: 'BP-BRS-002', name: 'Beras P. Wangi', category: 'Bahan Pokok Kering', unit: 'Kg' },
  { code: 'BP-BRS-003', name: 'Beras Raja Premium', category: 'Bahan Pokok Kering', unit: 'Kg' },
  { code: 'BS-TLR-001', name: 'Telur Ayam', category: 'Bahan Segar', unit: 'Kg' },
  { code: 'BP-GLA-001', name: 'Gula Pasir', category: 'Bahan Pokok Kering', unit: 'Kg' },
  { code: 'BS-BUH-022', name: 'Strawberry', category: 'Bahan Segar', unit: 'Kg' },
  { code: 'BS-BUH-014', name: 'Apel Fuji', category: 'Bahan Segar', unit: 'Kg' },
  { code: 'BS-SYR-007', name: 'Cabai Rawit', category: 'Bahan Segar', unit: 'Kg' },
  { code: 'BP-MNY-001', name: 'Minyak Goreng Kunci Mas', category: 'Minyak', unit: 'L' },
  { code: 'BM-KMR-001', name: 'Kemiri', category: 'Bumbu', unit: 'Kg' },
  { code: 'BM-KTB-001', name: 'Ketumbar', category: 'Bumbu', unit: 'Kg' },
  { code: 'BS-BWM-001', name: 'Bawang Merah', category: 'Bahan Segar', unit: 'Kg' },
  { code: 'BS-BWP-001', name: 'Bawang Putih', category: 'Bahan Segar', unit: 'Kg' },
  { code: 'BS-BDN-001', name: 'Bawang Daun Kecil', category: 'Bahan Segar', unit: 'Bks' },
  { code: 'BS-BDN-002', name: 'Bawang Daun Besar', category: 'Bahan Segar', unit: 'Bks' },
  { code: 'BS-SYR-020', name: 'Kacang Panjang', category: 'Bahan Segar', unit: 'Kg' },
  { code: 'BS-SYR-021', name: 'Waluh', category: 'Bahan Segar', unit: 'Kg' },
  { code: 'BS-SYR-022', name: 'Waluh Kecil', category: 'Bahan Segar', unit: 'Kg' },
  { code: 'BS-SYR-023', name: 'Tomat', category: 'Bahan Segar', unit: 'Kg' },
  { code: 'BS-SYR-024', name: 'Kol Putih', category: 'Bahan Segar', unit: 'Kg' },
  { code: 'BS-SYR-025', name: 'Bloom Kol (Kembang Kol)', category: 'Bahan Segar', unit: 'Kg' },
  { code: 'BS-SYR-026', name: 'Brokoli', category: 'Bahan Segar', unit: 'Kg' },
  { code: 'BS-SYR-027', name: 'Jagung Kupas', category: 'Bahan Segar', unit: 'Kg' },
  { code: 'BS-SYR-028', name: 'Sawi Putih', category: 'Bahan Segar', unit: 'Kg' },
  { code: 'BS-SYR-029', name: 'Timun', category: 'Bahan Segar', unit: 'Kg' },
  { code: 'BS-SYR-030', name: 'Wortel', category: 'Bahan Segar', unit: 'Kg' },
  { code: 'BS-SYR-031', name: 'Lettuce Romain', category: 'Bahan Segar', unit: 'Kg' },
  { code: 'BS-SYR-032', name: 'Pokcoy', category: 'Bahan Segar', unit: 'Kg' },
  { code: 'BS-SYR-033', name: 'Selada Bogor', category: 'Bahan Segar', unit: 'Kg' },
  { code: 'BS-SYR-034', name: 'Lobak', category: 'Bahan Segar', unit: 'Kg' },
  { code: 'BS-KNT-001', name: 'Kentang AB', category: 'Bahan Segar', unit: 'Kg' },
  { code: 'BS-SYR-035', name: 'Cabai Gendot', category: 'Bahan Segar', unit: 'Kg' },
  { code: 'BS-SYR-036', name: 'Cabai Ijo Keriting', category: 'Bahan Segar', unit: 'Kg' },
  { code: 'BS-SYR-037', name: 'Cabai Ijo Gede', category: 'Bahan Segar', unit: 'Kg' },
  { code: 'BS-SYR-038', name: 'Cabai Merah Keriting', category: 'Bahan Segar', unit: 'Kg' },
  { code: 'BS-SYR-039', name: 'Cabai Merah Biasa', category: 'Bahan Segar', unit: 'Kg' },
];

export const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: 'keluarga',
    name: 'Keluarga Maju',
    prices: [
      { itemCode: 'BP-BRS-001', price: 15200, lastUpdated: '2026-01-01' },
      { itemCode: 'BP-BRS-002', price: 16000, lastUpdated: '2026-01-01' },
      { itemCode: 'BS-TLR-001', price: 30000, lastUpdated: '2026-01-02' },
      { itemCode: 'BP-GLA-001', price: 17800, lastUpdated: '2026-01-03' },
    ]
  },
  {
    id: 'court_yard',
    name: 'Hotel Court Yard',
    prices: [
      { itemCode: 'BS-BUH-022', price: 45000, lastUpdated: '2026-01-05' },
      { itemCode: 'BS-BUH-014', price: 40000, lastUpdated: '2026-01-05' },
    ]
  },
  {
    id: 'uwak_endut',
    name: 'Grosir Uwak Endut',
    prices: [
      { itemCode: 'BP-BRS-003', price: 15000, lastUpdated: '2026-01-01' },
      { itemCode: 'BS-TLR-001', price: 31000, lastUpdated: '2026-01-02' },
      { itemCode: 'BS-SYR-007', price: 67000, lastUpdated: '2026-01-04' },
    ]
  },
  {
    id: 'selera_kita',
    name: 'CV. Selera Kita',
    prices: [
      { itemCode: 'BP-BRS-001', price: 14900, lastUpdated: '2026-01-01' },
      { itemCode: 'BP-BRS-002', price: 15600, lastUpdated: '2026-01-01' },
      { itemCode: 'BS-TLR-001', price: 29000, lastUpdated: '2026-01-02' },
      { itemCode: 'BP-GLA-001', price: 17500, lastUpdated: '2026-01-03' },
    ]
  },
  {
    id: 'victory_jaya',
    name: 'CV Victory Jaya Aeterna',
    prices: [
      { itemCode: 'BM-KMR-001', price: 33000, lastUpdated: '2026-01-04' },
      { itemCode: 'BM-KTB-001', price: 24000, lastUpdated: '2026-01-04' },
      { itemCode: 'BS-BWM-001', price: 28000, lastUpdated: '2026-01-04' },
      { itemCode: 'BS-BWP-001', price: 26000, lastUpdated: '2026-01-04' },
      { itemCode: 'BS-BDN-001', price: 10000, lastUpdated: '2026-01-04' },
      { itemCode: 'BS-BDN-002', price: 8000, lastUpdated: '2026-01-04' },
      { itemCode: 'BS-SYR-020', price: 6000, lastUpdated: '2026-01-04' },
      { itemCode: 'BS-SYR-021', price: 8000, lastUpdated: '2026-01-04' },
      { itemCode: 'BS-SYR-022', price: 7000, lastUpdated: '2026-01-04' },
      { itemCode: 'BS-SYR-023', price: 7000, lastUpdated: '2026-01-04' },
      { itemCode: 'BS-SYR-024', price: 5000, lastUpdated: '2026-01-04' },
      { itemCode: 'BS-SYR-025', price: 15000, lastUpdated: '2026-01-04' },
      { itemCode: 'BS-SYR-026', price: 24000, lastUpdated: '2026-01-04' },
      { itemCode: 'BS-SYR-027', price: 10000, lastUpdated: '2026-01-04' },
      { itemCode: 'BS-SYR-028', price: 6000, lastUpdated: '2026-01-04' },
      { itemCode: 'BS-SYR-029', price: 6000, lastUpdated: '2026-01-04' },
      { itemCode: 'BS-SYR-030', price: 14000, lastUpdated: '2026-01-04' },
      { itemCode: 'BS-SYR-032', price: 6000, lastUpdated: '2026-01-04' },
      { itemCode: 'BS-SYR-033', price: 12000, lastUpdated: '2026-01-04' },
      { itemCode: 'BS-SYR-034', price: 7000, lastUpdated: '2026-01-04' },
      { itemCode: 'BS-KNT-001', price: 13000, lastUpdated: '2026-01-04' },
      { itemCode: 'BS-SYR-007', price: 45000, lastUpdated: '2026-01-04' },
      { itemCode: 'BS-SYR-035', price: 20000, lastUpdated: '2026-01-04' },
      { itemCode: 'BS-SYR-036', price: 28000, lastUpdated: '2026-01-04' },
      { itemCode: 'BS-SYR-037', price: 20000, lastUpdated: '2026-01-04' },
      { itemCode: 'BS-SYR-038', price: 30000, lastUpdated: '2026-01-04' },
      { itemCode: 'BS-SYR-039', price: 40000, lastUpdated: '2026-01-04' },
    ]
  }
];
