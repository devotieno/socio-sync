#!/usr/bin/env node

/**
 * Authentication Validation Script
 * 
 * This script validates your Firebase and Google OAuth configuration
 * to ensure everything is set up correctly.
 */

const https = require('https');

function checkEnvironmentVariables() {
  console.log('🔍 Checking Environment Variables...\n');
  
  const requiredVars = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'TWITTER_CLIENT_ID',
    'TWITTER_CLIENT_SECRET'
  ];

  // Load environment variables
  require('dotenv').config({ path: '.env.local' });

  let allPresent = true;
  
  requiredVars.forEach(varName => {
    const value = process.env[varName];
    const isPresent = value && value !== `your_${varName.toLowerCase().replace(/next_public_|_/g, '')}_here`;
    
    console.log(`${isPresent ? '✅' : '❌'} ${varName}: ${isPresent ? 'Set' : 'Missing or placeholder'}`);
    
    if (!isPresent) allPresent = false;
  });

  console.log('\n');
  return allPresent;
}

function validateFirebaseConfig() {
  console.log('🔥 Validating Firebase Configuration...\n');
  
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  
  if (!apiKey || apiKey.includes('your_')) {
    console.log('❌ Firebase API key is not set properly');
    return false;
  }
  
  if (!projectId || projectId.includes('your_')) {
    console.log('❌ Firebase Project ID is not set properly');
    return false;
  }
  
  // Basic format validation
  if (apiKey.length < 30) {
    console.log('❌ Firebase API key appears to be invalid (too short)');
    return false;
  }
  
  console.log('✅ Firebase configuration appears valid');
  console.log(`   Project ID: ${projectId}`);
  console.log(`   API Key: ${apiKey.substring(0, 10)}...`);
  console.log('');
  
  return true;
}

function validateGoogleOAuth() {
  console.log('🔑 Validating Google OAuth Configuration...\n');
  
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  
  if (!clientId || clientId.includes('your_')) {
    console.log('❌ Google Client ID is not set properly');
    return false;
  }
  
  if (!clientSecret || clientSecret.includes('your_')) {
    console.log('❌ Google Client Secret is not set properly');
    return false;
  }
  
  // Basic format validation for Google OAuth
  if (!clientId.endsWith('.apps.googleusercontent.com')) {
    console.log('❌ Google Client ID format appears invalid');
    return false;
  }
  
  console.log('✅ Google OAuth configuration appears valid');
  console.log(`   Client ID: ${clientId.substring(0, 20)}...`);
  console.log('');
  
  return true;
}

function validateTwitterConfig() {
  console.log('🐦 Validating Twitter Configuration...\n');
  
  const clientId = process.env.TWITTER_CLIENT_ID;
  const clientSecret = process.env.TWITTER_CLIENT_SECRET;
  
  if (!clientId || clientId.length < 10) {
    console.log('❌ Twitter Client ID is not set properly');
    return false;
  }
  
  if (!clientSecret || clientSecret.length < 20) {
    console.log('❌ Twitter Client Secret is not set properly');
    return false;
  }
  
  console.log('✅ Twitter configuration appears valid');
  console.log(`   Client ID: ${clientId.substring(0, 10)}...`);
  console.log('');
  
  return true;
}

function main() {
  console.log('🧪 SocialSync Authentication Validator');
  console.log('=====================================\n');
  
  const envValid = checkEnvironmentVariables();
  
  if (!envValid) {
    console.log('❌ Some environment variables are missing or contain placeholder values.');
    console.log('Please follow the setup guide in REAL_AUTH_SETUP.md\n');
    return;
  }
  
  const firebaseValid = validateFirebaseConfig();
  const googleValid = validateGoogleOAuth();
  const twitterValid = validateTwitterConfig();
  
  if (firebaseValid && googleValid && twitterValid) {
    console.log('🎉 All configurations appear valid!');
    console.log('\nNext steps:');
    console.log('1. Restart your development server: npm run dev');
    console.log('2. Test authentication at http://localhost:3001');
    console.log('3. Try connecting your Twitter account');
  } else {
    console.log('❌ Some configurations need attention.');
    console.log('Please review the errors above and update your .env.local file.');
  }
}

main();
