// /pages/AdminDashboard.jsx
const AdminDashboard = () => {
    const [slots, setSlots] = useState([]);
  
    useEffect(() => {
      if (!localStorage.getItem("isAdmin")) {
        navigate("/admin/login");
      }
      // fetch all slots
      fetch("/api/slots")
        .then(res => res.json())
        .then(data => setSlots(data));
    }, []);
  
    const toggleSlotStatus = async (id, currentStatus) => {
      await fetch(`/api/slot/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ available: !currentStatus })
      });
      setSlots(prev => prev.map(slot => slot._id === id ? { ...slot, available: !currentStatus } : slot));
    };
  
    const handleOfflineBooking = async (slotId) => {
      await fetch(`/api/book/offline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slotId })
      });
      alert("Slot booked offline!");
    };
  
    return (
      <div>
        <h1>Admin Panel</h1>
        {slots.map(slot => (
          <div key={slot._id} className="border p-2 my-2">
            <p>{slot.date} | {slot.time}</p>
            <p>Status: {slot.available ? 'Available' : 'Disabled'}</p>
            <button onClick={() => toggleSlotStatus(slot._id, slot.available)}>
              {slot.available ? "Disable" : "Enable"} Slot
            </button>
            <button onClick={() => handleOfflineBooking(slot._id)}>Book Offline</button>
          </div>
        ))}
      </div>
    );
  };
export default AdminDashboard  