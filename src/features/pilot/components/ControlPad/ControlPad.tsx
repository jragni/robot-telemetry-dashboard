import { useStore } from 'zustand';

import type { Direction } from '../../types/robot-control.types';

import type { ControlPadProps } from './ControlPad.types';

interface DirectionButtonProps {
  label: string;
  direction: Direction;
  isActive: boolean;
  isDisabled: boolean;
  onPress: (d: Direction) => void;
  onRelease: () => void;
}

function DirectionButton({
  label,
  direction,
  isActive,
  isDisabled,
  onPress,
  onRelease,
}: DirectionButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={isDisabled}
      data-active={isActive ? 'true' : 'false'}
      onMouseDown={() => !isDisabled && onPress(direction)}
      onMouseUp={() => !isDisabled && onRelease()}
      onMouseLeave={() => !isDisabled && onRelease()}
      onTouchStart={(e) => {
        e.preventDefault();
        if (!isDisabled) onPress(direction);
      }}
      onTouchEnd={(e) => {
        e.preventDefault();
        if (!isDisabled) onRelease();
      }}
      className={[
        'flex h-12 w-12 items-center justify-center rounded font-bold text-sm transition-colors',
        isDisabled
          ? 'cursor-not-allowed bg-slate-800 text-slate-600'
          : isActive
            ? 'border-2 border-[var(--color-telemetry,#3b82f6)] bg-[var(--color-telemetry,#3b82f6)]/20 text-white'
            : 'bg-slate-700 text-slate-200 hover:bg-slate-600',
      ].join(' ')}
    >
      {label === 'Forward' && '↑'}
      {label === 'Backward' && '↓'}
      {label === 'Left' && '←'}
      {label === 'Right' && '→'}
      {label === 'Stop' && '■'}
    </button>
  );
}

export function ControlPad({
  controlStore,
  disabled = false,
}: ControlPadProps) {
  const eStopActive = useStore(controlStore, (s) => s.eStopActive);
  const activeDirection = useStore(controlStore, (s) => s.activeDirection);

  const isDisabled = eStopActive || disabled;

  function handlePress(direction: Direction) {
    controlStore.getState().setDirection(direction);
  }

  function handleRelease() {
    controlStore.getState().setDirection(null);
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <DirectionButton
        label="Forward"
        direction="forward"
        isActive={activeDirection === 'forward'}
        isDisabled={isDisabled}
        onPress={handlePress}
        onRelease={handleRelease}
      />
      <div className="flex gap-1">
        <DirectionButton
          label="Left"
          direction="left"
          isActive={activeDirection === 'left'}
          isDisabled={isDisabled}
          onPress={handlePress}
          onRelease={handleRelease}
        />
        <DirectionButton
          label="Stop"
          direction="stop"
          isActive={activeDirection === 'stop'}
          isDisabled={isDisabled}
          onPress={handlePress}
          onRelease={handleRelease}
        />
        <DirectionButton
          label="Right"
          direction="right"
          isActive={activeDirection === 'right'}
          isDisabled={isDisabled}
          onPress={handlePress}
          onRelease={handleRelease}
        />
      </div>
      <DirectionButton
        label="Backward"
        direction="backward"
        isActive={activeDirection === 'backward'}
        isDisabled={isDisabled}
        onPress={handlePress}
        onRelease={handleRelease}
      />
    </div>
  );
}
