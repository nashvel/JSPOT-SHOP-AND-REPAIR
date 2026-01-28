import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function Edit({ menu }: { menu: any }) {
    const { data, setData, put, processing, errors } = useForm({
        name: menu.name,
        route: menu.route,
        icon: menu.icon,
        order: menu.order,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('admin.menus.update', menu.id));
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Edit Menu Item: {menu.name}
                </h2>
            }
        >
            <Head title="Edit Menu" />

            <div className="py-12">
                <div className="mx-auto max-w-2xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <form onSubmit={submit}>
                                <div>
                                    <InputLabel htmlFor="name" value="Display Name" />
                                    <TextInput
                                        id="name"
                                        value={data.name}
                                        className="mt-1 block w-full"
                                        isFocused={true}
                                        onChange={(e) => setData('name', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.name} className="mt-2" />
                                </div>

                                <div className="mt-4">
                                    <InputLabel htmlFor="route" value="Route Name (e.g., admin.dashboard)" />
                                    <TextInput
                                        id="route"
                                        value={data.route}
                                        className="mt-1 block w-full"
                                        onChange={(e) => setData('route', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.route} className="mt-2" />
                                </div>

                                <div className="mt-4">
                                    <InputLabel htmlFor="icon" value="Lucide Icon Name (e.g., LayoutDashboard)" />
                                    <TextInput
                                        id="icon"
                                        value={data.icon}
                                        className="mt-1 block w-full"
                                        onChange={(e) => setData('icon', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.icon} className="mt-2" />
                                </div>

                                <div className="mt-4">
                                    <InputLabel htmlFor="order" value="Order" />
                                    <TextInput
                                        id="order"
                                        type="number"
                                        value={data.order}
                                        className="mt-1 block w-full"
                                        onChange={(e) => setData('order', parseInt(e.target.value))}
                                        required
                                    />
                                    <InputError message={errors.order} className="mt-2" />
                                </div>

                                <div className="mt-4 flex items-center justify-end">
                                    <PrimaryButton className="ms-4" disabled={processing}>
                                        Update Menu
                                    </PrimaryButton>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
