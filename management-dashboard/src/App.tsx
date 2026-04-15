import { useEffect, useState } from "react";
import "./App.css";
import { benjaminCrmApi } from "./lib/apiConnection";

type ResponseType = Awaited<ReturnType<typeof benjaminCrmApi.users.$get>>;

function App() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [users, setUsers] = useState<any[]>([]);
  console.log(users)
  useEffect(() => {
    async function getUsers() {
      const res: ResponseType= await benjaminCrmApi.users.$get();
      const data = await res.json();
      setUsers(data);
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
