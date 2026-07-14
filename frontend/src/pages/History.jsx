import SectionHeading from '../components/SectionHeading';
import HistoryTable from '../components/HistoryTable';

export default function History() {
  return (
    <div className="section">
      <div className="container-xl">
        <SectionHeading
          badge="Scan History"
          title="Your Detection"
          highlight="History"
          subtitle="Review all your previously scanned URLs with detailed status and confidence scores."
        />

        <div className="mt-8">
          <HistoryTable mode="user" />
        </div>
      </div>
    </div>
  );
}
