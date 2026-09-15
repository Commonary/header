(function () {
  const currentScript = document.currentScript;
  const userId = currentScript ? currentScript.getAttribute('data-user-id') : null;
  const BACKEND_WS_URL = 'wss://header-backend.onrender.com';

  if (!userId) return;

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
          .brand { font-weight: bold; font-size: 14px; }
          .online-menu { position: relative; cursor: pointer; }
          .user-badge {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 13px;
            background: #222;
            padding: 6px 12px;
            border-radius: 4px;
            user-select: none;
          }
          .dot { width: 8px; height: 8px; border-radius: 50%; background: #666; }
          .dot.online { background: #00ff66; box-shadow: 0 0 8px #00ff66; }
          
          /* Dropdown Drawer */
          .dropdown {
            display: none;
            position: absolute;
            top: 45px;
            right: 0;
            background: #1a1a1a;
            border: 1px solid #333;
            border-radius: 6px;
            width: 200px;
            max-height: 250px;
            overflow-y: auto;
            box-shadow: 0 4px 12px rgba(0,0,0,0.5);
            padding: 8px 0;
          }
          .dropdown.open { display: block; }
          .dropdown-header {
            padding: 4px 12px;
            font-size: 11px;
            color: #888;
            text-transform: uppercase;
            border-bottom: 1px solid #2a2a2a;
            margin-bottom: 4px;
          }
          .user-item {
            padding: 6px 12px;
            font-size: 13px;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .user-item:hover { background: #2a2a2a; }
        </style>

        <div class="brand">header</div>
        
        <div class="online-menu" id="toggle-menu">
          <div class="user-badge">
            <div id="status-dot" class="dot"></div>
            <span id="online-count">Connecting...</span>
          </div>

          <div class="dropdown" id="user-dropdown">
            <div class="dropdown-header">Users Online</div>
            <div id="user-list"></div>
          </div>
        </div>
      `;
    }

    connectedCallback() {
      const toggleBtn = this.shadowRoot.getElementById('toggle-menu');
      const dropdown = this.shadowRoot.getElementById('user-dropdown');
      
      toggleBtn.addEventListener('click', () => {
        dropdown.classList.toggle('open');
      });
    }

    renderUsers(userList) {
      const dot = this.shadowRoot.getElementById('status-dot');
      const countLabel = this.shadowRoot.getElementById('online-count');
      const listContainer = this.shadowRoot.getElementById('user-list');

      dot.className = 'dot online';
      countLabel.textContent = `${userList.length} Online ▾`;
      
      listContainer.innerHTML = userList.map(u => `
        <div class="user-item">
          <div class="dot online"></div>
          <span>${u === userId ? `<strong>${u} (You)</strong>` : u}</span>
        </div>
      `).join('');
    }
  }

  if (!customElements.get('header-nav')) {
    customElements.define('header-nav', HeaderBar);
  }

  function initWidget() {
    if (document.querySelector('header-nav')) return;

    const navInstance = document.createElement('header-nav');
    document.body.prepend(navInstance);
    document.body.style.paddingTop = '42px';

    const socket = new WebSocket(`${BACKEND_WS_URL}?userId=${encodeURIComponent(userId)}`);

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'ONLINE_USERS_LIST') {
        navInstance.renderUsers(data.users);
      }
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWidget);
  } else {
    initWidget();
  }
})();
