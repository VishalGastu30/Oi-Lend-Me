// Re-export for backward compatibility where Node runtime is available
export * from './auth-node';
export { signJWT, verifyJWT } from './auth-edge';
