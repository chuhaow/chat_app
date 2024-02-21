import Avatar from "./Avatar";


interface ContactProps {
    username: string;
    id: string;
    onClick: (userId: string) => void;
    selectedUserId: string | null;
    online: boolean;
    notificationCount: number
}
  
  const Contact: React.FC<ContactProps> = ({ username, id, onClick, selectedUserId, online, notificationCount }) => (
    <div
      key={id}
      onClick={() => onClick(id)}
      className={`border-b border-gray-100 py-2 pl-4 flex items-center gap-2 cursor-pointer relative ${
        id === selectedUserId ? 'bg-blue-100' : ''
      }`}
    >
      <Avatar online={online} userId={id} username={username} />
      {username}
      {notificationCount > 0 && (
        <div className="absolute right-10 rounded-full flex items-center w-5 h-5 bg-red-400">
          <div className="text-center w-full">{notificationCount}</div>
        </div>        
      )}

    </div>
  );
  
  export default Contact;