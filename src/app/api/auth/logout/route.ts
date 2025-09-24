import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const cookiesStore = await cookies();

    cookiesStore.set("accessToken", "", { path: "/", maxAge: 0 });
    cookiesStore.set("refreshToken", "", { path: "/", maxAge: 0 });

    return NextResponse.json({
      success: true,
      message: "Logged out successfully",
    }, { status: 200 });

  } catch (error) {
    console.log("Error during logout:", error);
    return NextResponse.json({
      success: false,
      message: "Internal Server Error"
    }, { status: 500 });
  }
}
