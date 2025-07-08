import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './UsersPage.css';

const baseUrl = 'http://localhost:4000';

export default function UsersPage() {

  const [users, setUsers] = useState([]);
  const [deletedUsers, setDeletedUsers] = useState([]);
  const [userRole, setUserRole] = useState('user');
  const [userName, setUserName] = useState('');
  const navigate = useNavigate();

  const logoutUser = async (user) => {
    
    const userId = user._id;
    const email = user.email;
    const logoutConfirmation = window.confirm(`Are you sure you want to log out ${user.name} with email: ${email}?`);

    if (!logoutConfirmation) {
      return;
    }

    const response = await fetch(`${baseUrl}/admin/logout-user`, {
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

  const deleteUser = async (user) => {
    const userId = user._id;
    const email = user.email;

    const deleteType = window.prompt(
      `How do you want to delete ${user.name} (Email: ${email})?\nType "soft" for Soft Delete or "hard" for Hard Delete`
    );

    if (!deleteType || (deleteType !== "soft" && deleteType !== "hard")) {
      alert("Invalid input. Type 'soft' or 'hard' to proceed.");
      return;
    }

    const confirmation = window.confirm(
      `Are you sure you want to perform a **${deleteType.toUpperCase()} DELETE** on ${user.name}?`
    );

    if (!confirmation) {
      return;
    }

    const response = await fetch(`${baseUrl}/admin/delete-user`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, type: deleteType }) // send the type too
    });

    if (response.ok) {
      setUsers((prevUsers) => prevUsers.filter((u) => u._id !== userId));
      fetchUsers(); // Refresh the user list
      console.log(`${deleteType.toUpperCase()} delete successful for ID: ${userId}`);
    } else {
      console.log(`Failed to ${deleteType} delete user with ID: ${userId}`);
    }
};

const handleRoleChange = async (userId, newRole) => {
  
  const response = await fetch(`${baseUrl}/admin/role-change/${userId}`, {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ role: newRole }),
  });

  if (response.ok) {
    // Optionally update local state if needed
    setUsers((prev) =>
      prev.map((u) =>
        u._id === userId ? { ...u, role: newRole } : u
      ));
      console.log(`Role changed to ${newRole} for user with ID: ${userId}`);
  }

};

  const fetchUsers = async () => {
    const response = await fetch(`${baseUrl}/admin/users`, {
      method: 'GET',
      credentials: 'include',
    });

    if(response.status === 401) {
      navigate('/login'); // Redirect to login page
      return;
    }
    else if(response.status === 403) {
      alert('You are not authorized to access this resource.');
      navigate('/'); // Redirect to home or login page
      return;
    }

    const data = await response.json();
    console.log(data);
    setUsers(data.users);
    setDeletedUsers(data.deletedUsers);
    setUserRole(data.role);
    setUserName(data.name);
  };

  const restoreUser = async (userId) => {
    const confirmation = window.confirm(`Are you sure you want to restore the user with ID: ${userId}?`);
    if (!confirmation) { 
      return;
    }

    const response = await fetch(`${baseUrl}/admin/restore-user`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId })
    });

    if (response.ok) {
      setDeletedUsers((prev) => prev.filter((u) => u._id !== userId));
      fetchUsers();
      console.log(`User with ID: ${userId} restored successfully`);
    } else {
      console.log(`Failed to restore user with ID: ${userId}`);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
  <div className="users-container">
    <h1 className="title">All Users</h1>
    <p><b>{userName}:</b> (<i>{userRole}</i>)</p>
    <p>{users.length} users found</p>

    <div className="table-wrapper">
      <table className="user-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Status</th>
            <th></th>
            {userRole === 'admin' && <th>Delete</th>}
            {userRole === 'admin' && <th>Role</th>}
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
                  onClick={() => logoutUser(user)}
                  disabled={
                    !user.isLoggedIn ||
                    (userRole === 'admin' && user.role === 'admin') ||
                    (userRole === 'manager' && user.role !== 'user')
                  }
                >
                  Logout
                </button>
              </td>
              {userRole === 'admin' && (
                <>
                  <td>
                    <button
                      className="delete-button"
                      onClick={() => deleteUser(user)}
                      disabled={user.role === 'admin'}
                    >
                      Delete
                    </button>
                  </td>
                  <td>
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user._id, e.target.value)}
                      disabled={user.role === 'admin'}
                    >
                      <option value="user">User</option>
                      <option value="manager">Manager</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {userRole === 'admin' && deletedUsers.length > 0 && (
      <>
        <h2 className="title">Deleted Users</h2>
        <div className="table-wrapper">
          <table className="user-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Restore</th>
              </tr>
            </thead>
            <tbody>
              {deletedUsers.map((user) => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className="restore-icon" onClick={() => restoreUser(user._id)}>
                      🔄
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    )}
  </div>
);
}
