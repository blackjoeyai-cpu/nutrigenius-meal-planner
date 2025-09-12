import { NextRequest } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    // Get the root directory of the project
    const rootDir = path.resolve(process.cwd());
    const versionFilePath = path.join(rootDir, 'src', 'version.json');
    
    // Read version info from file
    const versionData = await fs.readFile(versionFilePath, 'utf8');
    const versionInfo = JSON.parse(versionData);
    
    return new Response(JSON.stringify(versionInfo), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error reading version info:', error);
    
    // Return a default version info if file doesn't exist
    const defaultVersionInfo = {
      version: '0.0.0',
      commitHash: 'unknown',
      branch: 'unknown',
      isDirty: false,
      buildTime: new Date().toISOString()
    };
    
    return new Response(JSON.stringify(defaultVersionInfo), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}