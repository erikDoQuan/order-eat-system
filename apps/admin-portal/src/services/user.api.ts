export async function register(
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  phoneNumber: string,
  address: string,
): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch('http://localhost:3000/api/v1/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        firstName,
        lastName,
        phoneNumber,
        address,
        role: 'user',
        isActive: true,
      }),
    });
    const data = await res.json().catch(() => null);
    if (res.ok) {
      return { success: true, message: 'Đăng ký thành công' };
    }
    return { success: false, message: data?.message || 'Đăng ký thất bại' };
  } catch (err) {
    return { success: false, message: 'Có lỗi xảy ra' };
  }
}
