/**
 * notifications.js – Real-time notification bell + dropdown
 */
(function () {
  let unreadCount = 0;

  function initNotifications() {
    const bell = document.getElementById('notifBell');
    const badge = document.getElementById('notifBadge');
    const panel = document.getElementById('notifPanel');
    const list  = document.getElementById('notifList');
    if (!bell) return;

    // Toggle panel
    bell.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = panel.style.display === 'block';
      panel.style.display = isOpen ? 'none' : 'block';
      if (!isOpen) {
        loadNotifications(list, badge);
        markAllRead(badge);
      }
    });

    // Close when clicking outside
    document.addEventListener('click', () => {
      if (panel) panel.style.display = 'none';
    });

    // Initial fetch
    fetchUnread(badge);

    // Poll every 30 seconds
    setInterval(() => fetchUnread(badge), 30000);
  }

  function fetchUnread(badge) {
    fetch('/api/notifications/unread_count')
      .then(r => r.json())
      .then(data => {
        unreadCount = data.count || 0;
        if (badge) {
          badge.textContent = unreadCount;
          badge.style.display = unreadCount > 0 ? 'flex' : 'none';
        }
      })
      .catch(() => {});
  }

  function loadNotifications(list, badge) {
    if (!list) return;
    list.innerHTML = '<div style="padding:1rem;color:var(--text-muted);text-align:center;font-size:0.85rem;">Loading...</div>';
    fetch('/api/notifications')
      .then(r => r.json())
      .then(data => {
        if (!data.notifications || data.notifications.length === 0) {
          list.innerHTML = '<div style="padding:1.5rem;color:var(--text-muted);text-align:center;font-size:0.85rem;">No notifications yet</div>';
          return;
        }
        list.innerHTML = data.notifications.map(n => `
          <a href="${n.link}" style="
            display:block; padding:0.85rem 1rem;
            border-bottom:1px solid var(--glass-border);
            text-decoration:none; color:var(--text-main);
            font-size:0.88rem; line-height:1.5;
            background:${n.is_read ? 'transparent' : 'rgba(0,242,254,0.04)'};
            transition:background 0.2s;
          " onmouseover="this.style.background='rgba(255,255,255,0.05)'"
             onmouseout="this.style.background='${n.is_read ? 'transparent' : 'rgba(0,242,254,0.04)'}'">
            <div style="font-weight:${n.is_read ? '400' : '600'}">${n.message}</div>
            <div style="color:var(--text-muted);font-size:0.77rem;margin-top:3px">${n.time_ago}</div>
          </a>
        `).join('');
      })
      .catch(() => {
        list.innerHTML = '<div style="padding:1rem;color:var(--text-muted);text-align:center;">Failed to load.</div>';
      });
  }

  function markAllRead(badge) {
    fetch('/api/notifications/read', { method: 'POST' })
      .then(() => {
        if (badge) badge.style.display = 'none';
        unreadCount = 0;
      })
      .catch(() => {});
  }

  document.addEventListener('DOMContentLoaded', initNotifications);
})();
