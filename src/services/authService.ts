import { User, LoginCredentials } from '@/types/users';
import { toast } from 'sonner';
import { getUserByCredentials, updateUserLastLogin } from './user/supabaseUserService';

// Initialize the authenticated user state
let currentUser: User | null = null;
let isAuthenticated = false;

// Initialize the auth service
export const initializeAuthService = () => {
	// Check if there's a user in local storage
	const storedUser = localStorage.getItem('user');
	if (storedUser) {
		try {
			currentUser = JSON.parse(storedUser);
			isAuthenticated = true;
			console.log('User loaded from local storage:', currentUser);
		} catch (error) {
			console.error('Error parsing stored user:', error);
			localStorage.removeItem('user');
		}
	}
};

export const login = async (
	credentials: LoginCredentials
): Promise<{ success: boolean; user?: User; message: string }> => {
	console.log('Login attempt with:', credentials.email);

	try {
		// Get user from database
		const user = await getUserByCredentials(credentials.email, credentials.password);

		if (user) {
			// Update user's last login time
			await updateUserLastLogin(user.id);
			
			// Update local state
			user.lastLogin = new Date().toISOString();
			currentUser = user;
			isAuthenticated = true;
			
			// Store user in local storage (without password)
			const userToStore = { ...user, password: undefined };
			localStorage.setItem('user', JSON.stringify(userToStore));

			return {
				success: true,
				user: { ...user, password: '****' }, // Don't send password back to client
				message: 'Login successful'
			};
		} else {
			return {
				success: false,
				message: 'Invalid email or password'
			};
		}
	} catch (error) {
		console.error('Login error:', error);
		return {
			success: false,
			message: 'An error occurred during login'
		};
	}
};

export const logout = async (): Promise<{
	success: boolean;
	message: string;
}> => {
	try {
		// Clear local state
		currentUser = null;
		isAuthenticated = false;
		localStorage.removeItem('user');

		return {
			success: true,
			message: 'Logout successful'
		};
	} catch (error) {
		console.error('Logout error:', error);
		return {
			success: false,
			message: 'An error occurred during logout'
		};
	}
};

export const getCurrentUser = (): User | null => {
	return currentUser;
};

export const isUserAuthenticated = (): boolean => {
	return isAuthenticated;
};

// This function is kept for backward compatibility
// but now uses the Supabase service
export const registerUser = async (
	user: User
): Promise<{ success: boolean; user?: User; message: string }> => {
	// This would be implemented using the supabaseUserService.saveUser function
	// For now, just return an error
	return {
		success: false,
		message: 'User registration is not implemented in this version'
	};
};

// This function is kept for backward compatibility
export const addUser = (user: User): void => {
	console.warn('addUser is deprecated. Use supabaseUserService.saveUser instead');
};
