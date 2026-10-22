import { useEffect, useMemo, useRef, useState } from 'react';
import { CircleHelp, Crosshair, KeyRound, LockKeyhole, MapPin, Power, QrCode, Search, ShieldCheck, SlidersHorizontal, Sparkles, Unlock, Zap, X } from 'lucide-react';
import { MapContainer, Marker, TileLayer, ZoomControl, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Html5Qrcode } from 'html5-qrcode';
import 'leaflet/dist/leaflet.css';
import './App.css';
import AdminPanel, { AdminEditButton, AdminEntryButton } from './admin';

const BASE_CARS = [
  { id: 'VLT-101', name: 'Volkswagen ID.3', category: 'Economy', color: 'Mist grey', battery: 92, range: 348, distance: '350 m', price: 40, position: [40.1795, 44.5126], image: 'https://b3818668.assetcdn.net/2.0/3818668/wp-content/uploads/2026/08/VW-ID3-Neo-pricing-announced--750x500.jpg?lossy=2&strip=1&webp=1' },
  { id: 'VLT-204', name: 'Tesla Model 3', category: 'Comfort', color: 'Pearl white', battery: 81, range: 412, distance: '600 m', price: 50, position: [40.1855, 44.5067], image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=900&q=85' },
  { id: 'VLT-118', name: 'Hongqi E-QM5', category: 'Economy', color: 'Arctic white', battery: 97, range: 430, distance: '750 m', price: 40, position: [40.1732, 44.5191], image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTTyseH6xtia1pY5hRMEEjkek64PvhphlN7W_BFLy17Y63PhFAvTsTAIVM&s=10' },
  { id: 'VLT-310', name: 'Tesla Model Y', category: 'Comfort', color: 'Midnight silver', battery: 68, range: 318, distance: '1.1 km', price: 55, position: [40.1918, 44.5182], image: 'https://static.cargurus.com/images/forsale/2026/10/14/21/12/2023_tesla_model_y-pic-403338477592430581-1024x768.jpeg' },
  { id: 'VLT-402', name: 'Tesla Model S', category: 'Luxe', color: 'Deep blue', battery: 88, range: 506, distance: '1.3 km', price: 70, position: [40.1689, 44.5071], image: 'https://images.squarespace-cdn.com/content/v1/5b2437bcc3c16a6fea91cd4d/1640275386776-SC9Z5CND7NGPY0JE0Z5R/2021-12-15+13.48.25.jpg' },
  { id: 'VLT-221', name: 'Mustang Mach-E', category: 'Comfort', color: 'Carbonized grey', battery: 74, range: 376, distance: '1.5 km', price: 70, position: [40.1971, 44.5114], image: 'https://www.startpage.com/av/proxy-image?piurl=https%3A%2F%2Ftse3.mm.bing.net%2Fth%2Fid%2FOIP.IXhPU6yz1P41XNcBCqt_kwHaJ4%3Fr%3D0%26pid%3DApi&sp=1792135376T56d1e90bf03b6dc58cf8d37ae54074323a5263abc0e0cc08b737e7bca85449fc' },
  { id: 'VLT-509', name: 'Lixiang Li 7', category: 'Luxe', color: 'Obsidian black', battery: 91, range: 480, distance: '1.8 km', price: 75, position: [40.1642, 44.5225], image: 'https://www.gneenev.com/d/files/LIXIANG%20L7%20ce.jpg' },
  { id: 'VLT-137', name: 'Volkswagen ID.4', category: 'Economy', color: 'Stone blue', battery: 83, range: 390, distance: '2.0 km', price: 55, position: [40.1843, 44.5293], image: 'https://i.ytimg.com/vi/Lo9zuuMgpY0/sddefault.jpg' },
];

const EXTRA_CAR_MODELS = {
  Economy: ['Nissan Leaf', 'Renault Zoe', 'BYD Dolphin', 'Dacia Spring', 'Fiat 500e', 'Hyundai Kona Electric', 'Kia Niro EV', 'MG4 Electric', 'Peugeot e-208', 'Opel Corsa Electric', 'Citroen e-C3', 'Mini Cooper Electric'],
  Comfort: ['BMW i4', 'Polestar 2', 'Hyundai Ioniq 6', 'Kia EV6', 'Audi Q4 e-tron', 'Mercedes-Benz EQB', 'Volvo EX30', 'Genesis GV60', 'BYD Seal', 'NIO ET5', 'XPeng P7', 'Zeekr 001'],
  Luxe: ['Porsche Taycan', 'Mercedes-Benz EQS', 'BMW i7', 'Audi e-tron GT', 'Lucid Air', 'Rivian R1S', 'Lotus Eletre', 'Rolls-Royce Spectre'],
};

const CATEGORY_COLORS = {
  Economy: ['Pearl white', 'Silver grey', 'Ocean blue', 'Graphite'],
  Comfort: ['Midnight black', 'Glacier silver', 'Forest green', 'Arctic white'],
  Luxe: ['Obsidian black', 'Deep blue', 'Platinum silver', 'Emerald green'],
};

const CATEGORY_IMAGES = Object.fromEntries(['Economy', 'Comfort', 'Luxe'].map((category) => [category, BASE_CARS.find((car) => car.category === category).image]));
const EXTRA_CARS = Object.entries(EXTRA_CAR_MODELS).flatMap(([category, models]) => models.map((name, index) => {
  const fleetIndex = Object.values(EXTRA_CAR_MODELS).flatMap((items) => items).indexOf(name);
  return {
    id: `VLT-${510 + fleetIndex}`,
    name,
    category,
    color: CATEGORY_COLORS[category][index % CATEGORY_COLORS[category].length],
    battery: 62 + (fleetIndex * 9) % 39,
    range: 300 + (fleetIndex * 17) % 220,
    distance: `${(fleetIndex + 1) * 250} m`,
    price: category === 'Economy' ? 40 + (index % 3) * 5 : category === 'Comfort' ? 55 + (index % 3) * 5 : 75 + (index % 3) * 10,
    position: [40.164 + (fleetIndex % 8) * 0.0043, 44.504 + Math.floor(fleetIndex / 8) * 0.006 + (fleetIndex % 3) * 0.0006],
    image: CATEGORY_IMAGES[category],
  };
}));
const INITIAL_CARS = [...BASE_CARS, ...EXTRA_CARS];

const RATES = [
  { id: 'minute', label: 'Minute', unit: '/ min', multiplier: 1 },
  { id: 'hour', label: 'Hour', unit: '/ hour', multiplier: 48 },
  { id: 'day', label: 'Day', unit: '/ day', multiplier: 720 },
];

const EMPTY_CAR_FORM = {
  name: '',
  category: 'Economy',
  color: '',
  battery: '100',
  range: '390',
  distance: 'Just added',
  price: '40',
  latitude: '40.179',
  longitude: '44.525',
  image: '',
  status: 'available',
};

const categoryClass = (category) => category.toLowerCase();

function makeCarIcon(car, selected) {
  return L.divIcon({
    className: 'vehicle-marker-wrap',
    html: `<span class="vehicle-marker ${categoryClass(car.category)}${selected ? ' is-selected' : ''}"><span class="marker-bolt">↗</span></span>`,
    iconSize: [40, 48],
    iconAnchor: [20, 42],
  });
}

function RecenterMap({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.flyTo(position, 16, { duration: 0.65 });
  }, [map, position]);
  return null;
}

function QrScanner({ onScan, onError }) {
  const onScanRef = useRef(onScan);
  const onErrorRef = useRef(onError);
  onScanRef.current = onScan;
  onErrorRef.current = onError;
  useEffect(() => {
    const scanner = new Html5Qrcode('qr-reader');
    let active = true;
    scanner.start({ facingMode: 'environment' }, { fps: 10, qrbox: { width: 230, height: 230 } }, (value) => {
      if (!active) return;
      active = false;
      onScanRef.current(value);
    }, () => {}).catch(() => {
      if (active) onErrorRef.current('Camera access is unavailable. Use the demo vehicle code below.');
    });
    return () => {
      active = false;
      if (scanner.isScanning) scanner.stop().catch(() => {});
    };
  }, []);
  return <div id="qr-reader" className="qr-reader" />;
}

function App() {
  const [cars, setCars] = useState(INITIAL_CARS);
  const [category, setCategory] = useState('All');
  const [rate, setRate] = useState('minute');
  const [selectedCarId, setSelectedCarId] = useState(INITIAL_CARS[0].id);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState('');
  const [role, setRole] = useState('customer');
  const [notice, setNotice] = useState('');
  const [digitalKey, setDigitalKey] = useState(null);
  const [authMode, setAuthMode] = useState('signin');
  const [scanError, setScanError] = useState('');
  const [carForm, setCarForm] = useState(EMPTY_CAR_FORM);
  const [editingCarId, setEditingCarId] = useState(null);

  const visibleCars = useMemo(() => cars.filter((car) =>
    (role === 'admin' || (car.status || 'available') === 'available') &&
    (category === 'All' || car.category === category) &&
    `${car.name} ${car.id}`.toLowerCase().includes(search.toLowerCase())
  ), [cars, category, role, search]);
  const selectedCar = visibleCars.find((car) => car.id === selectedCarId) || visibleCars[0] || cars[0];
  const keyCar = cars.find((car) => car.id === digitalKey?.carId);
  const activeRate = RATES.find((item) => item.id === rate);

  const selectCar = (car) => {
    setSelectedCarId(car.id);
    setNotice('');
  };

  const handleScan = (value) => {
    const car = cars.find((item) => value.toUpperCase().includes(item.id));
    setModal('');
    if (!car || (car.status || 'available') !== 'available') {
      setNotice('QR scanned. This vehicle is not in the Volt fleet.');
      return;
    }
    setSelectedCarId(car.id);
    setCategory('All');
    setDigitalKey({ carId: car.id, locked: false, engineOn: false });
    setNotice(`${car.name} connected. Your phone is now its digital key.`);
  };

  const openAddCar = () => {
    setEditingCarId(null);
    setCarForm({ ...EMPTY_CAR_FORM, image: INITIAL_CARS[0].image });
    setModal('add-car');
  };

  const openEditCar = (car) => {
    setEditingCarId(car.id);
    setCarForm({
      name: car.name,
      category: car.category,
      color: car.color,
      battery: String(car.battery),
      range: String(car.range),
      distance: car.distance,
      price: String(car.price),
      latitude: String(car.position[0]),
      longitude: String(car.position[1]),
      image: car.image,
      status: car.status || 'available',
    });
    setModal('edit-car');
  };

  const handleSaveCar = (event) => {
    event.preventDefault();
    if (!carForm.name.trim() || !carForm.image.trim()) return;
    const details = {
      name: carForm.name.trim(),
      category: carForm.category,
      color: carForm.color.trim(),
      battery: Number(carForm.battery),
      range: Number(carForm.range),
      distance: carForm.distance.trim(),
      price: Number(carForm.price),
      position: [Number(carForm.latitude), Number(carForm.longitude)],
      image: carForm.image.trim(),
      status: carForm.status,
    };

    if (editingCarId) {
      setCars((current) => current.map((car) => car.id === editingCarId ? { ...car, ...details } : car));
      setSelectedCarId(editingCarId);
      if (details.status !== 'available' && digitalKey?.carId === editingCarId) setDigitalKey(null);
      setNotice(`${details.name} updated.`);
    } else {
      const nextNumber = cars.reduce((largest, car) => Math.max(largest, Number(car.id.replace('VLT-', '')) || 0), 100) + 1;
      const car = { id: `VLT-${nextNumber}`, ...details };
      setCars((current) => [...current, car]);
      setSelectedCarId(car.id);
      setNotice(`${car.name} added to the fleet.`);
    }
    setCategory('All');
    setSearch('');
    setModal('');
    setCarForm(EMPTY_CAR_FORM);
    setEditingCarId(null);
  };

  const openAuth = (mode) => {
    setAuthMode(mode);
    setModal('auth');
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#home" aria-label="Volt home">
          <span className="brand-mark"><Zap size={19} fill="currentColor" /></span>
          <span className="brand-name">volt<span>.</span></span>
          <span className="brand-city">YEREVAN</span>
        </a>
        <div className="topbar-center"><span className="status-dot" /> Fleet is live <span className="topbar-divider">·</span> {cars.length} cars nearby</div>
        <div className="topbar-actions">
          <button className="icon-button help-button" aria-label="Help" onClick={() => setModal('help')}><CircleHelp size={19} /></button>
          <button className="profile-button" onClick={() => openAuth('signin')}><span className="profile-avatar">A</span><span className="profile-copy"><b>Sign in</b><small>Account</small></span></button>
        </div>
      </header>

      <main className="workspace" id="home">
        <section className="explore-panel" aria-label="Explore available cars">
          <div className="section-heading">
            <div><span className="eyebrow">YOUR CITY, ELECTRIFIED</span><h1>Find your <em>drive.</em></h1></div>
            <span className="available-count">{visibleCars.filter((car) => (car.status || 'available') === 'available').length} available</span>
          </div>
          <div className="search-box"><Search size={17} /><input aria-label="Search cars" placeholder="Search model or car ID" value={search} onChange={(event) => setSearch(event.target.value)} /><button aria-label="Search filters" onClick={() => setCategory('All')}><SlidersHorizontal size={16} /></button></div>
          <div className="category-tabs" role="tablist" aria-label="Car category">
            {['All', 'Economy', 'Comfort', 'Luxe'].map((item) => <button key={item} role="tab" aria-selected={category === item} className={category === item ? 'active' : ''} onClick={() => setCategory(item)}>{item === 'All' ? 'All cars' : item}</button>)}
          </div>
          <div className="rate-switch" aria-label="Choose pricing interval">
            {RATES.map((item) => <button key={item.id} className={rate === item.id ? 'active' : ''} aria-pressed={rate === item.id} onClick={() => setRate(item.id)}>{item.label}</button>)}
          </div>
          <div className="car-list" aria-live="polite">
            {visibleCars.map((car) => (
              <button key={car.id} className={`car-row ${selectedCar?.id === car.id ? 'selected' : ''}`} onClick={() => selectCar(car)}>
                <span className={`car-thumb ${categoryClass(car.category)}`}><img src={car.image} alt="" loading="lazy" /><span className="thumb-bolt"><Zap size={13} fill="currentColor" /></span></span>
                <span className="car-row-info"><span className="car-title">{car.name}</span><span className="car-subtitle"><span>{car.category}</span><i />{(car.status || 'available') === 'available' ? car.distance : 'Maintenance'}</span><span className="car-energy"><Zap size={12} fill="currentColor" /> {car.battery}%</span></span>
                <span className="car-row-price"><b>{Math.round(car.price * activeRate.multiplier).toLocaleString('en-US')} <small>֏</small></b><span>{activeRate.unit}</span></span>
              </button>
            ))}
            {visibleCars.length === 0 && <div className="empty-state">No cars match that search.<button onClick={() => { setSearch(''); setCategory('All'); }}>Clear filters</button></div>}
          </div>
          <div className="panel-footer"><span><ShieldCheck size={15} /> Fully electric. Always charged.</span><button onClick={() => setModal('help')}>How it works <span>↗</span></button></div>
        </section>

        <section className="map-section" aria-label="Map of available cars in Yerevan">
          <div className="map-topline"><div className="map-location"><MapPin size={15} fill="currentColor" /><span>Yerevan, Armenia</span><span className="map-location-dot" /></div><button className="map-control" onClick={() => setCategory('All')}><Crosshair size={16} /> <span>Near me</span></button></div>
          <MapContainer center={[40.1792, 44.5136]} zoom={14} zoomControl={false} className="leaflet-map" scrollWheelZoom>
            <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <ZoomControl position="bottomright" />
            <RecenterMap position={selectedCar?.position} />
            {visibleCars.map((car) => <Marker key={car.id} position={car.position} icon={makeCarIcon(car, car.id === selectedCar?.id)} eventHandlers={{ click: () => selectCar(car) }} />)}
          </MapContainer>
          <div className="map-legend"><span><i className="legend-dot economy" /> Economy</span><span><i className="legend-dot comfort" /> Comfort</span><span><i className="legend-dot luxe" /> Luxe</span></div>
          <div className="map-credit">YEREVAN · 40.1792° N, 44.4991° E</div>
          <div className="map-car-card">
            <div className="selected-car-photo"><img src={selectedCar.image} alt={selectedCar.name} /><span className={`category-tag ${categoryClass(selectedCar.category)}`}>{selectedCar.category}</span><span className="photo-range"><Zap size={12} fill="currentColor" /> {selectedCar.range} km</span></div>
            <div className="selected-car-content">
              <div className="selected-car-heading"><div><span className="vehicle-id">{selectedCar.id} <span className="id-dot" /> {(selectedCar.status || 'available') === 'available' ? 'AVAILABLE NOW' : 'IN MAINTENANCE'}</span><h2>{selectedCar.name}</h2><span className="car-color">{selectedCar.color}</span></div><span className="price-block"><b>{Math.round(selectedCar.price * activeRate.multiplier).toLocaleString('en-US')} <small>֏</small></b><span>{activeRate.unit}</span></span></div>
              <div className="car-specs"><span><Zap size={14} /> {selectedCar.battery}% <small>battery</small></span><i /><span><MapPin size={14} /> {selectedCar.distance}</span><i /><span><KeyRound size={14} /> {digitalKey?.carId === selectedCar.id ? 'Phone key active' : 'QR scan required'}</span></div>
              {role === 'admin' && <AdminEditButton onClick={() => openEditCar(selectedCar)} />}
              {notice && <div className="notice-line" role="status">{notice}</div>}
              {(selectedCar.status || 'available') !== 'available' && digitalKey?.carId !== selectedCar.id ? (
                <div className="maintenance-notice"><ShieldCheck size={15} /> This car is unavailable while it is in maintenance.</div>
              ) : digitalKey?.carId === selectedCar.id ? (
                <div className="phone-key-panel">
                  <div className="phone-key-status"><span className="key-status-icon"><KeyRound size={16} /></span><span><b>Phone key active</b><small>Connected to this car</small></span><span className={`vehicle-state ${digitalKey.engineOn ? 'engine-on' : ''}`}><i />{digitalKey.engineOn ? 'ON' : 'OFF'}</span></div>
                  <button className={`engine-button ${digitalKey.engineOn ? 'engine-running' : ''}`} onClick={() => setDigitalKey((current) => ({ ...current, engineOn: !current.engineOn }))} disabled={digitalKey.locked && !digitalKey.engineOn}><Power size={17} /><span>{digitalKey.engineOn ? 'Turn off car' : 'Start car'}</span><small>{digitalKey.engineOn ? 'Power down before ending trip' : digitalKey.locked ? 'Unlock doors to start' : 'Ready when you are'}</small></button>
                  <div className="key-secondary-actions"><button className="lock-control" onClick={() => setDigitalKey((current) => ({ ...current, locked: !current.locked }))}>{digitalKey.locked ? <Unlock size={15} /> : <LockKeyhole size={15} />}{digitalKey.locked ? 'Unlock doors' : 'Lock doors'}<span>{digitalKey.locked ? 'LOCKED' : 'UNLOCKED'}</span></button><button className="end-trip-button" disabled={digitalKey.engineOn} title={digitalKey.engineOn ? 'Turn off the car before ending your trip' : 'End this trip'} onClick={() => { setDigitalKey(null); setNotice(`Trip ended. ${selectedCar.name} is ready for its next driver.`); }}>End trip</button></div>
                </div>
              ) : digitalKey ? (
                <div className="active-key-notice"><KeyRound size={16} /><span>Your phone key is active for <b>{keyCar?.name}</b>.</span><button onClick={() => { setSelectedCarId(keyCar.id); setCategory('All'); }}>View key</button></div>
              ) : (
                <><div className="booking-actions"><button className="unlock-button" onClick={() => { setScanError(''); setModal('qr'); }}><QrCode size={18} /> Scan QR to get your key</button><button className="secondary-button" onClick={() => openAuth('signup')}>Reserve <span>→</span></button></div><div className="fine-print">Scan the car QR before you can start or use it.</div></>
              )}
            </div>
          </div>
          <AdminEntryButton role={role} onToggle={() => setRole(role === 'admin' ? 'customer' : 'admin')} />
        </section>
      </main>

      {role === 'admin' && <AdminPanel cars={cars} onAddCar={openAddCar} modal={modal} editingCarId={editingCarId} carForm={carForm} setCarForm={setCarForm} onSaveCar={handleSaveCar} onClose={() => setModal('')} />}

      {modal && modal !== 'add-car' && modal !== 'edit-car' && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setModal(''); }}>
        <section className={`dialog ${modal === 'qr' ? 'qr-dialog' : ''}`} role="dialog" aria-modal="true" aria-label={modal === 'qr' ? 'Scan vehicle QR code' : modal === 'auth' ? 'Account access' : 'Help'}>
          <button className="dialog-close" aria-label="Close" onClick={() => setModal('')}><X size={18} /></button>
          {modal === 'qr' && <><span className="dialog-kicker">PHONE KEY SETUP</span><h2>Scan your car’s QR</h2><p>Scanning unlocks this car and securely pairs it with your phone key. Then you can control the car from here.</p><QrScanner onScan={handleScan} onError={setScanError} />{scanError && <div className="scan-error">{scanError}</div>}<button className="demo-scan" onClick={() => handleScan(selectedCar.id)}>Use demo car · {selectedCar.id}</button><span className="dialog-footnote"><LockKeyhole size={13} /> A key is created only after a valid vehicle scan</span></>}
          {modal === 'auth' && <><span className="dialog-kicker">VOLT. YEREVAN</span><h2>{authMode === 'signup' ? 'Start your journey.' : 'Good to see you.'}</h2><p>{authMode === 'signup' ? 'Create an account to ride across the city.' : 'Sign in to pick up where you left off.'}</p><form className="auth-form" onSubmit={(event) => { event.preventDefault(); setModal(''); setNotice('Welcome to Volt. Account sign-in is in demo mode.'); }}><label>Email address<input type="email" placeholder="you@example.com" required /></label><button className="unlock-button" type="submit">Continue with email <span>→</span></button></form><div className="auth-separator"><span />or continue with<span /></div><button className="social-button" onClick={() => setNotice('Google sign-in will be available when connected to an auth provider.')}>G <span>Continue with Google</span></button><button className="social-button apple" onClick={() => setNotice('Apple sign-in will be available when connected to an auth provider.')}>● <span>Continue with Apple</span></button><div className="auth-toggle">{authMode === 'signup' ? 'Already have an account?' : 'New to Volt?'} <button onClick={() => setAuthMode(authMode === 'signup' ? 'signin' : 'signup')}>{authMode === 'signup' ? 'Sign in' : 'Create account'}</button></div><button className="role-link" onClick={() => { setRole(role === 'admin' ? 'customer' : 'admin'); setModal(''); }}>{role === 'admin' ? 'Switch to customer view' : 'Administrator access'}</button></>}
          {modal === 'help' && <><span className="dialog-kicker">A BETTER WAY AROUND</span><h2>Ride in three steps.</h2><div className="help-steps"><div><span>01</span><b>Find your car</b><p>Choose an available EV on the Yerevan map.</p></div><div><span>02</span><b>Scan & unlock</b><p>Scan the QR on the car to start your ride.</p></div><div><span>03</span><b>Park & finish</b><p>End your trip in the Volt zone when you're done.</p></div></div><div className="help-callout"><Sparkles size={16} /> Every car is electric. Every ride is yours.</div></>}
        </section>
      </div>}
      <footer className="mobile-footer"><span><Zap size={14} fill="currentColor" /> VOLT YEREVAN</span><span>Built for the way you move.</span></footer>
    </div>
  );
}

export default App;
