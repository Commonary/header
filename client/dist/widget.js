(function () {
  const currentScript = document.currentScript;
  const userId = currentScript.getAttribute('data-user-id');
  const BACKEND_WS_URL = 'wss://your-widget-backend.onrender.com';

  if (!userId) return;

  class MySpaceTopBar extends HTMLElement {
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
            height: 40px;
            background: #003366;
            color: #ffffff;
            font-family: Arial, sans-serif;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 15px;
            box-sizing: border-box;
            z-index: 999999;
          }
          .status { display: flex; align-items: center; gap: 8px; }
          .dot { width: 10px; height: 10px; border-radius: 50%; background: #888; }
          .dot.online { background: #00ff00; }
          .dot.offline { background: #ff0000; }
        </style>
        <div><strong>MySpace Network</strong></div>
        <div class="status">
          <div id="status-dot" class="dot offline"></div>
          <span id="status-text">Offline</span>
        </div>
      `;
    }

    setOnlineStatus(isOnline) {
      const dot = this.shadowRoot.getElementById('status-dot');
      const text = this.shadowRoot.getElementById('status-text');
      if (isOnline) {
        dot.className = 'dot online';
        text.textContent = 'Online';
      } else {
        dot.className = 'dot offline';
        text.textContent = 'Offline';
      }
    }
  }

  customElements.define('myspace-topbar', MySpaceTopBar);

  const topBarElement = document.createElement('myspace-topbar');
  document.body.prepend(topBarElement);

  const socket = new WebSocket(`${BACKEND_WS_URL}?userId=${userId}`);

  socket.onopen = () => topBarElement.setOnlineStatus(true);
  socket.onclose = () => topBarElement.setOnlineStatus(false);
  socket.onerror = () => topBarElement.setOnlineStatus(false);
})();
