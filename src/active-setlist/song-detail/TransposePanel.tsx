import { IconMinus, IconPlus } from '@tabler/icons-react';

import { ResetButton } from './ResetButton';
import { SettingHeading } from './SettingHeading';
import { Button } from '../../ui/Button';
import { cn } from '../../utils/cn';

type TransposePanelProps = {
  onTransposeChange: (delta: number) => void;
  transpose: number;
};

const formatTranspose = (transpose: number) => (transpose > 0 ? `+${transpose}` : `${transpose}`);

export function TransposePanel({ onTransposeChange, transpose }: TransposePanelProps) {
  return (
    <>
      <SettingHeading
        resetButton={
          transpose !== 0 && (
            <ResetButton onClick={() => onTransposeChange(-transpose)} title="Reset transpose" />
          )
        }
      >
        Transpose
      </SettingHeading>
      <div className="flex items-center gap-2">
        <Button
          className="h-7 w-7 text-xs"
          icon
          onClick={() => onTransposeChange(-1)}
          title="Transpose down"
          type="button"
          variant="ghost"
        >
          <IconMinus className="h-4 w-4" />
        </Button>
        <span
          className={cn(
            'min-w-8 text-center text-xs',
            transpose !== 0 ? 'text-brand-200 font-semibold' : 'text-slate-400',
          )}
        >
          {formatTranspose(transpose)}
        </span>
        <Button
          className="h-7 w-7 text-xs"
          icon
          onClick={() => onTransposeChange(1)}
          title="Transpose up"
          type="button"
          variant="ghost"
        >
          <IconPlus className="h-4 w-4" />
        </Button>
      </div>
    </>
  );
}
