export default function Avatar({ userId, username }: { userId: string; username: string }) {
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
        <div className={`w-8 h-8 rounded-full flex items-center ${color}`}>
            <div className="text-center w-full">{username[0]}</div>
        </div>
    );
}