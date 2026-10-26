type InputTarget = { currentTarget: { value: string } };
type EnterTarget = { currentTarget: { blur: () => void }; key: string; preventDefault: () => void };

/**
 * Reads a whole number from a number input when it loses focus. Invalid or empty input is
 * reset to the fallback. The input is updated with the value that is used.
 */
export const readClampedInteger = (
  { currentTarget }: InputTarget,
  { fallback, max, min }: { fallback: number; max: number; min: number },
) => {
  const parsed = Number.parseInt(currentTarget.value, 10);
  const value = Number.isNaN(parsed) ? fallback : Math.max(min, Math.min(max, parsed));
  currentTarget.value = String(value);
  return value;
};

/** Enter applies the value, instead of submitting the whole song form */
export const applyOnEnter = (event: EnterTarget) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    event.currentTarget.blur();
  }
};
