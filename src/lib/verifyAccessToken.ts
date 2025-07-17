import { AccessTokenPayload } from '@/types/accessToken';
import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

export function verifyAccessToken(request:NextRequest):AccessTokenPayload | null{
    const token=request.cookies.get("accessToken")?.value;
    if(!token){
        return null;
    }

    try{
        const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET! ) as AccessTokenPayload;
        return payload;
    }catch(error:any){
        return null;
    }

}