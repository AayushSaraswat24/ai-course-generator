import jwt from 'jsonwebtoken';
import { AccessTokenPayload } from '../types/accessToken';

export function generateAccessToken(payload: AccessTokenPayload): string {
    return jwt.sign(payload,process.env.ACCESS_TOKEN_SECRET!,{
        expiresIn: "15m"
    })
}