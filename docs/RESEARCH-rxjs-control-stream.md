# Research: RxJS Control Stream Pattern

## Context

During Phase 11 (workspace data layer), we explored using `observable-hooks` + RxJS for the D-pad press-and-hold command publishing. The implementation worked but was overengineered for the use case.

## What Was Built

A `useControlStream` hook using:

- `Subject<Direction>` for press start/stop signals
- `switchMap` → `interval(100ms)` → `takeUntil(stopSubject)` → `map(buildTwist)`
- `finalize()` to send zero-velocity on release
- `useObservable` and `useSubscription` from `observable-hooks`
- `useRef` for stale closure mitigation (`onPublishRef`, `linearRef`, `angularRef`)

## Why It Was Reverted

The D-pad is a **producer** (we create commands), not a **consumer** (we react to incoming data). `setInterval`/`clearInterval` solves the same problem in ~20 lines without Subjects, switchMap, finalize, or stale closure refs.

## When to Use This Pattern

RxJS + observable-hooks makes sense for **incoming sensor streams**:

- IMU at 20Hz → `useSubscription(imu$, handler)` — hot observable, concurrent-mode-safe
- LiDAR scans → `useSubscription(lidar$, handler)` — same
- Odometry → `useObservableState(odom$, initial)` — direct to component state
- Multiple robot connections → per-robot observables, auto-cleanup on disconnect

The `useObservableCallback` + `switchMap` + `interval` pattern would be appropriate if:

- The publish rate needs to adapt dynamically based on network conditions
- Multiple command sources (D-pad + joystick + voice) need to be merged/prioritized
- Commands need backpressure handling (e.g., wait for ACK before next)

## POC Code (preserved for future use)

```ts
// useControlStream with RxJS — full implementation
import { Subject, interval, EMPTY } from 'rxjs';
import { switchMap, takeUntil, map, finalize } from 'rxjs/operators';
import { useObservable, useSubscription } from 'observable-hooks';

const startSubject = useRef(new Subject<Direction>()).current;
const stopSubject = useRef(new Subject<void>()).current;

const twist$ = useObservable(() =>
  startSubject.pipe(
    switchMap((direction) =>
      direction === 'stop'
        ? EMPTY
        : interval(publishIntervalRef.current).pipe(
            takeUntil(stopSubject),
            map(() => buildTwist(direction, linearRef.current, angularRef.current)),
            finalize(() => {
              onPublishRef.current?.(ZERO_TWIST);
            }),
          ),
    ),
  ),
);

useSubscription(twist$, (twist) => {
  onPublishRef.current?.(twist);
});
```

## Dependencies

- `observable-hooks@^4.2.4` — already installed, used for sensor streams
- `rxjs@^7.8.2` — already installed
