import { useNavigate } from 'react-router-dom';

import { InstrumentForm } from '../components/InstrumentForm';
import { useAddInstrument } from '../hooks/useInstruments';

function AddInstrumentPage() {
  const backPath = '/settings/instruments';
  const navigate = useNavigate();
  const addInstrument = useAddInstrument(() => navigate(backPath));

  return <InstrumentForm backPath={backPath} onSubmit={addInstrument} title="Add Instrument" />;
}

export default AddInstrumentPage;
