interface UserListProps {
  users: string[];
}

export default function UserList({ users }: UserListProps) {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold mb-2">Usuarios en línea</h2>
      <ul className="grid grid-cols-2 sm:grid-cols-1 gap-2">
        {users.map((user) => (
          <li key={user} className="bg-gray-100 rounded p-2 text-sm">
            {user}
          </li>
        ))}
      </ul>
    </div>
  );
}

