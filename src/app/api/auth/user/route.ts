import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
try{

    const refreshToken =request.cookies.get("refreshToken")?.value;
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
