import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Icon } from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { MapPin, Plus, Users, Move } from 'lucide-react';
import { useRef, useMemo, useState } from 'react';

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

interface Branch {
    id: number;
    name: string;
    address: string | null;
    contact_number: string | null;
    latitude: number | null;
    longitude: number | null;
    is_main: boolean;
}

interface Props {
    branches: Branch[];
}

export default function Locations({ branches }: Props) {
    const [updatingBranch, setUpdatingBranch] = useState<number | null>(null);
    
    // Filter branches with valid coordinates
    const branchesWithCoords = branches.filter(b => {
        const lat = Number(b.latitude);
        const lng = Number(b.longitude);
        return !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;
    });

    // Default center (Metro Manila) or first branch with coords
    const defaultCenter: [number, number] = branchesWithCoords.length > 0
        ? [Number(branchesWithCoords[0].latitude!), Number(branchesWithCoords[0].longitude!)]
        : [14.6091, 121.0223];

    const handleMarkerDragEnd = (branchId: number, event: any) => {
        const marker = event.target;
        const position = marker.getLatLng();
        
        setUpdatingBranch(branchId);
        
        // Update branch coordinates using dedicated endpoint
        router.patch(
            route('admin.branches.coordinates.update', branchId),
            {
                latitude: position.lat,
                longitude: position.lng,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setUpdatingBranch(null);
                },
                onError: (errors) => {
                    setUpdatingBranch(null);
                    console.error('Update failed:', errors);
                    alert('Failed to update branch location. Please try again.');
                },
            }
        );
    };

    // Component for draggable marker
    const DraggableMarker = ({ branch }: { branch: Branch }) => {
        const markerRef = useRef<any>(null);
        const position: [number, number] = [Number(branch.latitude!), Number(branch.longitude!)];

        const eventHandlers = useMemo(
            () => ({
                dragend() {
                    const marker = markerRef.current;
                    if (marker != null) {
                        handleMarkerDragEnd(branch.id, { target: marker });
                    }
                },
            }),
            [branch.id]
        );

        return (
            <Marker
                draggable={true}
                eventHandlers={eventHandlers}
                position={position}
                ref={markerRef}
                icon={defaultIcon}
            >
                <Popup>
                    <div className="p-2 min-w-[200px]">
                        <div className="flex items-center gap-2 mb-2">
                            <Move className="h-4 w-4 text-indigo-600" />
                            <span className="text-xs text-indigo-600 font-medium">Drag to reposition</span>
                        </div>
                        <h4 className="font-bold text-gray-900">{branch.name}</h4>
                        {branch.address && (
                            <p className="text-xs text-gray-600 mt-1">{branch.address}</p>
                        )}
                        {branch.contact_number && (
                            <p className="text-xs text-gray-500 mt-1">{branch.contact_number}</p>
                        )}
                        <div className="mt-2 flex gap-2">
                            {branch.is_main && (
                                <span className="bg-indigo-100 text-indigo-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
                                    MAIN
                                </span>
                            )}
                            <span className="bg-green-100 text-green-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
                                OPEN
                            </span>
                        </div>
                        <Link
                            href={route('admin.branches.edit', branch.id)}
                            className="mt-3 block text-center text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                        >
                            Manage Branch
                        </Link>
                    </div>
                </Popup>
            </Marker>
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title="Branch Locations" />
            <div className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-900">Branch Locations</h1>
                        <p className="text-sm text-gray-500 mt-1">View all branch locations on the map</p>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        {/* Map Container */}
                        <div className="h-[500px] w-full relative z-0">
                            {branchesWithCoords.length > 0 ? (
                                <MapContainer
                                    center={defaultCenter}
                                    zoom={11}
                                    style={{ height: '100%', width: '100%' }}
                                >
                                    <TileLayer
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    />
                                    {branchesWithCoords.map((branch) => (
                                        <DraggableMarker key={branch.id} branch={branch} />
                                    ))}
                                </MapContainer>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center bg-gray-50">
                                    <MapPin className="h-16 w-16 text-gray-300 mb-4" />
                                    <p className="text-gray-500 mb-2">No branches with coordinates yet</p>
                                    <p className="text-sm text-gray-400">Add coordinates when creating or editing branches</p>
                                </div>
                            )}
                        </div>

                        {/* Branch List Below Map */}
                        <div className="border-t border-gray-200">
                            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                                <h3 className="text-sm font-medium text-gray-700">
                                    All Branches ({branches.length})
                                    {updatingBranch && (
                                        <span className="ml-2 text-xs text-indigo-600">Updating location...</span>
                                    )}
                                </h3>
                            </div>
                            <div className="divide-y divide-gray-100">
                                {branches.map((branch) => (
                                    <div key={branch.id} className={`px-6 py-4 flex items-center justify-between hover:bg-gray-50 ${updatingBranch === branch.id ? 'bg-indigo-50' : ''}`}>
                                        <div className="flex items-center gap-4">
                                            <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${branch.latitude && branch.longitude ? 'bg-green-100' : 'bg-amber-100'}`}>
                                                <MapPin className={`h-5 w-5 ${branch.latitude && branch.longitude ? 'text-green-600' : 'text-amber-600'}`} />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">
                                                    {branch.name}
                                                    {branch.is_main && (
                                                        <span className="ml-2 text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">Main</span>
                                                    )}
                                                </p>
                                                <p className="text-sm text-gray-500">{branch.address || 'No address'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            {branch.latitude && branch.longitude ? (
                                                <span className="text-xs text-gray-400">
                                                    {Number(branch.latitude).toFixed(4)}, {Number(branch.longitude).toFixed(4)}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded flex items-center gap-1">
                                                    <MapPin className="h-3 w-3" />
                                                    Set location in edit
                                                </span>
                                            )}
                                            <Link
                                                href={route('admin.branches.edit', branch.id)}
                                                className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                                            >
                                                Edit
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                                {branches.length === 0 && (
                                    <div className="px-6 py-12 text-center">
                                        <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                        <p className="text-gray-500 mb-2">No branches yet</p>
                                        <Link
                                            href={route('admin.branches.index')}
                                            className="text-indigo-600 hover:text-indigo-800 font-medium text-sm"
                                        >
                                            Go to Branch Accounts to create one
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
