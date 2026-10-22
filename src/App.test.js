import { fireEvent, render, screen } from '@testing-library/react';
import App from './App';

jest.mock('react-leaflet', () => {
  const React = require('react');
  return {
    MapContainer: ({ children }) => React.createElement('div', { className: 'mock-map' }, children),
    Marker: () => null,
    TileLayer: () => null,
    ZoomControl: () => null,
    useMap: () => ({ flyTo: jest.fn() }),
  };
});

jest.mock('leaflet', () => ({ divIcon: jest.fn(() => ({})) }));
jest.mock('html5-qrcode', () => ({
  Html5Qrcode: class {
    constructor() {
      this.start = jest.fn().mockResolvedValue(undefined);
      this.isScanning = false;
      this.stop = jest.fn();
    }
  },
}));

test('requires a QR scan to activate the phone key and car controls', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: /find your drive/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /scan qr to get your key/i })).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /start car/i })).not.toBeInTheDocument();
  expect(screen.getByLabelText(/map of available cars in yerevan/i)).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: /scan qr to get your key/i }));
  expect(screen.getByRole('heading', { name: /scan your car’s qr/i })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /use demo car/i }));

  expect(screen.getByText(/your phone is now its digital key/i)).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /start car/i }));
  expect(screen.getByRole('button', { name: /turn off car/i })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /turn off car/i }));
  fireEvent.click(screen.getByRole('button', { name: /lock doors/i }));
  expect(screen.getByRole('button', { name: /^unlock doors locked$/i })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /end trip/i }));
  expect(screen.getByRole('button', { name: /scan qr to get your key/i })).toBeInTheDocument();
});

test('starts with 40 cars split across the requested categories', () => {
  render(<App />);

  expect(screen.getByText(/Fleet is live/).textContent).toContain('40 cars nearby');
  fireEvent.click(screen.getByRole('tab', { name: 'Economy' }));
  expect(screen.getByText('15 available')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('tab', { name: 'Comfort' }));
  expect(screen.getByText('15 available')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('tab', { name: 'Luxe' }));
  expect(screen.getByText('10 available')).toBeInTheDocument();
});

test('lets admins edit an existing car and add a configured vehicle', () => {
  render(<App />);
  fireEvent.click(screen.getByRole('button', { name: /^admin/i }));
  fireEvent.click(screen.getByRole('button', { name: /edit selected car/i }));

  fireEvent.change(screen.getByLabelText('Vehicle model'), { target: { value: 'Volkswagen ID.3 Sport' } });
  fireEvent.change(screen.getByLabelText('Exterior color'), { target: { value: 'Forest green' } });
  fireEvent.change(screen.getByLabelText('Price per minute (֏)'), { target: { value: '47' } });
  fireEvent.change(screen.getByLabelText('Battery (%)'), { target: { value: '75' } });
  fireEvent.change(screen.getByLabelText('Range (km)'), { target: { value: '400' } });
  fireEvent.change(screen.getByLabelText('Distance from rider'), { target: { value: '500 m' } });
  fireEvent.change(screen.getByLabelText('Latitude'), { target: { value: '40.1801' } });
  fireEvent.change(screen.getByLabelText('Longitude'), { target: { value: '44.5101' } });
  fireEvent.change(screen.getByLabelText('Photo URL'), { target: { value: 'https://example.com/id3-sport.jpg' } });
  fireEvent.change(screen.getAllByRole('combobox')[0], { target: { value: 'Comfort' } });
  fireEvent.change(screen.getByLabelText('Availability'), { target: { value: 'maintenance' } });
  fireEvent.click(screen.getByRole('button', { name: /save vehicle changes/i }));

  expect(screen.getByRole('heading', { name: 'Volkswagen ID.3 Sport' })).toBeInTheDocument();
  expect(screen.getByText(/this car is unavailable while it is in maintenance/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /edit selected car/i })).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: /add vehicle/i }));
  fireEvent.change(screen.getByLabelText('Vehicle model'), { target: { value: 'Tesla Model X' } });
  fireEvent.change(screen.getByLabelText('Exterior color'), { target: { value: 'Pearl white' } });
  fireEvent.click(screen.getByRole('button', { name: /add to fleet/i }));

  expect(screen.getByRole('heading', { name: 'Tesla Model X' })).toBeInTheDocument();
});
