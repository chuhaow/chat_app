export interface IConnectionData
{
    _id: string;
    username: string;
    deathTimer: NodeJS.Timeout;
    isAlive: boolean;
}