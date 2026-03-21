import { useNavigate, useParams } from 'react-router-dom';

import { useGetInstrument, useUpdateInstrument } from '../../../api/useInstruments';
import { InstrumentForm } from './InstrumentForm';

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
