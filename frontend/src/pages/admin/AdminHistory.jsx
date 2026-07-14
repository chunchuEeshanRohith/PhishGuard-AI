import HistoryTable from '../../components/HistoryTable';

export default function AdminHistory() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-grotesk font-bold text-white mb-2">Scan Log & Database</h1>
      
      <div className="bg-phish-bg rounded-2xl border border-white/5 p-4">
        <HistoryTable mode="admin" />
      </div>
    </div>
  );
}
