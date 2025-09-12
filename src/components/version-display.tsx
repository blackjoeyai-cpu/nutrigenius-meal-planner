'use client';

import { useEffect, useState } from 'react';

interface VersionInfo {
  version: string;
  commitHash: string;
  branch: string;
  isDirty: boolean;
  buildTime: string;
}

export default function VersionDisplay({ className }: { className?: string }) {
  const [versionInfo, setVersionInfo] = useState<VersionInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVersion = async () => {
      try {
        const response = await fetch('/api/version');
        if (!response.ok) {
          throw new Error('Failed to fetch version info');
        }
        const data: VersionInfo = await response.json();
        setVersionInfo(data);
      } catch (err) {
        setError((err as Error).message);
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
\n// Test line for commit
