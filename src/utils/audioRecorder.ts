/**
 * Audio Recording and Processing Utility for VYOMIK Voice AI Advisor
 * Supports: MediaRecorder browser capture, base64 serialization, format detection
 */

export interface RecordingSession {
  stop: () => Promise<{ blob: Blob; mimeType: string }>;
  cancel: () => void;
}

export const getSupportedAudioMimeType = (): string => {
  if (typeof MediaRecorder === 'undefined') return 'audio/webm';
  if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) return 'audio/webm;codecs=opus';
  if (MediaRecorder.isTypeSupported('audio/webm')) return 'audio/webm';
  if (MediaRecorder.isTypeSupported('audio/mp4')) return 'audio/mp4';
  if (MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')) return 'audio/ogg;codecs=opus';
  if (MediaRecorder.isTypeSupported('audio/wav')) return 'audio/wav';
  return 'audio/webm';
};

export const startAudioRecording = async (
  onDataAvailable?: (chunk: Blob) => void
): Promise<RecordingSession> => {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error('MediaDevices API is not supported in this browser environment.');
  }

  const stream = await navigator.mediaDevices.getUserMedia({
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      sampleRate: 16000,
    },
  });

  const mimeType = getSupportedAudioMimeType();
  const mediaRecorder = new MediaRecorder(stream, { mimeType });
  const chunks: Blob[] = [];

  mediaRecorder.ondataavailable = (event) => {
    if (event.data && event.data.size > 0) {
      chunks.push(event.data);
      onDataAvailable?.(event.data);
    }
  };

  mediaRecorder.start(200);

  return {
    stop: () => {
      return new Promise<{ blob: Blob; mimeType: string }>((resolve, reject) => {
        mediaRecorder.onstop = () => {
          try {
            // Stop all audio tracks to release microphone hardware
            stream.getTracks().forEach((track) => track.stop());
            const audioBlob = new Blob(chunks, { type: mimeType });
            resolve({ blob: audioBlob, mimeType });
          } catch (err) {
            reject(err);
          }
        };

        if (mediaRecorder.state !== 'inactive') {
          mediaRecorder.stop();
        }
      });
    },
    cancel: () => {
      try {
        if (mediaRecorder.state !== 'inactive') {
          mediaRecorder.stop();
        }
        stream.getTracks().forEach((track) => track.stop());
      } catch (err) {
        console.warn('Error cancelling recording:', err);
      }
    },
  };
};

/**
 * Converts a Blob to a base64 string
 */
export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const base64Data = result.includes(',') ? result.split(',')[1] : result;
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

/**
 * Generates a clean synthetic PCM WAV blob for demonstration or fallback test
 */
export const createSampleVoiceWav = (durationSeconds = 1.5): Blob => {
  const sampleRate = 16000;
  const numSamples = Math.floor(sampleRate * durationSeconds);
  const buffer = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(buffer);

  // Write WAV header
  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + numSamples * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, 1, true); // Mono channel
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // byte rate
  view.setUint16(32, 2, true); // block align
  view.setUint16(34, 16, true); // bits per sample
  writeString(36, 'data');
  view.setUint32(40, numSamples * 2, true);

  // Generate modulated acoustic speech-like formant frequencies
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const f0 = 140 + 30 * Math.sin(2 * Math.PI * 2 * t);
    const formant1 = 500 * Math.sin(2 * Math.PI * f0 * t);
    const sample = Math.sin(2 * Math.PI * f0 * t) * 0.4 + (formant1 % 1) * 0.2;
    const clamped = Math.max(-1, Math.min(1, sample));
    view.setInt16(44 + i * 2, clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff, true);
  }

  return new Blob([buffer], { type: 'audio/wav' });
};
