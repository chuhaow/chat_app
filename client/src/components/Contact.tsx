import Avatar from "./Avatar";


interface ContactProps {
    username: string;
    id: string;
    onClick: (userId: string) => void;
    selectedUserId: string | null;
    online: boolean
}
  
  const Contact: React.FC<ContactProps> = ({ username, id, onClick, selectedUserId, online }) => (
    <div
      key={id}
      onClick={() => onClick(id)}
      className={`border-b border-gray-100 py-2 pl-4 flex items-center gap-2 cursor-pointer ${
        id === selectedUserId ? 'bg-blue-100' : ''
      }`}
    >
      <Avatar online={online} userId={id} username={username} />
      {username}
    </div>
  );
  
  export default Contact;