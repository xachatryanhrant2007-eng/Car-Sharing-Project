import { Pencil, Plus, X } from 'lucide-react';

export function AdminEntryButton({ role, onToggle }) {
  return <button className="admin-entry" onClick={onToggle} aria-pressed={role === 'admin'}>{role === 'admin' ? 'Admin view' : 'Admin'} <span>↗</span></button>;
}

export function AdminEditButton({ onClick }) {
  return <div className="admin-car-actions"><button onClick={onClick}><Pencil size={14} /> Edit selected car</button></div>;
}

export default function AdminPanel({ cars, onAddCar, modal, editingCarId, carForm, setCarForm, onSaveCar, onClose }) {
  return <>
    <div className="admin-bar"><div><span className="admin-indicator">ADMIN</span><b>Fleet overview</b><span>{cars.length} vehicles · {cars.filter((car) => car.battery > 20 && (car.status || 'available') === 'available').length} ready to ride</span></div><button onClick={onAddCar}><Plus size={16} /> Add vehicle</button></div>
    {(modal === 'add-car' || modal === 'edit-car') && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="dialog fleet-dialog" role="dialog" aria-modal="true" aria-label={modal === 'add-car' ? 'Add a vehicle' : 'Edit vehicle'}>
        <button className="dialog-close" aria-label="Close" onClick={onClose}><X size={18} /></button>
        <span className="dialog-kicker">FLEET MANAGEMENT · {editingCarId || 'NEW VEHICLE'}</span>
        <h2>{editingCarId ? 'Edit vehicle' : 'Add a vehicle'}</h2>
        <p>{editingCarId ? 'Update this car’s listing, pricing, availability, and map position.' : 'Add a fully configured electric car to the fleet.'}</p>
        <form className="auth-form fleet-form" onSubmit={onSaveCar}>
          <label>Vehicle model<input value={carForm.name} onChange={(event) => setCarForm({ ...carForm, name: event.target.value })} placeholder="e.g. Tesla Model X" required /></label>
          <div className="fleet-fields-grid"><label>Category<select value={carForm.category} onChange={(event) => setCarForm({ ...carForm, category: event.target.value })}><option>Economy</option><option>Comfort</option><option>Luxe</option></select></label><label>Exterior color<input value={carForm.color} onChange={(event) => setCarForm({ ...carForm, color: event.target.value })} placeholder="Pearl white" required /></label></div>
          <div className="fleet-fields-grid fleet-numbers"><label>Price per minute (֏)<input type="number" min="1" step="1" value={carForm.price} onChange={(event) => setCarForm({ ...carForm, price: event.target.value })} required /></label><label>Battery (%)<input type="number" min="0" max="100" step="1" value={carForm.battery} onChange={(event) => setCarForm({ ...carForm, battery: event.target.value })} required /></label><label>Range (km)<input type="number" min="1" step="1" value={carForm.range} onChange={(event) => setCarForm({ ...carForm, range: event.target.value })} required /></label><label>Distance from rider<input value={carForm.distance} onChange={(event) => setCarForm({ ...carForm, distance: event.target.value })} placeholder="350 m" required /></label></div>
          <div className="fleet-fields-grid fleet-numbers"><label>Latitude<input type="number" min="-90" max="90" step="0.0001" value={carForm.latitude} onChange={(event) => setCarForm({ ...carForm, latitude: event.target.value })} required /></label><label>Longitude<input type="number" min="-180" max="180" step="0.0001" value={carForm.longitude} onChange={(event) => setCarForm({ ...carForm, longitude: event.target.value })} required /></label><label className="fleet-status-field">Availability<select value={carForm.status} onChange={(event) => setCarForm({ ...carForm, status: event.target.value })}><option value="available">Available</option><option value="maintenance">Maintenance</option></select></label></div>
          <label>Photo URL<input type="url" value={carForm.image} onChange={(event) => setCarForm({ ...carForm, image: event.target.value })} placeholder="https://example.com/car.jpg" required /></label>
          <div className="fleet-image-preview"><img src={carForm.image} alt="Vehicle preview" /><span>Photo preview</span></div>
          <button className="unlock-button" type="submit">{editingCarId ? <Pencil size={16} /> : <Plus size={17} />}{editingCarId ? 'Save vehicle changes' : 'Add to fleet'}</button>
        </form>
      </section>
    </div>}
  </>;
}