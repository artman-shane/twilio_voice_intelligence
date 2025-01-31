'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Config() {
  const [accountSid, setAccountSid] = useState('');
  const [authToken, setAuthToken] = useState('');
  const [serviceSid, setServiceSid] = useState('');
  const [services, setServices] = useState([]);
  const [loadingText, setLoadingText] = useState('Loading.');
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
    const fetchConfig = async () => {
      const response = await fetch('/api/config');
      const data = await response.json();
      setAccountSid(data.accountSid || '');
      setAuthToken(data.authToken ? '********' : '');
      setServiceSid(data.serviceSid || '');
    };
    fetchConfig();
  }, []);

  useEffect(() => {
    if (accountSid && authToken) {
      const fetchServices = async () => {
        const response = await fetch('/api/services');
        const data = await response.json();
        setServices(data);
        setIsLoading(false);
      };
      fetchServices();
    }
  }, [accountSid, authToken]);

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

  const handleFocus = (setter) => () => {
    setter('');
  };

  const handleSaveConfig = async () => {
    const response = await fetch('/api/config', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ accountSid, authToken }),
    });

    if (response.ok) {
      setShowModal(true);
      setTimeout(() => {
        setShowModal(false);
        router.push('/');
      }, 2000);
    } else {
      const errorText = await response.text();
      alert(`Error saving configuration: ${errorText}`);
    }
  };

  const handleServiceChange = async (serviceSid) => {
    setServiceSid(serviceSid);
    const response = await fetch('/api/config', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ serviceSid }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      alert(`Error saving service configuration: ${errorText}`);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <nav className="mb-4">
        <Link href="/" className="text-blue-500 hover:underline">Home</Link>
      </nav>
      <h1 className="text-2xl font-bold mb-4">Configuration</h1>
      <div className="mb-4">
        <label className="block mb-2">Account SID:</label>
        <input
          type="text"
          value={accountSid}
          onChange={(e) => setAccountSid(e.target.value)}
          onFocus={handleFocus(setAccountSid)}
          placeholder="AC..."
          required
          className="border p-2 w-full"
        />
      </div>
      <div className="mb-4">
        <label className="block mb-2">Auth Token:</label>
        <input
          type="password"
          value={authToken}
          onChange={(e) => setAuthToken(e.target.value)}
          onFocus={handleFocus(setAuthToken)}
          placeholder="********"
          required
          className="border p-2 w-full"
        />
      </div>
      <button onClick={handleSaveConfig} className="bg-blue-500 text-white px-4 py-2 rounded mb-4">Save</button>
      <div className="mb-4">
        <label className="block mb-2">Conversational Intelligence Service:</label>
        {isLoading ? (
          <div className="text-center text-2xl font-bold text-gray-500">
            Loading<span className="inline-block w-4">{loadingText.slice(7)}</span>
          </div>
        ) : (
          services.map((service) => (
            <div key={service.sid} className="mb-2">
              <input
                type="radio"
                id={service.sid}
                name="serviceSid"
                value={service.sid}
                checked={serviceSid === service.sid}
                onChange={(e) => handleServiceChange(e.target.value)}
                className="mr-2"
              />
              <label htmlFor={service.sid}>{service.friendlyName}</label>
            </div>
          ))
        )}
      </div>
      {isMounted && showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-4 rounded">
            <p>Configuration saved successfully!</p>
          </div>
        </div>
      )}
    </div>
  );
}