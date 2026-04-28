import { useAuth } from "../context/AuthContext";

const Sidebar = ({ users, selectedUser, onSelectUser, onlineUserIds }) => {
  const { user, logout } = useAuth();

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>ChatApp</h2>
        <p>
          Logged in as <strong>{user?.username}</strong>
        </p>
      </div>

      <button className="logout-btn" onClick={logout}>
        Logout
      </button>

      <div className="user-list">
        {users.map((u) => {
          const isOnline = onlineUserIds.includes(u._id);
          const isActive = selectedUser?._id === u._id;

          return (
            <div
              key={u._id}
              className={`user-item ${isActive ? "active" : ""}`}
              onClick={() => onSelectUser(u)}
            >
              <div className="avatar">
                {u.username[0].toUpperCase()}
                <span className={`status-dot ${isOnline ? "online" : "offline"}`} />
              </div>
              <div className="user-meta">
                <div className="name">{u.username}</div>
                <div className={`status ${isOnline ? "online" : ""}`}>
                  {isOnline ? "Online" : "Offline"}
                </div>
              </div>
            </div>
          );
        })}

        {users.length === 0 && (
          <p style={{ padding: "1rem 1.25rem", color: "var(--text-muted)", fontSize: "0.85rem" }}>
            No other users yet.
          </p>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
