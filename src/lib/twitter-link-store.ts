// Temporary storage for code verifiers (in production, use Redis)
export const codeVerifierStore = new Map<string, { 
  userId: string; 
  codeVerifier: string; 
  timestamp: number; 
}>();

// Clean up expired verifiers (older than 10 minutes)
export const cleanupExpiredVerifiers = () => {
  const now = Date.now();
  const maxAge = 10 * 60 * 1000; // 10 minutes
  
  for (const [state, data] of codeVerifierStore.entries()) {
    if (now - data.timestamp > maxAge) {
      codeVerifierStore.delete(state);
    }
  }
};
