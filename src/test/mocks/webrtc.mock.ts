import { vi } from 'vitest';

/**
 * Mock RTCPeerConnection for Vitest/jsdom environment.
 * Use vi.stubGlobal('RTCPeerConnection', vi.fn(function() { return createMockPeerConnection(); }))
 */
export interface MockPeerConnection {
  connectionState: RTCPeerConnectionState;
  iceGatheringState: RTCIceGatheringState;
  localDescription: RTCSessionDescriptionInit | null;
  remoteDescription: RTCSessionDescriptionInit | null;

  createOffer: ReturnType<typeof vi.fn>;
  setLocalDescription: ReturnType<typeof vi.fn>;
  setRemoteDescription: ReturnType<typeof vi.fn>;
  close: ReturnType<typeof vi.fn>;
  getSenders: ReturnType<typeof vi.fn>;
  getReceivers: ReturnType<typeof vi.fn>;
  addEventListener: ReturnType<typeof vi.fn>;
  removeEventListener: ReturnType<typeof vi.fn>;

  onconnectionstatechange: ((event: Event) => void) | null;
  onicecandidate: ((event: RTCPeerConnectionIceEvent) => void) | null;
  ontrack: ((event: RTCTrackEvent) => void) | null;
  onsignalingstatechange: ((event: Event) => void) | null;
  oniceconnectionstatechange: ((event: Event) => void) | null;
  onicegatheringstatechange: ((event: Event) => void) | null;

  _triggerConnectionStateChange: (state: RTCPeerConnectionState) => void;
  _triggerIceCandidate: (candidate: RTCIceCandidate | null) => void;
  _triggerTrack: (stream: MockMediaStream) => void;
  _triggerIceGatheringComplete: () => void;
}

export function createMockPeerConnection(): MockPeerConnection {
  const mock: MockPeerConnection = {
    connectionState: 'new',
    iceGatheringState: 'new',
    localDescription: null,
    remoteDescription: null,

    onconnectionstatechange: null,
    onicecandidate: null,
    ontrack: null,
    onsignalingstatechange: null,
    oniceconnectionstatechange: null,
    onicegatheringstatechange: null,

    createOffer: vi.fn().mockResolvedValue({
      type: 'offer' as RTCSdpType,
      sdp: 'v=0\r\no=- 0 0 IN IP4 127.0.0.1\r\n',
    }),
    setLocalDescription: vi
      .fn()
      .mockImplementation((desc: RTCSessionDescriptionInit) => {
        mock.localDescription = desc;
        // Simulate instant ICE gathering completion
        mock.iceGatheringState = 'complete';
        queueMicrotask(() => {
          mock.onicegatheringstatechange?.(
            new Event('icegatheringstatechange')
          );
        });
      }),
    setRemoteDescription: vi
      .fn()
      .mockImplementation((desc: RTCSessionDescriptionInit) => {
        mock.remoteDescription = desc;
      }),
    close: vi.fn().mockImplementation(() => {
      mock.connectionState = 'closed';
    }),
    getSenders: vi.fn().mockReturnValue([]),
    getReceivers: vi.fn().mockReturnValue([]),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),

    _triggerConnectionStateChange(state) {
      mock.connectionState = state;
      mock.onconnectionstatechange?.(new Event('connectionstatechange'));
    },
    _triggerIceCandidate(candidate) {
      mock.onicecandidate?.({ candidate } as RTCPeerConnectionIceEvent);
    },
    _triggerTrack(stream) {
      mock.ontrack?.({
        streams: [stream],
        track: stream._tracks[0] ?? createMockMediaStreamTrack(),
      } as unknown as RTCTrackEvent);
    },
    _triggerIceGatheringComplete() {
      mock.iceGatheringState = 'complete';
      mock.onicegatheringstatechange?.(new Event('icegatheringstatechange'));
    },
  };

  return mock;
}

/**
 * Mock MediaStream
 */
export interface MockMediaStream {
  id: string;
  active: boolean;
  getTracks: ReturnType<typeof vi.fn>;
  getVideoTracks: ReturnType<typeof vi.fn>;
  getAudioTracks: ReturnType<typeof vi.fn>;
  _tracks: MockMediaStreamTrack[];
}

export function createMockMediaStream(id = 'stream-1'): MockMediaStream {
  const track = createMockMediaStreamTrack('video', `${id}-track`);
  const tracks = [track];
  return {
    id,
    active: true,
    getTracks: vi.fn(() => tracks),
    getVideoTracks: vi.fn(() => tracks.filter((t) => t.kind === 'video')),
    getAudioTracks: vi.fn(() => tracks.filter((t) => t.kind === 'audio')),
    _tracks: tracks,
  };
}

/**
 * Mock MediaStreamTrack
 */
export interface MockMediaStreamTrack {
  id: string;
  kind: 'video' | 'audio';
  enabled: boolean;
  muted: boolean;
  readyState: 'live' | 'ended';
  stop: ReturnType<typeof vi.fn>;
  onmute: ((event: Event) => void) | null;
  onunmute: ((event: Event) => void) | null;
  onended: ((event: Event) => void) | null;
  _triggerMute: () => void;
  _triggerUnmute: () => void;
  _triggerEnded: () => void;
}

export function createMockMediaStreamTrack(
  kind: 'video' | 'audio' = 'video',
  id = 'track-1'
): MockMediaStreamTrack {
  const track: MockMediaStreamTrack = {
    id,
    kind,
    enabled: true,
    muted: false,
    readyState: 'live',
    stop: vi.fn(),
    onmute: null,
    onunmute: null,
    onended: null,
    _triggerMute() {
      track.muted = true;
      track.onmute?.(new Event('mute'));
    },
    _triggerUnmute() {
      track.muted = false;
      track.onunmute?.(new Event('unmute'));
    },
    _triggerEnded() {
      track.readyState = 'ended';
      track.onended?.(new Event('ended'));
    },
  };
  return track;
}
