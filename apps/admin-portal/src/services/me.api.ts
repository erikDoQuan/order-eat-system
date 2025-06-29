export async function fetchMe(): Promise<any> {
  try {
    const token = localStorage.getItem('order-eat-access-token');
    const res = await fetch('http://localhost:3000/api/v1/users/me', {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!res.ok) return null;

    const json = await res.json();
    return json.data || json; // fallback nếu không có .data
  } catch {
    return null;
  }
}
