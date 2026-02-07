type DrawingCursorProps = {
  color: string;
  mode: 'eraser' | 'pen';
  position: { x: number; y: number };
  radius: number;
};

export function DrawingCursor({ color, mode, position, radius }: DrawingCursorProps) {
  return (
    <div
      className="pointer-events-none absolute rounded-full border-2"
      style={{
        borderColor: mode === 'eraser' ? '#94a3b8' : color,
        height: `${radius * 2}px`,
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(-50%, -50%)',
        width: `${radius * 2}px`,
      }}
    />
  );
}
