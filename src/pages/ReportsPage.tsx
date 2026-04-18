import { BarChart3, FileText, Search, Bell } from 'lucide-react';

export const ReportsPage = () => {
  return (
    <div className="min-h-screen bg-[#f5f7f6]">
      {/* Top Header Bar */}
      <div className="bg-white border-b border-gray-100 px-6 lg:px-8 py-4 flex items-center justify-between sticky top-0 z-30">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Laporan</h1>
          <p className="text-sm text-gray-400 font-medium">Lihat analitik dan ekspor data pemindaian</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="relative p-2.5 bg-gray-50 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors border border-gray-100">
            <Bell size={18} />
          </button>
        </div>
      </div>

      <div className="px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm flex flex-col items-center justify-center text-center min-h-[300px] hover:shadow-md transition-shadow">
            <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mb-5 border border-green-100">
              <BarChart3 size={28} className="text-green-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Analitik Pemindaian</h3>
            <p className="text-sm text-gray-400 max-w-xs leading-relaxed">
              Visualisasikan aktivitas pemindaian tim Anda, jarak tempuh, dan cakupan aset dari waktu ke waktu.
            </p>
            <button className="mt-6 px-6 py-2.5 bg-green-600 text-white rounded-xl text-sm font-bold shadow-md shadow-green-200/50 hover:bg-green-700 transition-all active:scale-[0.98]">
              Segera Hadir
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm flex flex-col items-center justify-center text-center min-h-[300px] hover:shadow-md transition-shadow">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-5 border border-blue-100">
              <FileText size={28} className="text-blue-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Ekspor Data</h3>
            <p className="text-sm text-gray-400 max-w-xs leading-relaxed">
              Ekspor semua aset yang dipindai dan koordinat GPS sebagai CSV atau PDF untuk tinjauan offline.
            </p>
            <button className="mt-6 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-200/50 hover:bg-blue-700 transition-all active:scale-[0.98]">
              Segera Hadir
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
