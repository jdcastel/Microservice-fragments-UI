const API_URL = process.env.API_URL;

export async function getUserFragments(user) {
  console.log("Requesting data from user -");
  try {
    const res = await fetch(`${API_URL}/v1/fragments/`, {
      headers: {
        Authorization: `Bearer ${user.idToken}`,
      },
    });
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    console.log("got the user data -", { data });
  } catch (err) {
    console.error("Error getting data v1/fragments", { err });
  }
}