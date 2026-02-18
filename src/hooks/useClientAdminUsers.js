import { useCallback, useEffect, useState } from "react";
import clientAdminService from "@/services/clientAdminService";

const useClientAdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await clientAdminService.listUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const createUser = useCallback(async (payload) => {
    const data = await clientAdminService.createUser(payload);
    await fetchUsers();
    return data;
  }, [fetchUsers]);

  const updateUser = useCallback(async (id, payload) => {
    const data = await clientAdminService.updateUser(id, payload);
    await fetchUsers();
    return data;
  }, [fetchUsers]);

  const setEmpresas = useCallback(async (id, payload) => {
    const data = await clientAdminService.setEmpresas(id, payload);
    await fetchUsers();
    return data;
  }, [fetchUsers]);

  const setPermissions = useCallback(async (id, payload) => {
    const data = await clientAdminService.setPermissions(id, payload);
    await fetchUsers();
    return data;
  }, [fetchUsers]);

  const deleteUser = useCallback(async (id) => {
    const data = await clientAdminService.deleteUser(id);
    await fetchUsers();
    return data;
  }, [fetchUsers]);

  return {
    users,
    loading,
    error,
    refresh: fetchUsers,
    createUser,
    updateUser,
    setEmpresas,
    setPermissions,
    deleteUser,
  };
};

export default useClientAdminUsers;
