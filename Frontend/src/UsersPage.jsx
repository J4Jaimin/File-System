import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './UsersPage.css';

export default function UsersPage() {

  const [users, setUsers] = useState([]);
  const [userRole, setUserRole] = useState('');
  const navigate = useNavigate();

  const logoutUser = async (userId) => {
    alert(`Logging out user with ID: ${userId}`);
    const response = await fetch('http://localhost:4000/admin/logout-user', {
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

  const deleteUser = async (userId) => {
    alert(`Deleting user with ID: ${userId}`);
    const response = await fetch('http://localhost:4000/admin/delete-user', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId })
    });

    if (response.ok) {
      setUsers((prevUsers) => prevUsers.filter((user) => user._id !== userId));
      console.log(`User with ID: ${userId} deleted successfully`);
    } else {
      console.log(`Failed to delete user with ID: ${userId}`);
    }
  }

  const fetchUsers = async () => {
    const response = await fetch('http://localhost:4000/admin/users', {
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
    setUserRole(data.role);
  };

  useEffect(() => {
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
            {userRole === 'admin' && <th></th>}
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
                  disabled={!user.isLoggedIn || (userRole === 'admin' && user.role === 'admin') || (userRole === 'manager' && user.role !== 'user')}
                >
                  Logout
                </button>
              </td>
              {userRole === 'admin' && <td>
                <button
                  className="delete-button"
                  onClick={() => deleteUser(user._id)}
                  disabled={!user.isLoggedIn || (userRole === 'admin' && user.role === 'admin') || (userRole === 'manager' && user.role !== 'user')}
                >
                  Delete
                </button>
              </td>
              }
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
