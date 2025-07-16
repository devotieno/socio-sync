#!/usr/bin/env node

/**
 * Firebase Configuration Helper
 * 
 * This script helps you update your .env.local file with real Firebase credentials.
 * Run this after you've created your Firebase project and obtained the config object.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const envPath = path.join(process.cwd(), '.env.local');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔥 Firebase Configuration Helper');
console.log('================================');
console.log('');
console.log('Please have your Firebase config object ready from:');
console.log('Firebase Console > Project Settings > General > Your apps > Web app');
console.log('');

async function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

async function updateEnvFile() {
  try {
    console.log('Enter your Firebase configuration values:');
    console.log('');

    const firebaseApiKey = await askQuestion('Firebase API Key: ');
    const projectId = await askQuestion('Project ID: ');
    const messagingSenderId = await askQuestion('Messaging Sender ID: ');
    const appId = await askQuestion('App ID: ');

    console.log('');
    console.log('Enter your Google OAuth credentials:');
    console.log('(From Google Cloud Console > APIs & Services > Credentials)');
    console.log('');

    const googleClientId = await askQuestion('Google Client ID: ');
    const googleClientSecret = await askQuestion('Google Client Secret: ');

    // Read current .env.local file
    let envContent = fs.readFileSync(envPath, 'utf8');

    // Update Firebase values
    envContent = envContent.replace(
      /NEXT_PUBLIC_FIREBASE_API_KEY=.*/,
      `NEXT_PUBLIC_FIREBASE_API_KEY=${firebaseApiKey}`
    );
    envContent = envContent.replace(
      /NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=.*/,
      `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=${projectId}.firebaseapp.com`
    );
    envContent = envContent.replace(
      /NEXT_PUBLIC_FIREBASE_PROJECT_ID=.*/,
      `NEXT_PUBLIC_FIREBASE_PROJECT_ID=${projectId}`
    );
    envContent = envContent.replace(
      /NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=.*/,
      `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=${projectId}.appspot.com`
    );
    envContent = envContent.replace(
      /NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=.*/,
      `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=${messagingSenderId}`
    );
    envContent = envContent.replace(
      /NEXT_PUBLIC_FIREBASE_APP_ID=.*/,
      `NEXT_PUBLIC_FIREBASE_APP_ID=${appId}`
    );

    // Update Google OAuth values
    envContent = envContent.replace(
      /GOOGLE_CLIENT_ID=.*/,
      `GOOGLE_CLIENT_ID=${googleClientId}`
    );
    envContent = envContent.replace(
      /GOOGLE_CLIENT_SECRET=.*/,
      `GOOGLE_CLIENT_SECRET=${googleClientSecret}`
    );

    // Write updated content back to file
    fs.writeFileSync(envPath, envContent);

    console.log('');
    console.log('✅ Environment variables updated successfully!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Restart your development server: npm run dev');
    console.log('2. Visit http://localhost:3001');
    console.log('3. Try signing up with email/password');
    console.log('4. Try signing in with Google OAuth');
    console.log('5. Connect your Twitter account');
    console.log('');

  } catch (error) {
    console.error('Error updating environment file:', error);
  } finally {
    rl.close();
  }
}

updateEnvFile();
