interface UserListProps {
  users: string[];
  usersInRoom: string[];
  room: string;
}

export default function UserList({ users, room, usersInRoom }: UserListProps) {
  return (
    <div className="mb-8">
      <h2
        className="text-xl font-bold mb-2">{room === 'global' ? 'Usuarios en línea' : `Usuarios en la sala ${room}`}</h2>
      <ul className="grid grid-cols-2 sm:grid-cols-1 gap-2">
        {room === 'global' && users.map((user) => (
          <li key={user} className="bg-gray-100 rounded p-2 text-sm">
            {user}
          </li>
        ))}
        {room !== 'global' && usersInRoom.map((user) => (
          <li key={user} className="bg-gray-100 rounded p-2 text-sm">
            {user}
          </li>
        ))}
      </ul>
    </div>
  );
}

