(function () {
  const currentScript = document.currentScript;
  const userId = currentScript ? currentScript.getAttribute('data-user-id') : null;
  const BACKEND_WS_URL = 'wss://header-backend.onrender.com';

  if (!userId) {
    console.error('[header] Missing required "data-user-id" attribute on script tag.');
    return;
  }

  class HeaderBar extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this.shadowRoot.innerHTML = `
        <style>
          :host {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 42px;
            background: #111111;
            color: #ffffff;
            font-family: system-ui, -apple-system, sans-serif;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 16px;
            box-sizing: border-box;
            z-index: 9999999;
            border-bottom: 2px solid #333333;
          }
          .brand { font-weight: bold; font-size: 14px; letter-spacing: 0.5px; }
          .user-badge { display: flex; align-items: center; gap: 8px; font-size: 13px; }
          .dot { width: 8px; height: 8px; border-radius: 50%; background: #666; transition: background 0.3s; }
          .dot.online { background: #00ff66; box-shadow: 0 0 8px #00ff66; }
          .dot.offline { background: #ff3333; }
        </style>
        <div class="brand">header</div>
        <div class="user-badge">
          <div id="status-dot" class="dot offline"></div>
          <span id="status-text">Connecting...</span>
        </div>
      `;
    }

    setStatus(isOnline) {
      const dot = this.shadowRoot.getElementById('status-dot');
      const text = this.shadowRoot.getElementById('status-text');
      if (isOnline) {
        dot.className = 'dot online';
        text.textContent = `Online (${userId})`;
      } else {
        dot.className = 'dot offline';
        text.textContent = 'Offline';
      }
    }
  }

  if (!customElements.get('header-nav')) {
    customElements.define('header-nav', HeaderBar);
  }

  function initWidget() {
    // Prevent duplicate injections if initialized twice
    if (document.querySelector('header-nav')) return;

    const navInstance = document.createElement('header-nav');
    document.body.prepend(navInstance);
    document.body.style.paddingTop = '42px';

    const socket = new WebSocket(`${BACKEND_WS_URL}?userId=${encodeURIComponent(userId)}`);
    socket.onopen = () => navInstance.setStatus(true);
    socket.onclose = () => navInstance.setStatus(false);
    socket.onerror = () => navInstance.setStatus(false);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWidget);
  } else {
    initWidget();
  }
})();
