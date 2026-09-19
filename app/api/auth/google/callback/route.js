import { promises as fs } from "fs";
import path from "path";
import { google } from "googleapis";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");

    if (!code) {
      return NextResponse.json(
        { error: "Authorization code not found." },
        { status: 400 }
      );
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens.refresh_token) {
      return NextResponse.json(
        {
          error:
            "No refresh token received. Please revoke the previous Google connection and try again.",
        },
        { status: 400 }
      );
    }

    // Save the Google refresh token on the server
    const dataDir = path.join(process.cwd(), ".data");
    await fs.mkdir(dataDir, { recursive: true });

    const tokenFile = path.join(dataDir, "google-refresh-token.json");

    await fs.writeFile(
      tokenFile,
      JSON.stringify(
        {
          refresh_token: tokens.refresh_token,
        },
        null,
        2
      ),
      "utf8"
    );

    return NextResponse.json({
      success: true,
      message: "Google Ads account connected successfully.",
    });
  } catch (error) {
    console.error("Google OAuth error:", error);

    return NextResponse.json(
      {
        error: "Google authorization failed.",
        details: error.message,
      },
      { status: 500 }
    );
  }
}