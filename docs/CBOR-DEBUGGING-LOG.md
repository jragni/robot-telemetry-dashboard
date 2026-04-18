# CBOR Debugging Log — 2026-04-14 to 2026-04-17

## Summary

CBOR compression (T-101) broke IMU and Odometry subscriptions. Three reactive hotfixes were shipped without proper diagnosis, each fixing a symptom rather than the root cause. A proper data-first investigation revealed the actual problem was much simpler than assumed.

## Timeline

### Phase 1: Initial Symptoms (2026-04-14)

**Symptom:** `[useLidarSubscription] Malformed message` — Zod errors on `ranges` and `intensities` fields.

**Reactive fixes (without capturing real data):**

| PR   | Fix                                     | What we thought                              | Reality                                       |
| ---- | --------------------------------------- | -------------------------------------------- | --------------------------------------------- |
| #98  | `.nullable()` on all schemas            | Arrays arriving as `null`                    | Partially correct for some fields             |
| #99  | `coerceToArray()` with `z.preprocess()` | `Float32Array` not recognized by `z.array()` | Correct — CBOR decodes float[] as TypedArrays |
| #100 | NaN → null coercion                     | CBOR preserves NaN in typed arrays           | Correct — Zod rejects NaN                     |

**Process failure:** All three PRs bypassed the development process — no ticket, no discuss phase, no agents, no research. Each fix was reactive to a console screenshot.

### Phase 2: Still Broken (2026-04-17)

After PRs #98-100 merged, LiDAR started working but IMU and Odometry still showed no data.

**Initial assumption:** More CBOR schema issues — maybe IMU has different null patterns.

**What we did wrong:** Continued guessing. Tried to fix schemas without checking if messages were even arriving.

### Phase 3: Data-First Investigation

**Step 1: Added debug logging in useRosSubscriber**

```typescript
// Gated behind window.__DEBUG_ROS__ = true
console.log('[ROS DEBUG]', { topic, messageType, fields, raw: message });
```

**Finding:** Only `/scan` and `/battery_state` messages arrived. Zero `/imu` and zero `/odom` messages.

**Realization:** This is NOT a schema problem — the messages aren't arriving at all.

### Phase 4: Topic Name Mismatch

**Finding:** `selectedTopics.imu` was set to `/imu/data` (the hardcoded default), but the robot publishes on `/imu`.

**Root cause of topic mismatch:** `useTopicManager`'s auto-selection used `autoSelectedRef` — a flag set to `true` after the first discovery poll. If the first poll returned topics before IMU was discovered, auto-selection never ran again. Subsequent polls (every 10s) never corrected the stale `/imu/data` value.

**Fix:** Removed `autoSelectedRef` gate. Auto-selection now runs on every discovery poll. Removed all hardcoded fallback topic names (`?? '/imu/data'`) from PilotPage, WorkspacePage, and ActivePanelContent.

### Phase 5: CBOR vs JSON — The Real Root Cause

After fixing the topic name, IMU was subscribed to `/imu` correctly but STILL no messages arrived.

**Systematic test (changing one variable at a time):**

| Test | compression        | throttle_rate | queue_length | IMU messages?     |
| ---- | ------------------ | ------------- | ------------ | ----------------- |
| 1    | `'none'`           | none          | 1 (default)  | ✅ 185 frames/10s |
| 2    | `'cbor'` (default) | none          | 1 (default)  | ❌ 0 frames       |
| 3    | `'cbor'`           | 100           | 1            | ❌ 0 frames       |
| 4    | `'none'`           | 100           | 1            | ✅ Works          |

**Conclusion:** CBOR compression itself causes rosbridge to silently fail for IMU messages. LiDAR works with CBOR, battery works with CBOR, but IMU does not.

**Hypothesis:** The IMU message (`sensor_msgs/msg/Imu`) contains `float64[9]` covariance matrices. These fixed-size double arrays may use a CBOR tag that cbor2 can't decode, or rosbridge fails to encode them as CBOR. The CBOR decode error is caught internally by roslib's `handleCborMessage` and the message is silently dropped.

**Evidence supporting this:**

- LiDAR has `float32[]` variable-length arrays → CBOR works
- Battery has no arrays → CBOR works
- IMU has `float64[9]` fixed-size arrays (covariance) → CBOR fails
- Odometry has `float64[36]` covariance → CBOR likely fails (same pattern)

### Phase 6: Practical Fix

Use `compression: 'none'` for message types with covariance matrices (IMU, Odometry). Keep CBOR for LiDAR where the bandwidth savings (720 floats per scan) are significant.

## Lessons Learned

### 1. Capture real data before writing any fix

We shipped three PRs fixing schemas without ever confirming the data was arriving. The debug log took 5 lines and immediately showed the real problem (zero messages, not malformed messages).

### 2. Change one variable at a time

The systematic compression/throttle test matrix (4 combinations) isolated CBOR as the cause in minutes. Previous attempts changed multiple things simultaneously and couldn't isolate.

### 3. Follow the process even under pressure

The process exists to prevent exactly this: reactive whack-a-mole. PRs #98, #99, #100 each took time to write, test, and deploy — and none fixed the actual problem. A single properly scoped investigation would have been faster.

### 4. Not all CBOR messages are equal

CBOR works for some ROS message types and fails for others. The differentiator appears to be `float64[]` fixed-size covariance arrays. This is a rosbridge/cbor2 interop issue, not a schema issue.

### 5. "Malformed message" can be a red herring

The initial LiDAR malformed message WAS a real issue (TypedArray/NaN), but it led us to assume ALL sensor failures were schema problems. IMU and Odometry failures had a completely different root cause (CBOR encoding failure at the transport level).

## Files Modified During This Investigation

| File                                                                          | Purpose                                            |
| ----------------------------------------------------------------------------- | -------------------------------------------------- |
| `src/hooks/useRosSubscriber/useRosSubscriber.ts`                              | Debug logging (temporary, to be removed)           |
| `src/types/ros2-schemas.ts`                                                   | `coerceToArray` for TypedArray→Array conversion    |
| `src/hooks/useImuSubscription/useImuSubscription.ts`                          | Schema null handling, compression fix              |
| `src/hooks/useLidarSubscription/useLidarSubscription.ts`                      | `z.preprocess(coerceToArray, ...)` on array fields |
| `src/features/workspace/hooks/useTopicManager.ts`                             | Removed `autoSelectedRef` gate                     |
| `src/features/pilot/PilotPage.tsx`                                            | Removed hardcoded topic fallbacks                  |
| `src/features/workspace/WorkspacePage.tsx`                                    | Removed hardcoded topic fallbacks                  |
| `src/features/workspace/components/ActivePanelContent/ActivePanelContent.tsx` | Removed hardcoded topic fallbacks                  |

## Phase 7: Root Cause Confirmed — rosbridge Bug (PR #1161)

**Root cause:** rosbridge_library's `cbor_conversion.py` has a type dispatch table (`TAGGED_ARRAY_FORMATS`) that only handles `sequence<type>` strings (variable-length arrays). The IMU message has `float64[9]` covariance fields, which produce the type string `"double[9]"` — matching nothing in the dispatch table. The code falls through to a recursive call on a `numpy.ndarray`, which crashes with `AttributeError`. The exception is caught silently in `MultiSubscriber.callback()` and the message is dropped.

**Call stack of the failure:**

```
MultiSubscriber.callback()           → catches all exceptions silently
  → Subscribe.publish()              → no try/except
    → message.get_cbor()
      → extract_cbor_values(imu_msg)
        → slot_type = "double[9]"    → no match in TAGGED_ARRAY_FORMATS
        → extract_cbor_values(numpy.ndarray)  → AttributeError
```

**Fix:** PR #1161 (merged 2026-02-26) added `elif hasattr(val, "tolist"): out[slot] = val.tolist()` — converts numpy arrays to plain Python lists before CBOR encoding.

**Resolution:**

```bash
sudo apt update && sudo apt upgrade ros-humble-rosbridge-library  # >= 2.0.5
```

After updating rosbridge, turtlebot3 packages also needed rebuilding to restore `cmd_vel` compatibility.

**Verified:** All sensors (LiDAR, IMU, Battery, Odometry) now work with CBOR compression enabled. Commands publish correctly.

## Summary of Actual Bugs Found

| Bug                  | Root cause                                                        | Where                      | Fix                                                    |
| -------------------- | ----------------------------------------------------------------- | -------------------------- | ------------------------------------------------------ |
| LiDAR malformed      | cbor2 decodes `float32[]` as `Float32Array`, Zod rejects          | Client (cbor2 + Zod)       | `coerceToArray` with `z.preprocess`                    |
| LiDAR NaN            | CBOR preserves NaN in typed arrays, Zod rejects                   | Client (cbor2 + Zod)       | NaN → null coercion in `coerceToArray`                 |
| IMU/Odom silent drop | rosbridge can't CBOR-encode `float64[9]` covariance arrays        | Server (rosbridge_library) | Update rosbridge >= 2.0.5 (PR #1161)                   |
| IMU wrong topic      | `selectedTopics.imu` stuck on `/imu/data`, robot publishes `/imu` | Client (useTopicManager)   | Removed `autoSelectedRef`, removed hardcoded fallbacks |

Three separate bugs masquerading as one. Only proper data-first investigation separated them.

## Related Tickets

- T-101: CBOR compression (introduced the regression)
- T-110: Hardcoded topic fallbacks (exposed by this investigation)
- T-113: CBOR schema compatibility (the ticket that drove proper investigation)

## References

- [PR #1161: fix numpy.ndarray not handled in CBOR serialization](https://github.com/RobotWebTools/rosbridge_suite/pull/1161)
- [Issue #864: CBOR conversion does not work for fixed length arrays](https://github.com/RobotWebTools/rosbridge_suite/issues/864)
- [cbor_conversion.py source](https://github.com/RobotWebTools/rosbridge_suite/blob/ros2/rosbridge_library/src/rosbridge_library/internal/cbor_conversion.py)
