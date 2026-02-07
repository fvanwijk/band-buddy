import { useNavigate, useParams } from 'react-router-dom';

import { InstrumentForm } from './InstrumentForm';
import { useGetInstrument, useUpdateInstrument } from '../../../api/useInstruments';

export function EditInstrumentPage() {
  const backPath = '/settings/instruments';
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const instrument = useGetInstrument(id);
  const updateInstrument = useUpdateInstrument(id, () => navigate(backPath));

  if (!id || !instrument) {
    throw new Error('Instrument not found');
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
