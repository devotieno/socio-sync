#!/usr/bin/env node

/**
 * OAuth Redirect URL Generator
 * Generates the correct OAuth redirect URLs for all platforms
 */

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function generateRedirectUrls(domain, useHttps = true) {
  const protocol = useHttps ? 'https' : 'http';
  const baseUrl = domain.includes('localhost') ? 'http://localhost:3000' : `${protocol}://${domain}`;
  
  return {
    facebook: `${baseUrl}/api/facebook/callback`,
    instagram: `${baseUrl}/api/instagram/callback`,
    threads: `${baseUrl}/api/threads/callback`,
    linkedin: `${baseUrl}/api/linkedin/callback`,
    tiktok: `${baseUrl}/api/tiktok/callback`,
    youtube: `${baseUrl}/api/youtube/callback`,
  };
}

function displayConfiguration(domain, urls) {
  console.log('\n🔗 OAuth Redirect URLs Configuration');
  console.log('=======================================\n');
  
  console.log('📘 FACEBOOK APP CONFIGURATION');
  console.log('Go to: https://developers.facebook.com/');
  console.log(`Facebook Login → Settings → Valid OAuth Redirect URIs:`);
  console.log(`  ${urls.facebook}\n`);
  
  console.log('📷 INSTAGRAM APP CONFIGURATION');
  console.log('Go to: https://developers.facebook.com/');
  console.log(`Instagram Basic Display → Valid OAuth Redirect URIs:`);
  console.log(`  ${urls.instagram}`);
  console.log(`Instagram Basic Display → Deauthorize Callback URL:`);
  console.log(`  ${urls.instagram.replace('/callback', '/deauth')}`);
  console.log(`Instagram Basic Display → Data Deletion Request URL:`);
  console.log(`  ${urls.instagram.replace('/callback', '/delete')}\n`);
  
  console.log('🧵 THREADS APP CONFIGURATION');
  console.log('Go to: https://developers.facebook.com/');
  console.log(`Threads API → Valid OAuth Redirect URIs:`);
  console.log(`  ${urls.threads}`);
  console.log(`Threads API → Webhook URL:`);
  console.log(`  ${urls.threads.replace('/callback', '/webhook')}\n`);
  
  console.log('🔗 LINKEDIN APP CONFIGURATION');
  console.log('Go to: https://developer.linkedin.com/');
  console.log(`Auth → Authorized Redirect URLs:`);
  console.log(`  ${urls.linkedin}\n`);
  
  console.log('🎵 TIKTOK APP CONFIGURATION');
  console.log('Go to: https://developers.tiktok.com/');
  console.log(`Redirect URI:`);
  console.log(`  ${urls.tiktok}\n`);
  
  console.log('🎥 YOUTUBE APP CONFIGURATION');
  console.log('Go to: https://console.cloud.google.com/');
  console.log(`OAuth 2.0 Client IDs → Authorized redirect URIs:`);
  console.log(`  ${urls.youtube}\n`);
  
  console.log('📋 ENVIRONMENT VARIABLES');
  console.log('Add these to your .env.local file:');
  console.log(`NEXTAUTH_URL=${domain.includes('localhost') ? 'http://localhost:3000' : 'https://' + domain}`);
  console.log('# Add your API keys from each platform\n');
  
  console.log('✅ NEXT STEPS:');
  console.log('1. Copy the URLs above to each platform\'s developer console');
  console.log('2. Get your API keys/secrets from each platform');
  console.log('3. Add them to your .env.local file');
  console.log('4. Test the OAuth flows');
  console.log('5. Submit apps for review (Facebook/LinkedIn)');
}

function main() {
  console.log('🚀 Social Media OAuth Setup Helper\n');
  
  rl.question('Enter your domain (e.g., yourdomain.com or localhost:3000): ', (domain) => {
    domain = domain.trim();
    
    if (!domain) {
      console.log('❌ Domain is required');
      rl.close();
      return;
    }
    
    const isLocalhost = domain.includes('localhost');
    const urls = generateRedirectUrls(domain, !isLocalhost);
    
    displayConfiguration(domain, urls);
    
    console.log('\n💾 Save this configuration? (y/n): ');
    rl.question('', (answer) => {
      if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
        const fs = require('fs');
        const config = {
          domain,
          generatedAt: new Date().toISOString(),
          redirectUrls: urls
        };
        
        fs.writeFileSync('oauth-config.json', JSON.stringify(config, null, 2));
        console.log('✅ Configuration saved to oauth-config.json');
      }
      
      rl.close();
    });
  });
}

if (require.main === module) {
  main();
}
