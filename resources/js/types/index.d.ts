export interface Role {
    id: number;
    name: string;
    display_name: string;
}

export interface Menu {
    id: number;
    name: string;
    route: string;
    icon: string;
    group: string;
    order: number;
}

export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
    role?: Role;
    role_id?: number;
    menus?: Menu[];
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User;
    };
    flash?: {
        success?: string;
        error?: string;
    };
};
