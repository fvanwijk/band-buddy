import { useNavigate } from 'react-router-dom';

import { InstrumentForm } from './InstrumentForm';
import { useAddInstrument } from '../../../api/useInstruments';

export function AddInstrumentPage() {
  const backPath = '/settings/instruments';
  const navigate = useNavigate();
  const addInstrument = useAddInstrument(() => navigate(backPath));

  return <InstrumentForm backPath={backPath} onSubmit={addInstrument} title="Add Instrument" />;
}
