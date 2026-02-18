import apiService from "@/app/api/apiService";

const unwrap = (response) => response?.data?.data ?? response?.data ?? null;

const clientAdminService = {
  async listUsers() {
    const res = await apiService.get("/client-admin/users");
    return unwrap(res) || [];
  },
  async createUser(payload) {
    const res = await apiService.post("/client-admin/users", payload);
    return unwrap(res);
  },
  async updateUser(id, payload) {
    const res = await apiService.patch(`/client-admin/users/${id}`, payload);
    return unwrap(res);
  },
  async setEmpresas(id, payload) {
    const res = await apiService.patch(`/client-admin/users/${id}/empresas`, payload);
    return unwrap(res);
  },
  async setPermissions(id, payload) {
    const res = await apiService.patch(
      `/client-admin/users/${id}/permissions`,
      payload
    );
    return unwrap(res);
  },
  async deleteUser(id) {
    const res = await apiService.delete(`/client-admin/users/${id}`);
    return unwrap(res);
  },
};

export default clientAdminService;
