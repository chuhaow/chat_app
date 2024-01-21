export default function Avatar({ online ,userId, username }: { online: boolean ;userId: string; username: string }) {
    const backgroundColors = [
        'bg-red-200',
        'bg-yellow-200',
        'bg-green-200',
        'bg-blue-200',
        'bg-indigo-200',
        'bg-purple-200',
        'bg-pink-200',
        'bg-teal-200'
      ];
    const userIdBase10: number = parseInt(userId, 16);
    const color = backgroundColors[userIdBase10 % backgroundColors.length];
    return (
        <div className={`w-8 h-8 rounded-full flex items-center relative ${color}`}>
            <div className="text-center w-full">{username[0]}</div>
            {online && (
                <div className="absolute w-3 h-3 bg-green-400 bottom-0 right-0 rounded-full border border-white"></div>
            )}
            {!online && (
                <div className="absolute w-3 h-3 bg-gray-400 bottom-0 right-0 rounded-full border border-white"></div>
            )}
            
        </div>
    );
}