import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook for webcam access
 * Provides live video stream from user's camera
 */
export function useWebcam() {
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    let currentStream = null;

    async function initWebcam() {
      try {
        setIsLoading(true);
        setError(null);

        // Request camera permission
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user'
          },
          audio: false
        });

        if (!mounted) {
          // Component unmounted, stop the stream
          mediaStream.getTracks().forEach(track => track.stop());
          return;
        }

        currentStream = mediaStream;
        setStream(mediaStream);
        setHasPermission(true);
        setIsLoading(false);

        // Attach to video element if ref exists
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error('Webcam error:', err);

        if (!mounted) return;

        let errorMessage = 'Unable to access camera';

        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          errorMessage = 'Camera permission denied. Please allow camera access in your browser settings.';
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          errorMessage = 'No camera found. Please connect a camera and refresh.';
        } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
          errorMessage = 'Camera is already in use by another application.';
        }

        setError(errorMessage);
        setHasPermission(false);
        setIsLoading(false);
      }
    }

    initWebcam();

    // Cleanup function
    return () => {
      mounted = false;
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  /**
   * Capture a frame from the video stream
   * Returns base64 data URL
   */
  const captureFrame = () => {
    if (!videoRef.current || !stream) {
      return null;
    }

    const canvas = document.createElement('canvas');
    const video = videoRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    return canvas.toDataURL('image/jpeg', 0.8);
  };

  /**
   * Stop the webcam stream
   */
  const stop = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setHasPermission(false);
    }
  };

  /**
   * Restart the webcam
   */
  const restart = () => {
    stop();
    // The useEffect will automatically reinitialize
  };

  return {
    videoRef,
    stream,
    error,
    isLoading,
    hasPermission,
    captureFrame,
    stop,
    restart
  };
}
