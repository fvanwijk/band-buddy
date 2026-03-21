import { useNavigate } from 'react-router-dom';

import { useAddInstrument } from '../../../api/useInstruments';
import { InstrumentForm } from './InstrumentForm';

export function AddInstrumentPage() {
  const backPath = '/settings/instruments';
  const navigate = useNavigate();
  const addInstrument = useAddInstrument(() => navigate(backPath));

  return <InstrumentForm backPath={backPath} onSubmit={addInstrument} title="Add Instrument" />;
}
