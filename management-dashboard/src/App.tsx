import { useEffect, useState } from "react";
import { benjaminCrmApi } from "./lib/apiConnection";

type UsersResponse = Awaited<ReturnType<typeof benjaminCrmApi.users.$get>>;
type PublicUser = Awaited<ReturnType<UsersResponse["json"]>>["data"][number]

function App() {
  const [users, setUsers] = useState<PublicUser[]>([]);
  console.log(users)
  useEffect(() => {
    async function getUsers() {
      const res: UsersResponse= await benjaminCrmApi.users.$get();
      const data = await res.json();
      setUsers(data.data);
    }

    getUsers();
  }, []);

  return (
    <>
      {users.map((u) => (
        <p key={u.id}>{u.first_name}</p>
      ))}
    </>
  );
}

export default App;
