export interface SdpOffer {
  sdp: string;
  type: RTCSdpType;
  video?: boolean;
  audio?: boolean;
}

export interface SdpAnswer {
  sdp: string;
  type: RTCSdpType;
}
