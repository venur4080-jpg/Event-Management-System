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

    // Prevent background page scrolling when reaching top or bottom of notifications
    if (panel) {
      panel.addEventListener('wheel', (e) => {
        if (!list) return;
        const delta = e.deltaY;
        const up = delta < 0;
        const down = delta > 0;
        const scrollTop = list.scrollTop;
        const maxScroll = list.scrollHeight - list.clientHeight;

        if (down && scrollTop >= maxScroll - 1) {
          e.preventDefault();
          list.scrollTop = maxScroll;
        } else if (up && scrollTop <= 0) {
          e.preventDefault();
          list.scrollTop = 0;
        }
      }, { passive: false });
    }

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
    list.innerHTML = '<div style="padding:1.5rem;color:var(--text-muted);text-align:center;font-size:0.85rem;">Loading...</div>';
    fetch('/api/notifications')
      .then(r => r.json())
      .then(data => {
        if (!data.notifications || data.notifications.length === 0) {
          list.innerHTML = '<div style="padding:2rem 1.5rem;color:var(--text-muted);text-align:center;font-size:0.9rem;">No notifications yet</div>';
          return;
        }
        list.innerHTML = data.notifications.map(n => `
          <a href="${n.link || '#'}" class="notif-item ${n.is_read ? '' : 'unread'}">
            <div class="notif-msg">${n.message}</div>
            <div class="notif-time">${n.time_ago}</div>
          </a>
        `).join('');
      })
      .catch(() => {
        list.innerHTML = '<div style="padding:1.5rem;color:var(--text-muted);text-align:center;">Failed to load.</div>';
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
