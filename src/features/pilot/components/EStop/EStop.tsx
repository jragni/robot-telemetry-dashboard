import { useStore } from 'zustand';

import type { EStopProps } from './EStop.types';

import { Show } from '@/shared/components/Show';

export function EStop({ controlStore, onActivate }: EStopProps) {
  const eStopActive = useStore(controlStore, (s) => s.eStopActive);

  function handleClick() {
    if (eStopActive) {
      controlStore.getState().releaseEStop();
    } else {
      controlStore.getState().activateEStop();
      onActivate?.();
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <Show when={eStopActive}>
        <div
          role="alert"
          className="rounded bg-red-600 px-3 py-1 text-xs font-bold text-white"
        >
          E-STOP ACTIVE
        </div>
      </Show>
      <button
        type="button"
        aria-label="E-Stop"
        onClick={handleClick}
        className={[
          'flex min-h-[64px] min-w-[64px] items-center justify-center rounded-full font-bold text-sm',
          eStopActive
            ? 'animate-pulse bg-red-600 text-white'
            : 'border-2 border-red-600 bg-transparent text-red-600 hover:bg-red-600/10',
        ].join(' ')}
      >
        E-STOP
      </button>
    </div>
  );
}
