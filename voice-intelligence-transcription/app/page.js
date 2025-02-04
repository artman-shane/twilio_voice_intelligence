'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const formatDuration = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
};

export default function Home() {
  const [message, setMessage] = useState('');
  const [fileList, setFileList] = useState([]);
  const [loadingText, setLoadingText] = useState('Loading.');
  const [isLoading, setIsLoading] = useState(true);
  const [services, setServices] = useState([]);
  const [operatorResults, setOperatorResults] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const checkCredentials = async () => {
      const response = await fetch('/api/config');
      const data = await response.json();
      if (!data.accountSid || !data.authToken) {
        router.push('/config');
      } else {
        await fetchServices();
        await fetchTranscripts();
      }
    };

    const fetchServices = async () => {
      try {
        const response = await fetch('/api/services');
        if (!response.ok) {
          throw new Error('Failed to fetch services');
        }
        const services = await response.json();
        setServices(services);
      } catch (error) {
        console.error('Error fetching services:', error);
      }
    };

    const fetchTranscripts = async () => {
      try {
        const response = await fetch('/api/transcripts');
        if (!response.ok) {
          throw new Error('Failed to fetch transcripts');
        }
        const data = await response.json();
        const transcriptsWithServiceNames = data.map(transcript => {
          const service = services.find(service => service.sid === transcript.serviceSid);
          return {
            ...transcript,
            serviceFriendlyName: service ? service.friendlyName : transcript.serviceSid,
          };
        });
        console.log('Transcripts with service names:', transcriptsWithServiceNames); // Debugging
        setFileList(transcriptsWithServiceNames);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching transcripts:', error);
      }
    };

    checkCredentials();
  }, [router]);

  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingText((prev) => {
        if (prev === 'Loading.') return 'Loading..';
        if (prev === 'Loading..') return 'Loading...';
        return 'Loading.';
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const handleFileChange = (event) => {
    const fileName = event.target.files[0]?.name || 'No file chosen';
    setMessage(`Selected file: ${fileName}`);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    setMessage('Uploading file...');

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (response.status === 200) {
      const data = await response.json();
      setMessage(`Success - transcriptSid: ${data.transcriptSid}`);
      setFileList([...fileList, { name: formData.get('file').name, transcriptSid: data.transcriptSid, dateCreated: new Date().toISOString(), duration: 'Unknown' }]);
    } else {
      const errorText = await response.text();
      setMessage(`Error: ${errorText}`);
    }
  };

  const handleDelete = async (transcriptSid, fileName) => {
    const response = await fetch('/api/delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ transcriptSid, fileName }),
    });

    if (response.ok) {
      setFileList(fileList.filter(file => file.transcriptSid !== transcriptSid));
    } else {
      const errorText = await response.text();
      alert(`Error deleting transcript: ${errorText}`);
    }
  };

  const handleOperatorResults = async (transcriptSid) => {
    try {
      const response = await fetch(`/api/operator-results/${transcriptSid}`);
      if (!response.ok) {
        throw new Error('Failed to fetch operator results');
      }
      const data = await response.json();
      setOperatorResults(data);
      console.log('Operator results:', data); // Debugging
    } catch (error) {
      console.error('Error fetching operator results:', error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <nav className="mb-4">
        <Link href="/config" className="text-blue-500 hover:underline">Configuration</Link>
      </nav>
      <h1 className="text-2xl font-bold mb-4">Upload Audio File for Transcription</h1>
      <form onSubmit={handleSubmit} encType="multipart/form-data" className="mb-4">
        <input type="file" name="file" accept=".mp3,.flac,.wav" required onChange={handleFileChange} className="mb-2" />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Upload</button>
      </form>
      <div id="message" className="mb-4">{message}</div>
      <h2 className="text-xl font-bold mb-2">Uploaded Files</h2>
      {isLoading ? (
        <div className="text-center text-2xl font-bold text-gray-500">
          Loading<span className="inline-block w-4">{loadingText.slice(7)}</span>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">File Name</th>
                <th className="py-2 px-4 border-b">SID</th>
                <th className="py-2 px-4 border-b">Service</th>
                <th className="py-2 px-4 border-b">Created</th>
                <th className="py-2 px-4 border-b">Updated</th>
                <th className="py-2 px-4 border-b">Duration (mm:ss)</th>
                <th className="py-2 px-4 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {fileList.map(file => (
                <tr key={file.sid}>
                  <td className="py-2 px-4 border-b">{file.name || 'None'}</td>
                  <td className="py-2 px-4 border-b">{file.sid}</td>
                  <td className="py-2 px-4 border-b">{file.serviceFriendlyName}</td>
                  <td className="py-2 px-4 border-b">{new Date(Date.parse(file.dateCreated)).toLocaleString()}</td>
                  <td className="py-2 px-4 border-b">{new Date(Date.parse(file.dateUpdated)).toLocaleString()}</td>
                  <td className="py-2 px-4 border-b">{formatDuration(file.duration)}</td>
                  <td className="py-2 px-4 border-b">
                    <button onClick={() => handleDelete(file.sid, file.name)} className="bg-red-500 text-white mx-2 px-2 py-1 rounded">X</button>
                    <button onClick={() => handleOperatorResults(file.sid)} className="bg-blue-500 text-white mx-2 px-2 py-1 rounded">Operator Results</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {operatorResults && (
        <div className="mt-4">
          <h2 className="text-xl font-bold mb-2">Operator Results</h2>
          <pre className="bg-gray-100 p-4 rounded">{JSON.stringify(operatorResults, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}