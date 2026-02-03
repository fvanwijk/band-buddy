import { Link, useNavigate, useParams } from 'react-router-dom';

import { InstrumentForm } from './InstrumentForm';
import { useGetInstrument, useUpdateInstrument } from '../../../api/useInstruments';
import { Button } from '../../../ui/Button';

export function EditInstrumentPage() {
  const backPath = '/settings/instruments';
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const instrument = useGetInstrument(id);
  const updateInstrument = useUpdateInstrument(id, () => navigate(backPath));

  if (!id || !instrument) {
    return (
      <section className="flex h-full flex-col items-center justify-center gap-4">
        <p className="text-xl text-slate-100">Instrument not found</p>
        <Button as={Link} color="primary" to={backPath}>
          Back to Settings
        </Button>
      </section>
    );
  }

  return (
    <InstrumentForm
      backPath={backPath}
      initialData={instrument}
      onSubmit={updateInstrument}
      title="Edit Instrument"
    />
  );
}
