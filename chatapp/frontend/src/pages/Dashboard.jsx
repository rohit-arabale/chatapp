import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import useSocket from "../hooks/useSocket";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [onlineUserIds, setOnlineUserIds] = useState([]);

  const socket = useSocket(user?._id);

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await API.get("/auth/users");
        setUsers(data);
      } catch (err) {
        console.error("Failed to fetch users:", err.message);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on("users:online", (ids) => {
      setOnlineUserIds(ids);
    });

    return () => socket.off("users:online");
  }, [socket]);

  return (
    <div className="dashboard">
      <Sidebar
        users={users}
        selectedUser={selectedUser}
        onSelectUser={setSelectedUser}
        onlineUserIds={onlineUserIds}
      />
      <ChatWindow
        users={users}
        selectedUser={selectedUser}
        socket={socket}
        onlineUserIds={onlineUserIds}
      />
    </div>
  );
};

export default Dashboard;
