import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage, router } from '@inertiajs/react';
import { useState, useRef } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Download, Upload, RefreshCw, Database, AlertCircle, CheckCircle, Clock, Calendar } from 'lucide-react';
import { exportBackup, importBackup, getEmergencyBackupInfo, restoreEmergencyBackup, getBackupSettings, saveBackupSettings } from '@/lib/backup';
import { getUnsyncedCount } from '@/lib/sync';

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

                    {/* Offline Data Backup Section */}
                    <OfflineBackupSection />

                    {/* System Configuration (Seeded Data) */}
                    {Object.entries(settings).map(([group, groupSettings]: [string, any]) => (
                        <SettingsGroup key={group} group={group} settings={groupSettings} />
                    ))}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

// Offline Backup Section Component
function OfflineBackupSection() {
    const [isExporting, setIsExporting] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [isRestoring, setIsRestoring] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [unsyncedCount, setUnsyncedCount] = useState<number | null>(null);
    const [emergencyInfo, setEmergencyInfo] = useState<{ timestamp: string; count: number } | null>(null);
    const [scheduleSettings, setScheduleSettings] = useState(() => getBackupSettings());
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Load initial data
    useState(() => {
        getUnsyncedCount().then(setUnsyncedCount).catch(() => { });
        const info = getEmergencyBackupInfo();
        if (info) setEmergencyInfo(info);
    });

    const handleScheduleChange = (key: string, value: any) => {
        const newSettings = { ...scheduleSettings, [key]: value };
        setScheduleSettings(newSettings);
        saveBackupSettings(newSettings);
        setMessage({ type: 'success', text: 'Backup schedule updated!' });
    };

    const handleExport = async () => {
        setIsExporting(true);
        setMessage(null);
        try {
            await exportBackup();
            setMessage({ type: 'success', text: 'Backup exported successfully!' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to export backup.' });
        } finally {
            setIsExporting(false);
        }
    };

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsImporting(true);
        setMessage(null);
        try {
            const result = await importBackup(file);
            setMessage({ type: 'success', text: `Imported ${result.imported} records (${result.skipped} skipped).` });
            const count = await getUnsyncedCount();
            setUnsyncedCount(count);
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to import backup. Invalid file format.' });
        } finally {
            setIsImporting(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleEmergencyRestore = async () => {
        setIsRestoring(true);
        setMessage(null);
        try {
            const result = await restoreEmergencyBackup();
            setMessage({ type: 'success', text: `Restored ${result.restored} records from emergency backup.` });
            const count = await getUnsyncedCount();
            setUnsyncedCount(count);
        } catch (error) {
            setMessage({ type: 'error', text: 'No emergency backup found or restore failed.' });
        } finally {
            setIsRestoring(false);
        }
    };

    return (
        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-8 h-full">
            <div className="mb-6 border-b border-gray-200 pb-4">
                <div className="flex items-center gap-2 mb-1">
                    <Database className="h-5 w-5 text-indigo-600" />
                    <h3 className="text-lg font-bold text-gray-900">Offline Data Backup</h3>
                </div>
                <p className="text-sm text-gray-500">Export or import local offline data for backup and recovery.</p>
            </div>

            {/* Status */}
            {unsyncedCount !== null && (
                <div className={`mb-6 p-3 rounded-lg flex items-center gap-2 ${unsyncedCount > 0 ? 'bg-amber-50 text-amber-800' : 'bg-green-50 text-green-800'}`}>
                    {unsyncedCount > 0 ? (
                        <>
                            <AlertCircle className="h-4 w-4" />
                            <span className="text-sm font-medium">{unsyncedCount} unsynced records pending</span>
                        </>
                    ) : (
                        <>
                            <CheckCircle className="h-4 w-4" />
                            <span className="text-sm font-medium">All data is synced</span>
                        </>
                    )}
                </div>
            )}

            {/* Message */}
            {message && (
                <div className={`mb-6 p-3 rounded-lg flex items-center gap-2 ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                    {message.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                    <span className="text-sm">{message.text}</span>
                </div>
            )}

            <div className="space-y-4">
                {/* Export Button */}
                <button
                    onClick={handleExport}
                    disabled={isExporting}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                    <Download className={`h-4 w-4 ${isExporting ? 'animate-bounce' : ''}`} />
                    <span className="font-medium">{isExporting ? 'Exporting...' : 'Export Backup'}</span>
                </button>

                {/* Import Button */}
                <label className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer transition-colors">
                    <Upload className={`h-4 w-4 ${isImporting ? 'animate-bounce' : ''}`} />
                    <span className="font-medium">{isImporting ? 'Importing...' : 'Import Backup'}</span>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".json"
                        onChange={handleImport}
                        disabled={isImporting}
                        className="hidden"
                    />
                </label>

                {/* Emergency Restore */}
                {emergencyInfo && (
                    <div className="pt-4 border-t border-gray-200">
                        <p className="text-xs text-gray-500 mb-2">
                            Emergency backup from {new Date(emergencyInfo.timestamp).toLocaleString()} ({emergencyInfo.count} records)
                        </p>
                        <button
                            onClick={handleEmergencyRestore}
                            disabled={isRestoring}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-amber-100 text-amber-800 rounded-lg hover:bg-amber-200 disabled:opacity-50 transition-colors"
                        >
                            <RefreshCw className={`h-4 w-4 ${isRestoring ? 'animate-spin' : ''}`} />
                            <span className="text-sm font-medium">{isRestoring ? 'Restoring...' : 'Restore Emergency Backup'}</span>
                        </button>
                    </div>
                )}

                {/* Scheduled Backup Settings */}
                <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2 mb-4">
                        <Clock className="h-4 w-4 text-indigo-600" />
                        <h4 className="text-sm font-semibold text-gray-900">Scheduled Backup</h4>
                    </div>

                    {/* Enable/Disable Toggle */}
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-sm text-gray-700">Auto-backup enabled</span>
                        <button
                            onClick={() => handleScheduleChange('enabled', !scheduleSettings.enabled)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${scheduleSettings.enabled ? 'bg-indigo-600' : 'bg-gray-200'
                                }`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${scheduleSettings.enabled ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                            />
                        </button>
                    </div>

                    {scheduleSettings.enabled && (
                        <div className="space-y-4">
                            {/* Frequency */}
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Frequency</label>
                                <div className="flex gap-2">
                                    {(['daily', 'weekly', 'monthly'] as const).map((freq) => (
                                        <button
                                            key={freq}
                                            onClick={() => handleScheduleChange('frequency', freq)}
                                            className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${scheduleSettings.frequency === freq
                                                    ? 'bg-indigo-600 text-white'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                        >
                                            {freq.charAt(0).toUpperCase() + freq.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Time */}
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Backup Time</label>
                                <input
                                    type="time"
                                    value={scheduleSettings.time}
                                    onChange={(e) => handleScheduleChange('time', e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            {/* Last Backup Info */}
                            {scheduleSettings.lastBackup && (
                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    Last backup: {new Date(scheduleSettings.lastBackup).toLocaleString()}
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
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
        // Prepare data for submission
        router.post(route('admin.settings.update'), {
            settings: values
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setIsEditing(false);
            }
        });
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

