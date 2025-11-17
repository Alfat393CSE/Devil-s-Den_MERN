import { useEffect, useState, useRef } from "react";
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Spinner,
  Text,
  useToast,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

const AdminUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const toast = useToast();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const cancelRef = useRef();

  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (!raw) return navigate("/signin");
    try {
      const u = JSON.parse(raw);
      if (u.role !== "admin") return navigate("/signin");
    } catch (err) {
      return navigate("/signin");
    }

    fetchUsers();
  }, [navigate]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/admin/users", { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load users");
      setUsers(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const requestToggleRole = (user) => {
    // open confirmation dialog
    setSelectedUser(user);
    setConfirmOpen(true);
  };

  const confirmToggle = async () => {
    if (!selectedUser) return;
    const id = selectedUser._id;
    const currentRole = selectedUser.role;
    const newRole = currentRole === "admin" ? "user" : "admin";

    // prevent self-demotion
    try {
      const raw = localStorage.getItem("user");
      const me = raw ? JSON.parse(raw) : null;
      if (me && me.id === id && newRole !== "admin") {
        toast({ title: "Action blocked", description: "You cannot remove your own admin role.", status: "warning", duration: 4000, isClosable: true });
        setConfirmOpen(false);
        setSelectedUser(null);
        return;
      }

      const token = localStorage.getItem("token");
      const res = await fetch(`/api/admin/users/${id}/role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update role");
      toast({ title: "Success", description: data.message || "Role updated", status: "success", duration: 3000, isClosable: true });
      // refresh list
      await fetchUsers();
    } catch (err) {
      toast({ title: "Error", description: err.message || "Error updating role", status: "error", duration: 4000, isClosable: true });
    } finally {
      setConfirmOpen(false);
      setSelectedUser(null);
    }
  };

  // current logged-in user id (for preventing self-demote)
  let currentUserId = null;
  try { const raw = localStorage.getItem('user'); if (raw) currentUserId = JSON.parse(raw).id; } catch(e){ currentUserId = null }

  if (loading) return <Box p={6}><Spinner /></Box>;

  return (
    <Box maxW="1000px" mx="auto" mt={8} p={6} bg="white" rounded="md" shadow="sm">
      <Heading size="lg" mb={4}>Manage Users</Heading>
      {error && <Text color="red.500">{error}</Text>}
      <Table>
        <Thead>
          <Tr>
            <Th>Name</Th>
            <Th>Email</Th>
            <Th>Role</Th>
            <Th>Verified</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {users.map((u) => (
            <Tr key={u._id}>
              <Td>{u.name}</Td>
              <Td>{u.email}</Td>
              <Td>{u.role}</Td>
              <Td>{u.isVerified ? "Yes" : "No"}</Td>
              <Td>
                <Button size="sm" onClick={() => requestToggleRole(u)} isDisabled={u._id === currentUserId && u.role === 'admin'}>
                  Make {u.role === "admin" ? "User" : "Admin"}
                </Button>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      <AlertDialog isOpen={confirmOpen} leastDestructiveRef={cancelRef} onClose={() => { setConfirmOpen(false); setSelectedUser(null); }}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">Confirm role change</AlertDialogHeader>

            <AlertDialogBody>
              {selectedUser ? (
                <>
                  Are you sure you want to change the role for <strong>{selectedUser.name}</strong> ({selectedUser.email}) to <strong>{selectedUser.role === 'admin' ? 'user' : 'admin'}</strong>?
                </>
              ) : null}
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => { setConfirmOpen(false); setSelectedUser(null); }}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={confirmToggle} ml={3}>
                Confirm
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default AdminUsers;
