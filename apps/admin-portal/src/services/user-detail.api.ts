export async function fetchUserByEmail(email: string): Promise<any> {
  try {
    const res = await fetch(`http://localhost:3000/api/v1/admin/users/email/${encodeURIComponent(email)}`, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
