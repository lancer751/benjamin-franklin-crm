import { useEffect, useState } from "react";
import { benjaminCrmApi } from "./lib/apiConnection";

type ProfessorsResponse = Awaited<
  ReturnType<typeof benjaminCrmApi.academic.professors.$get>
>;
type PublicUser = Awaited<
  ReturnType<ProfessorsResponse["json"]>
>["data"][number];

function App() {
  const [professors, setUsers] = useState<PublicUser[]>([]);
  useEffect(() => {
    async function getProffesors() {
      const res: ProfessorsResponse =
        await benjaminCrmApi.academic.professors.$get();
      const data = await res.json();
      setUsers(data.data);
    }

    getProffesors();
  }, []);

  return (
    <div>
      {professors.length === 0 ? <p>Add a new professor to see them here.</p> : professors.map((pr) => (
        <div className="p-3 rounded-md border-gray-300 text-lg capitalize" key={pr.id}>
          {pr.name} {pr.lastname}
        </div>
      ))}
    </div>
  );
}

export default App;
