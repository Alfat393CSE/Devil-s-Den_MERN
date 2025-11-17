import { Box, Heading, List, ListItem, ListIcon, Text, Button, HStack } from "@chakra-ui/react";
import { useEffect, useState } from "react";

const Notifications = () => {
	const [items, setItems] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchNotifications = async () => {
			try {
				const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
				const headers = { 'Content-Type': 'application/json' };
				if (token) headers.Authorization = `Bearer ${token}`;
				const res = await fetch('/api/notifications', { headers });
				const data = await res.json();
				if (res.ok) setItems(data.data || []);
			} catch (e) {
				console.error(e);
			} finally { setLoading(false); }
		};
		fetchNotifications();
	}, []);

	const markRead = async (id) => {
		try {
			const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
			const headers = { 'Content-Type': 'application/json' };
			if (token) headers.Authorization = `Bearer ${token}`;
			await fetch(`/api/notifications/${id}/read`, { method: 'PATCH', headers });
			setItems(items.map(it => it._id === id ? { ...it, read: true } : it));
		} catch (e) { console.error(e); }
	}

	if (loading) return <Box p={6}><Text>Loading...</Text></Box>;

	return (
		<Box p={6}>
			<Heading mb={4}>Notifications</Heading>
			{!items.length ? <Text>No notifications</Text> : (
				<List spacing={3}>
					{items.map(it => (
						<ListItem key={it._id}>
							<HStack justify='space-between'>
								<Text>{it.message}</Text>
								{!it.read && <Button size='sm' onClick={() => markRead(it._id)}>Mark read</Button>}
							</HStack>
						</ListItem>
					))}
				</List>
			)}
		</Box>
	)
}

export default Notifications;
