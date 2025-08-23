'use client';

import { useRef, useState } from 'react';
import { useCamera } from '@/components/dashboard/CameraProvider';
import { useConnection } from '@/components/dashboard/ConnectionProvider';
import { usePilotMode } from './usePilotMode';

export default function PilotModeCamera(): React.ReactNode {
  const { imageUrl, isSubscribed } = useCamera();
  const { selectedConnection } = useConnection();
  const { orientation, isFullscreen } = usePilotMode();
  const imageRef = useRef<HTMLImageElement>(null);
  const [imageAspectRatio, setImageAspectRatio] = useState<number | null>(null);

  // Handle image load to get aspect ratio
  const handleImageLoad = () => {
    if (imageRef.current) {
      const { naturalWidth, naturalHeight } = imageRef.current;
      setImageAspectRatio(naturalWidth / naturalHeight);
    }
  };

  // Determine the best object-fit strategy based on orientation and aspect ratio
  const getObjectFit = () => {
    if (!imageAspectRatio) return 'cover';

    const screenAspectRatio = window.innerWidth / window.innerHeight;

    // For landscape orientation on mobile, use object-fit: contain to prevent cropping
    if (orientation === 'landscape' && window.innerHeight <= 600) {
      return 'contain';
    }

    // If image aspect ratio is very different from screen, use contain to show full image
    if (Math.abs(imageAspectRatio - screenAspectRatio) > 1) {
      return 'contain';
    }

    return 'cover';
  };

  return (
    <div className={`absolute inset-0 bg-black flex items-center justify-center ${
      isFullscreen ? 'mobile-fullscreen' : ''
    } mobile-camera-container`}>
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          alt="Pilot Mode Camera Feed"
          onLoad={handleImageLoad}
          ref={imageRef}
          src={imageUrl}
          className={`w-full h-full ${
            getObjectFit() === 'contain' ? 'object-contain' : 'object-cover'
          } transition-all duration-300`}
          onError={() => {
            // Error displaying pilot mode camera image
          }}
        />
      ) : (
        <div className="text-center text-white">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-700 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
            </svg>
          </div>
          <p className="text-lg text-gray-300 mb-2">NO CAMERA SIGNAL</p>
          <p className="text-sm text-gray-500">
            {!selectedConnection ? 'No connection' : isSubscribed ? 'Waiting for camera data...' : 'Camera not available'}
          </p>
        </div>
      )}
    </div>
  );
}