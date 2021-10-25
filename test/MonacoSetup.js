// @ts-ignore
window.MonacoEnvironment = {
  getWorker: (moduleId, label) => {
    let url;
    const prefix = 'node_modules/monaco-editor/esm/vs/';
    const langPrefix = `${prefix}language/`;
    switch (label) {
      case 'json': url = `${langPrefix}json/json.worker.js`; break;
      case 'css': url = `${langPrefix}css/css.worker.js`; break;
      case 'html': url = `${langPrefix}html/html.worker.js`; break;
      case 'javascript':
      case 'typescript': url = `${langPrefix}typescript/ts.worker.js`; break;
      default: url = `${prefix}editor/editor.worker.js`; break;
    }
    return new Worker(url, {
      type: 'module'
    });
  }
}

export async function loadMonaco() {
  let interval;
  return new Promise((resolve) => {
    interval = setInterval(() => {
      // @ts-ignore
      if (window.monaco) {
        clearInterval(interval);
        resolve();
      }
    }, 20);
  });
}


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
