import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

// Draggable Item Component
function SortableItem(props: any) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: props.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="bg-white border border-gray-200 rounded-lg p-4 mb-3 flex items-center justify-between shadow-sm cursor-move hover:border-indigo-500 transition-colors">
            <div className="flex items-center gap-4">
                <GripVertical className="text-gray-400" />
                <div>
                    <h4 className="font-semibold text-gray-900">{props.title}</h4>
                    <p className="text-xs text-gray-500">{props.description}</p>
                </div>
            </div>
            <div className={`px-2 py-1 rounded text-xs font-bold ${props.enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {props.enabled ? 'VISIBLE' : 'HIDDEN'}
            </div>
        </div>
    );
}

export default function Index({ settings }: { settings: any }) {
    // Mock Data - in real app, fetch from backend via Props
    const [items, setItems] = useState([
        { id: 'hero', title: 'Hero Section', description: 'Main banner with search bar', enabled: true },
        { id: 'catalog', title: 'Product Catalog', description: 'Grid view of available items', enabled: true },
        { id: 'tracker', title: 'Service Tracker', description: 'Input for checking repair status', enabled: true },
        { id: 'features', title: 'Features Grid', description: 'Marketing highlights (Fast, Secure, etc.)', enabled: false },
    ]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    function handleDragEnd(event: any) {
        const { active, over } = event;

        if (active.id !== over.id) {
            setItems((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    }

    // Capitalize helper
    const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

    // Format setting key helper
    const formatKey = (key: string) => key.split('_').map(capitalize).join(' ');

    return (
        <AuthenticatedLayout>
            <Head title="Settings" />
            <div className="py-12">
                <div className="w-full mx-auto sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Public Portal Layout Section */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-8">
                        <div className="mb-8 border-b border-gray-200 pb-4">
                            <h3 className="text-lg font-bold text-gray-900">Public Portal Layout</h3>
                            <p className="text-sm text-gray-500">Drag and drop to reorder sections on the public homepage.</p>
                        </div>

                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext
                                items={items}
                                strategy={verticalListSortingStrategy}
                            >
                                {items.map((item) => (
                                    <SortableItem key={item.id} id={item.id} title={item.title} description={item.description} enabled={item.enabled} />
                                ))}
                            </SortableContext>
                        </DndContext>

                        <div className="mt-8 flex justify-end">
                            <button className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 shadow-sm transition-colors">
                                Save Layout
                            </button>
                        </div>
                    </div>

                    {/* System Configuration (Seeded Data) */}
                    {Object.entries(settings).map(([group, groupSettings]: [string, any]) => (
                        <SettingsGroup key={group} group={group} settings={groupSettings} />
                    ))}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

// Color Mapping for UI display
const COLOR_MAP: Record<string, string> = {
    'purple': '#a855f7',
    'gray': '#6b7280',
    'red': '#ef4444',
    'blue': '#3b82f6',
    'green': '#22c55e',
    'yellow': '#eab308',
    'orange': '#f97316',
    'pink': '#ec4899',
    'indigo': '#6366f1',
    'teal': '#14b8a6',
    'cyan': '#06b6d4',
    'black': '#000000',
    'white': '#ffffff',
    'slate': '#64748b',
    'zinc': '#71717a',
    'neutral': '#737373',
    'stone': '#78716c',
    'amber': '#f59e0b',
    'lime': '#84cc16',
    'emerald': '#10b981',
    'sky': '#0ea5e9',
    'violet': '#8b5cf6',
    'fuchsia': '#d946ef',
    'rose': '#f43f5e',
};

function SettingsGroup({ group, settings }: { group: string, settings: any[] }) {
    const [isEditing, setIsEditing] = useState(false);
    const [values, setValues] = useState(settings);

    // Capitalize helper
    const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

    // Format setting key helper
    const formatKey = (key: string) => key.split('_').map(capitalize).join(' ');

    const handleSave = () => {
        // Here you would typically make an API call to save the changes
        console.log('Saving settings for', group, values);
        setIsEditing(false);
    };

    const handleCancel = () => {
        // Reset values to original settings (or last saved state)
        setValues(settings);
        setIsEditing(false);
    };

    const updateValue = (id: number, newValue: string) => {
        setValues(prev => prev.map(item => item.id === id ? { ...item, value: newValue } : item));
    };

    return (
        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-8 h-full">
            <div className="mb-6 border-b border-gray-200 pb-4 flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-bold text-gray-900 capitalize">{group} Configuration</h3>
                    <p className="text-sm text-gray-500">Manage settings for {group} module.</p>
                </div>
                {!isEditing ? (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="text-indigo-600 hover:text-indigo-900 font-medium text-sm flex items-center gap-1"
                    >
                        Edit
                    </button>
                ) : (
                    <div className="flex gap-2">
                        <button
                            onClick={handleCancel}
                            className="text-gray-500 hover:text-gray-700 font-medium text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="bg-indigo-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-indigo-700"
                        >
                            Save
                        </button>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {values.map((setting: any) => (
                    <div key={setting.id} className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700 capitalize">
                            {formatKey(setting.key)}
                        </label>

                        {setting.key.includes('color') ? (
                            <div className="mt-1">
                                {isEditing ? (
                                    <div className="flex flex-wrap gap-2">
                                        {Object.entries(COLOR_MAP).map(([name, hex]) => (
                                            <button
                                                key={name}
                                                onClick={() => updateValue(setting.id, name)}
                                                type="button"
                                                className={`h-8 w-8 rounded-full border shadow-sm transition-all hover:scale-110 ${setting.value === name ? 'ring-2 ring-indigo-500 ring-offset-2 scale-110' : 'border-gray-200'}`}
                                                style={{ backgroundColor: hex }}
                                                title={capitalize(name)}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 mt-1">
                                        <div
                                            className="h-6 w-6 rounded-full border border-gray-200 shadow-sm"
                                            style={{ backgroundColor: COLOR_MAP[setting.value] || setting.value }}
                                        />
                                        <span className="text-sm text-gray-700 capitalize">{setting.value}</span>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <input
                                type={setting.type === 'integer' ? 'number' : 'text'}
                                value={setting.value}
                                onChange={(e) => updateValue(setting.id, e.target.value)}
                                disabled={!isEditing}
                                className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm transition-colors ${isEditing
                                        ? 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                                        : 'border-transparent bg-gray-50 text-gray-500 cursor-not-allowed'
                                    }`}
                            />
                        )}
                        <p className="text-xs text-gray-400">Key: {setting.key}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

