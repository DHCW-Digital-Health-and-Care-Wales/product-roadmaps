/// <reference types="vite/client" />

// Provided by the roadmaps-data plugin in vite.config.ts.
declare module 'virtual:roadmaps' {
  const roadmaps: import('./lib/types').Roadmap[];
  export default roadmaps;
}
