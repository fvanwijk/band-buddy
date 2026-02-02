import { useMemo } from 'react';

type NordProgramOption = {
  label: string;
  options: Array<{ label: string; value: string }>;
};

export function useNordProgramOptions(): NordProgramOption[] {
  return useMemo(() => {
    const banks = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    const groupedOptions: NordProgramOption[] = [];

    banks.forEach((bank, bankIndex) => {
      const bankStart = bankIndex * 64;
      const bankOptions: Array<{ label: string; value: string }> = [];

      for (let program = 0; program < 64; program++) {
        const page = Math.floor(program / 8);
        const positionInPage = (program % 8) + 1;
        const displayValue = page * 10 + positionInPage;
        const absoluteProgram = bankStart + program;
        bankOptions.push({
          label: `${bank}-${displayValue} (${absoluteProgram})`,
          value: absoluteProgram.toString(),
        });
      }

      groupedOptions.push({
        label: `Bank ${bank}`,
        options: bankOptions,
      });
    });

    return groupedOptions;
  }, []);
}
