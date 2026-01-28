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

export default function Index() {
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

    return (
        <AuthenticatedLayout>
            <Head title="Settings" />
            <div className="py-12">
                <div className="max-w-3xl mx-auto sm:px-6 lg:px-8">
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
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
