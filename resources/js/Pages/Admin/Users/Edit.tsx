import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

interface Role {
    id: number;
    name: string;
    display_name: string;
}

interface Props {
    user: any;
    availableMenus: any[];
    roles: Role[];
}

export default function Edit({ user, availableMenus, roles }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        name: user.name,
        email: user.email,
        password: '',
        role_id: user.role_id || (roles[0]?.id || 0),
        menus: user.menus.map((m: any) => m.id) as number[],
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('admin.users.update', user.id));
    };

    const handleMenuChange = (id: number, checked: boolean) => {
        if (checked) {
            setData('menus', [...data.menus, id]);
        } else {
            setData('menus', data.menus.filter(menuId => menuId !== id));
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Edit User: {user.name}
                </h2>
            }
        >
            <Head title="Edit User" />

            <div className="py-12">
                <div className="mx-auto max-w-2xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <form onSubmit={submit}>
                                <div>
                                    <InputLabel htmlFor="name" value="Name" />

                                    <TextInput
                                        id="name"
                                        name="name"
                                        value={data.name}
                                        className="mt-1 block w-full"
                                        autoComplete="name"
                                        isFocused={true}
                                        onChange={(e) =>
                                            setData('name', e.target.value)
                                        }
                                        required
                                    />

                                    <InputError
                                        message={errors.name}
                                        className="mt-2"
                                    />
                                </div>

                                <div className="mt-4">
                                    <InputLabel htmlFor="email" value="Email" />

                                    <TextInput
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={data.email}
                                        className="mt-1 block w-full"
                                        autoComplete="username"
                                        onChange={(e) =>
                                            setData('email', e.target.value)
                                        }
                                        required
                                    />

                                    <InputError
                                        message={errors.email}
                                        className="mt-2"
                                    />
                                </div>

                                <div className="mt-4">
                                    <InputLabel htmlFor="role_id" value="Role" />

                                    <select
                                        id="role_id"
                                        name="role_id"
                                        value={data.role_id}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        onChange={(e) =>
                                            setData('role_id', parseInt(e.target.value))
                                        }
                                        required
                                    >
                                        {roles.map((role) => (
                                            <option key={role.id} value={role.id}>{role.display_name}</option>
                                        ))}
                                    </select>

                                    <InputError
                                        message={errors.role_id}
                                        className="mt-2"
                                    />
                                </div>

                                <div className="mt-4">
                                    <InputLabel value="Sidebar Menu Access" />
                                    <div className="mt-2 grid grid-cols-2 gap-4">
                                        {availableMenus.map((menu) => (
                                            <div key={menu.id} className="flex items-center">
                                                <Checkbox
                                                    name="menus"
                                                    value={menu.id.toString()}
                                                    checked={data.menus.includes(menu.id)}
                                                    onChange={(e) => handleMenuChange(menu.id, e.target.checked)}
                                                />
                                                <span className="ms-2 text-sm text-gray-600">{menu.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <InputError message={errors.menus} className="mt-2" />
                                </div>

                                <div className="mt-4">
                                    <InputLabel
                                        htmlFor="password"
                                        value="Password (Leave blank to keep current)"
                                    />

                                    <TextInput
                                        id="password"
                                        type="password"
                                        name="password"
                                        value={data.password}
                                        className="mt-1 block w-full"
                                        autoComplete="new-password"
                                        onChange={(e) =>
                                            setData('password', e.target.value)
                                        }
                                    />

                                    <InputError
                                        message={errors.password}
                                        className="mt-2"
                                    />
                                </div>

                                <div className="mt-4 flex items-center justify-end">
                                    <PrimaryButton
                                        className="ms-4"
                                        disabled={processing}
                                    >
                                        Update User
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
