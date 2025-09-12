// Example of how to use the VersionDisplay component in your application

import VersionDisplay from '@/components/version-display';

export default function VersionExample() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">
        Application Version Information
      </h1>

      {/* Using the VersionDisplay component */}
      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
          Current Application Version:
        </p>
        <VersionDisplay className="font-mono text-lg" />
      </div>

      <div className="mt-8 text-sm text-gray-500">
        <p>
          This component displays version information generated from git tags
          and commit history.
        </p>
        <p>The version is automatically updated on each commit and build.</p>
      </div>
    </div>
  );
}
