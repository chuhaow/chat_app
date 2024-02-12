import crypto from 'crypto';

export interface IConnectionData
{
    _id: string;
    connectionId: string;
    username: string;
    deathTimer: NodeJS.Timeout;
    isAlive: boolean;
}

export function generateConnectionId(userId: string, token: string): string {
    const rawConnectionId = `${userId}${token}`;
    const hashedConnectionId = crypto.createHash('sha256').update(rawConnectionId).digest('hex');
    return hashedConnectionId;
}