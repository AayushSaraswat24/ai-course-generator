import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
try{

    const cookiesStore=await cookies();
    const refreshToken=cookiesStore.get("refreshToken");
    if(!refreshToken){
      return NextResponse.json({
        success: false,
        message: "no token"
      }, { status: 401 });
    }
    return NextResponse.json({
      success: true,
      message: "cookie found"
    }, { status: 200 });

}catch (error) {

    return NextResponse.json({
    success: false,
    message: "no token"
    }, { status: 401 });

}
}
