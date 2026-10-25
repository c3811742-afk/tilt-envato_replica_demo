import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from '@/app/App';
import '@/app/global.css';
import { storageKeys } from '@/shared/constants';
import { loadStudioPreviews } from '@/shared/utils';

const render = () =>
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );

// Creators' preview files come from the browser's file store: they're ready before the first page shows. If that
// fails the site still opens, and those elements show their generated cover.
loadStudioPreviews().then(render, (error: unknown) => {
  console.error(error);
  render();
});

// Previews a creator adds in another tab are loaded too (logged, not shown, if that fails).
window.addEventListener('storage', (event) => {
  if (event.key === storageKeys.studioElements) loadStudioPreviews().catch((error: unknown) => console.error(error));
});
