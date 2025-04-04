import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { login, isUserAuthenticated } from '@/services/authService';
import { toast } from 'sonner';
import { ThemeToggle } from '@/components/ThemeToggle';

const Login = () => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const navigate = useNavigate();

	useEffect(() => {
		// If already authenticated, redirect to dashboard (previously redirected to admin)
		if (isUserAuthenticated()) {
			navigate('/index');
		}
	}, [navigate]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);

		try {
			const result = await login({ email, password });

			if (result.success) {
				toast.success(result.message);
				navigate('/index'); // Changed from '/admin' to '/index'
			} else {
				toast.error(result.message);
			}
		} catch (error) {
			toast.error('An error occurred during login');
			console.error(error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 dark:from-blue-950 dark:via-indigo-900 dark:to-purple-900 px-4">
			<div className="absolute top-2 sm:top-4 right-2 sm:right-4">
				<ThemeToggle />
			</div>
			<div className="max-w-md w-full p-4 sm:p-6 md:p-8 glass-card rounded-lg shadow-lg">
				<h2 className="text-xl sm:text-2xl font-bold text-center mb-4 sm:mb-6">
					Briks Environment Monitoring
				</h2>

				<form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
					<div className="space-y-2">
						<Label htmlFor="email">Email</Label>
						<Input
							id="email"
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder="admin@example.com"
							required
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="password">Password</Label>
						<Input
							id="password"
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							placeholder="••••••••"
							required
						/>
					</div>

					<Button
						type="submit"
						className="w-full"
						disabled={isLoading}
					>
						{isLoading ? 'Logging in...' : 'Login'}
					</Button>
				</form>
			</div>
		</div>
	);
};

export default Login;
