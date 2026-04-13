import { BarChart3, FileText } from 'lucide-react';

export const ReportsPage = () => {
  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">Laporan</h1>
        <p className="text-sm text-stone-400 mt-1">Lihat analitik dan ekspor data pemindaian</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-stone-200/60 p-8 shadow-sm flex flex-col items-center justify-center text-center min-h-[300px]">
          <BarChart3 size={48} className="text-stone-200 mb-4" />
          <h3 className="text-lg font-bold text-stone-700 mb-2">Analitik Pemindaian</h3>
          <p className="text-sm text-stone-400 max-w-xs">Visualisasikan aktivitas pemindaian tim Anda, jarak tempuh, dan cakupan aset dari waktu ke waktu.</p>
          <button className="mt-6 px-5 py-2.5 bg-teal text-white rounded-xl text-sm font-bold shadow-md shadow-teal/15 hover:bg-teal-light transition-all">
            Segera Hadir
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-stone-200/60 p-8 shadow-sm flex flex-col items-center justify-center text-center min-h-[300px]">
          <FileText size={48} className="text-stone-200 mb-4" />
          <h3 className="text-lg font-bold text-stone-700 mb-2">Ekspor Data</h3>
          <p className="text-sm text-stone-400 max-w-xs">Ekspor semua aset yang dipindai dan koordinat GPS sebagai CSV atau PDF untuk tinjauan offline.</p>
          <button className="mt-6 px-5 py-2.5 bg-teal text-white rounded-xl text-sm font-bold shadow-md shadow-teal/15 hover:bg-teal-light transition-all">
            Segera Hadir
          </button>
        </div>
      </div>
    </div>
  );
};
