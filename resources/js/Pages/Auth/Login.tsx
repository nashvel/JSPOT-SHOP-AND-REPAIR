import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { User, Lock } from 'lucide-react';

export default function Login({
    status,
    canResetPassword,
}: {
    status?: string;
    canResetPassword: boolean;
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false as boolean,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Log in" />

            <form onSubmit={submit} className="mt-8 space-y-6">
                <div className="space-y-6">
                    {/* Username/Email Input */}
                    <div className="relative group">
                        <InputLabel
                            htmlFor="email"
                            value="Username"
                            className="text-xs text-gray-500 font-medium mb-1"
                        />
                        <div className="relative">
                            <TextInput
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                className="block w-full border-0 border-b border-gray-300 py-3 pl-8 text-gray-900 placeholder-gray-400 focus:border-purple-500 focus:ring-0 sm:text-sm bg-transparent transition-colors"
                                autoComplete="username"
                                isFocused={true}
                                placeholder="Type your username"
                                onChange={(e) => setData('email', e.target.value)}
                            />
                            <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
                                <User className="h-4 w-4 text-gray-400" />
                            </div>
                        </div>
                        <InputError message={errors.email} className="mt-2" />
                    </div>

                    {/* Password Input */}
                    <div className="relative group">
                        <InputLabel
                            htmlFor="password"
                            value="Password"
                            className="text-xs text-gray-500 font-medium mb-1"
                        />
                        <div className="relative">
                            <TextInput
                                id="password"
                                type="password"
                                name="password"
                                value={data.password}
                                className="block w-full border-0 border-b border-gray-300 py-3 pl-8 text-gray-900 placeholder-gray-400 focus:border-purple-500 focus:ring-0 sm:text-sm bg-transparent transition-colors"
                                autoComplete="current-password"
                                placeholder="Type your password"
                                onChange={(e) => setData('password', e.target.value)}
                            />
                            <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
                                <Lock className="h-4 w-4 text-gray-400" />
                            </div>
                        </div>
                        <InputError message={errors.password} className="mt-2" />
                    </div>
                </div>

                <div className="flex items-center justify-end">
                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className="text-xs text-gray-400 hover:text-purple-600 transition-colors"
                        >
                            Forgot password?
                        </Link>
                    )}
                </div>

                <div>
                    <PrimaryButton
                        className="w-full justify-center py-3 bg-white hover:bg-gray-50 transition-colors rounded-full border border-gray-200 shadow-lg"
                        disabled={processing}
                    >
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 font-bold tracking-wider">
                            LOGIN
                        </span>
                    </PrimaryButton>
                </div>

                {status && (
                    <div className="text-sm font-medium text-green-600 bg-green-50 p-2 rounded text-center">
                        {status}
                    </div>
                )}
            </form>
        </GuestLayout>
    );
}
