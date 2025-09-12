'use client';

import { useEffect, useState } from 'react';

export default function VersionDisplay({ className }) {
  const [versionInfo, setVersionInfo] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVersion = async () => {
      try {
        const response = await fetch('/api/version');
        if (!response.ok) {
          throw new Error('Failed to fetch version info');
        }
        const data = await response.json();
        setVersionInfo(data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchVersion();
  }, []);

  if (error) {
    return <div className={className}>Version info unavailable</div>;
  }

  if (!versionInfo) {
    return <div className={className}>Loading version...</div>;
  }

  return (
    <div className={className}>
      <span className="text-sm">
        v{versionInfo.version} ({versionInfo.commitHash})
        {versionInfo.isDirty && '*'}
      </span>
    </div>
  );
}