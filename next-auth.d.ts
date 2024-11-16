import 'next-auth';
import { JWT } from 'next-auth/jwt';

// declare module 'next-auth' {
//     interface User {
//         id: string;
//         email: string;
//         role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
//         userType: 'APP_USER' | 'USER';
//     }

declare module 'next-auth' {
    interface User {
        id: string;
        email: string;
        first_name: string;
        last_name: string;
        phone_number: string;
        profile_picture?: string | null;
        date_of_birth?: Date | null;
        created_at: Date;
        updated_at: Date;
        deleted_at?: Date | null;
    }

    interface Session {
        user: {
            id: string;
            email: string;
            first_name: string;
            last_name: string;
            phone_number: string;
            profile_picture?: string | null;
            date_of_birth?: Date | null;
        } & DefaultSession['user'];
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        id: string;
        email: string;
        first_name: string;
        last_name: string;
        phone_number: string;
        profile_picture?: string | null;
        date_of_birth?: Date | null;
    }
}