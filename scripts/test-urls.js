#!/usr/bin/env node

const https = require('https');

const URLS_TO_TEST = [
  'https://raw.githubusercontent.com/V-Gutierrez/vgutierrez-cms/main/data/posts.json',
  'https://raw.githubusercontent.com/V-Gutierrez/vgutierrez-cms/main/data/projects.json',
  'https://raw.githubusercontent.com/V-Gutierrez/vgutierrez-cms/main/data/profile.json',
  'https://raw.githubusercontent.com/V-Gutierrez/vgutierrez-cms/main/data/posts/post-1.json'
];

function testUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            JSON.parse(data);
            resolve({ url, status: 'OK', size: data.length });
          } catch (error) {
            resolve({ url, status: 'INVALID_JSON', error: error.message });
          }
        } else {
          resolve({ url, status: res.statusCode, error: 'HTTP Error' });
        }
      });
    }).on('error', (error) => {
      resolve({ url, status: 'ERROR', error: error.message });
    });
  });
}

async function testAllUrls() {
  console.log('🔍 Testing GitHub URLs...');
  console.log('========================');
  console.log('');
  
  for (const url of URLS_TO_TEST) {
    const result = await testUrl(url);
    
    if (result.status === 'OK') {
      console.log(`✅ ${url}`);
      console.log(`   Size: ${result.size} bytes`);
    } else if (result.status === 404) {
      console.log(`❌ ${url}`);
      console.log(`   Status: File not found (404) - You need to push your data to GitHub first`);
    } else {
      console.log(`⚠️  ${url}`);
      console.log(`   Status: ${result.status} - ${result.error}`);
    }
    console.log('');
  }
  
  console.log('📝 Next Steps:');
  console.log('=============');
  console.log('1. If you see 404 errors, run: npm run deploy');
  console.log('2. Create the GitHub repository: https://github.com/V-Gutierrez/vgutierrez-cms');
  console.log('3. Push your data: git add . && git commit -m "Add CMS data" && git push');
  console.log('4. Wait 1-2 minutes for GitHub CDN to update');
  console.log('5. Re-run this test: npm run test-urls');
}

testAllUrls().catch(console.error);