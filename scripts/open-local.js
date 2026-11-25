const editorPreview = ['localhost', '127.0.0.1'].includes(location.hostname) &&
  location.port === '63342';

if (location.protocol === 'file:' || editorPreview) {
  location.replace('http://127.0.0.1:4173/' + location.hash);
}
