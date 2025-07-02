import { useState, useEffect } from 'react';
import './UsersPage.css';

export default function UsersPage() {
  const [users, setUsers] = useState([]);

  const logoutUser = async (userId) => {
    alert(`Logging out user with ID: ${userId}`);
    const response = await fetch('http://localhost:4000/user/logout', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId })
    });

    setUsers((prevUser) => {
      return prevUser.map((user) => {
        if (user._id === userId) {
          user.isLoggedIn = false;
          return user;
        }
        return user;
      });
    });

    console.log('Logout response:', response);
    if (response.ok) {
      console.log(`User with ID: ${userId} logged out successfully`);
    } else {
      console.log(`Failed to log out user with ID: ${userId}`);
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      const response = await fetch('http://localhost:4000/admin/users', {
        method: 'GET',
        credentials: 'include',
      });
      const data = await response.json();
      setUsers(data);
    };
    fetchUsers();
  }, []);

  return (
    <div className="users-container">
      <h1 className="title">All Users</h1>
      <table className="user-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.isLoggedIn ? 'Logged In' : 'Logged Out'}</td>
              <td>
                <button
                  className="logout-button"
                  onClick={() => logoutUser(user._id)}
                  disabled={!user.isLoggedIn}
                >
                  Logout
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
