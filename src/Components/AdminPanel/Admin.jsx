// /pages/AdminLogin.jsx
const AdminLogin = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
  
    const handleLogin = () => {
      if (username === "admin123" && password === "admin123") {
        localStorage.setItem("isAdmin", true);
        navigate("/admin/dashboard");
      } else {
        alert("Invalid credentials");
      }
    };
  
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" />
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" />
        <button onClick={handleLogin}>Login</button>
      </div>
    );
  };
export default AdminLogin  