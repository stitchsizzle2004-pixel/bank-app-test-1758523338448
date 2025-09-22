import { getUncachableGitHubClient } from './github';
import * as fs from 'fs';
import * as path from 'path';

export async function deployToGitHub(repoName: string, description: string) {
  try {
    const github = await getUncachableGitHubClient();
    
    // Get authenticated user
    const { data: user } = await github.rest.users.getAuthenticated();
    console.log(`Authenticated as: ${user.login}`);

    // Create repository
    const { data: repo } = await github.rest.repos.createForAuthenticatedUser({
      name: repoName,
      description,
      private: false,
      auto_init: false
    });

    console.log(`Repository created: ${repo.html_url}`);

    // Get all files to upload
    const filesToUpload = await getProjectFiles();
    
    // Create files in the repository
    for (const file of filesToUpload) {
      const content = Buffer.from(file.content).toString('base64');
      
      await github.rest.repos.createOrUpdateFileContents({
        owner: user.login,
        repo: repoName,
        path: file.path,
        message: `Add ${file.path}`,
        content
      });
      
      console.log(`Uploaded: ${file.path}`);
    }

    return {
      success: true,
      url: repo.html_url,
      message: `Successfully created repository and uploaded ${filesToUpload.length} files`
    };

  } catch (error: any) {
    console.error('Error deploying to GitHub:', error);
    return {
      success: false,
      error: error.message || 'Unknown error occurred'
    };
  }
}

async function getProjectFiles(): Promise<Array<{path: string, content: string}>> {
  const files: Array<{path: string, content: string}> = [];
  const excludePatterns = [
    'node_modules',
    '.git',
    'dist',
    '.next',
    'coverage',
    '*.log',
    '.env',
    'tmp'
  ];

  function shouldExclude(filePath: string): boolean {
    return excludePatterns.some(pattern => {
      if (pattern.includes('*')) {
        return filePath.includes(pattern.replace('*', ''));
      }
      return filePath.includes(pattern);
    });
  }

  function readDirRecursive(dir: string, basePath: string = '') {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const relativePath = path.join(basePath, item);
      
      if (shouldExclude(relativePath)) {
        continue;
      }
      
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        readDirRecursive(fullPath, relativePath);
      } else if (stat.isFile()) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          files.push({
            path: relativePath.replace(/\\/g, '/'), // Normalize path separators
            content
          });
        } catch (error) {
          console.warn(`Could not read file ${fullPath}:`, error);
        }
      }
    }
  }

  // Start from project root
  readDirRecursive('.');
  
  return files;
}