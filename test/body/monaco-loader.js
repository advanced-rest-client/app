(() => {
  // @ts-ignore
  if (window.monaco) {
    return;
  }
  // @ts-ignore
  window.require = { paths: { vs: 'node_modules/monaco-editor/min/vs' } };

  function loadScript(src) {
    const script = document.createElement('script');
    script.src = src;
    script.defer = false;
    script.async = false;
    script.type = "text/javascript";
    document.getElementsByTagName('head')[0].appendChild(script);
  }

  loadScript('node_modules/monaco-editor/min/vs/loader.js');
  loadScript('node_modules/monaco-editor/min/vs/editor/editor.main.nls.js');
  loadScript('node_modules/monaco-editor/min/vs/editor/editor.main.js');
})();
