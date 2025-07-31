export interface AccessTokenPayload {
    id:string;
    email: string;
    plan:'free' | 'pro' | 'enterprise';
}