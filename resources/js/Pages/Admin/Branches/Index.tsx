import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Icon } from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix for default marker icon
const defaultIcon = new Icon({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIconRetina,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

export default function Index() {
    // Hardcoded for now based on seeded data, ideally passed via props
    const branches = [
        { id: 1, name: 'Main Branch (Makati)', lat: 14.5547, lng: 121.0244, address: 'Ayala Ave, Makati, Metro Manila' },
        { id: 2, name: 'Downtown Branch (Manila)', lat: 14.5826, lng: 120.9787, address: 'Rizal Park, Manila' },
        { id: 3, name: 'Uptown Branch (QC)', lat: 14.6516, lng: 121.0493, address: 'Quezon Memorial Circle, QC' },
    ];

    return (
        <AuthenticatedLayout>
            <Head title="Branches" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-lg font-medium text-gray-900">Branch Locations</h3>
                                <p className="text-sm text-gray-500">Manage your store locations across the city.</p>
                            </div>
                            <button className="bg-gray-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800">
                                Add Branch
                            </button>
                        </div>

                        {/* Map Container */}
                        <div className="h-[400px] w-full rounded-xl overflow-hidden border border-gray-200 z-0 relative">
                            <MapContainer
                                center={[14.6091, 121.0223]} // Center of Metro Manila
                                zoom={11}
                                style={{ height: '100%', width: '100%' }}
                            >
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                {branches.map((branch) => (
                                    <Marker
                                        key={branch.id}
                                        position={[branch.lat, branch.lng]}
                                        icon={defaultIcon}
                                    >
                                        <Popup>
                                            <div className="p-2">
                                                <h4 className="font-bold text-gray-900">{branch.name}</h4>
                                                <p className="text-xs text-gray-600 mt-1">{branch.address}</p>
                                                <div className="mt-2 flex gap-2">
                                                    <span className="bg-green-100 text-green-800 text-[10px] px-2 py-0.5 rounded-full font-bold">OPEN</span>
                                                </div>
                                            </div>
                                        </Popup>
                                    </Marker>
                                ))}
                            </MapContainer>
                        </div>

                        {/* List View Below */}
                        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                            {branches.map((branch) => (
                                <div key={branch.id} className="border border-gray-200 p-4 rounded-lg hover:border-indigo-500 transition-colors cursor-pointer group">
                                    <h4 className="font-semibold text-gray-900 group-hover:text-indigo-600">{branch.name}</h4>
                                    <p className="text-sm text-gray-500 mt-1">{branch.address}</p>
                                    <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
                                        <span>ID: #{branch.id}</span>
                                        <span>Lat: {branch.lat}, Lng: {branch.lng}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
