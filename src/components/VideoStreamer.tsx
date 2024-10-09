import React, { useRef, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import AWS from 'aws-sdk';

interface VideoStreamerProps {
  isStreaming: boolean;
}

const VideoStreamer: React.FC<VideoStreamerProps> = ({ isStreaming }) => {
  const webcamRef = useRef<Webcam>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Configure AWS SDK (replace with your actual credentials and region)
  AWS.config.update({
    region: 'YOUR_AWS_REGION',
    credentials: new AWS.Credentials({
      accessKeyId: 'YOUR_ACCESS_KEY_ID',
      secretAccessKey: 'YOUR_SECRET_ACCESS_KEY',
    }),
  });

  const kinesis = new AWS.Kinesis();

  const handleDataAvailable = useCallback(
    ({ data }: BlobEvent) => {
      if (data.size > 0) {
        chunksRef.current.push(data);
      }
    },
    []
  );

  const startRecording = useCallback(() => {
    mediaRecorderRef.current = new MediaRecorder(webcamRef.current!.stream as MediaStream, {
      mimeType: 'video/webm',
    });
    mediaRecorderRef.current.addEventListener('dataavailable', handleDataAvailable);
    mediaRecorderRef.current.start();
  }, [handleDataAvailable]);

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop();
  }, []);

  useEffect(() => {
    if (isStreaming) {
      startRecording();
    } else {
      stopRecording();
    }
  }, [isStreaming, startRecording, stopRecording]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (chunksRef.current.length > 0) {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const reader = new FileReader();
        reader.onload = async (e) => {
          const base64data = e.target?.result;
          if (typeof base64data === 'string') {
            const params = {
              Data: Buffer.from(base64data.split(',')[1], 'base64'),
              PartitionKey: 'partitionKey1',
              StreamName: 'YOUR_KINESIS_STREAM_NAME',
            };
            try {
              await kinesis.putRecord(params).promise();
              console.log('Video chunk sent to Kinesis');
            } catch (error) {
              console.error('Error sending video chunk to Kinesis:', error);
            }
          }
        };
        reader.readAsDataURL(blob);
        chunksRef.current = [];
      }
    }, 1000); // Send chunks every second

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative">
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        className="rounded-lg shadow-md"
      />
      {isStreaming && (
        <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs">
          Live
        </div>
      )}
    </div>
  );
};

export default VideoStreamer;