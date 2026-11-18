import { api } from "../api/client";
import { User } from "../types";

// BT9.4: PATCH /users/:id chỉ với { name, phone }.
// PATCH chỉ đổi trường được gửi nên không làm mất email/password như PUT.
// json-server trả cả `password` → phải loại password khỏi kết quả trước khi
// return, đừng đưa mật khẩu vào store.
export async function updateProfile(id: number, data: Pick<User, "name" | "phone">): Promise<User> {
  const res = await api.patch<User & { password?: string }>(`/users/${id}`, data);
  const { password: _pw, ...user } = res.data;
  return user;
}
