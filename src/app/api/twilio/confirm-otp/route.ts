import { NextResponse } from 'next/server'
import { v2Service } from '@/lib/twilio'

export async function POST(request: Request) {
  try {
    // Validate environment variables
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_VERIFICATION_SID) {
      console.error('Missing required Twilio environment variables');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    const { phoneNumber, code } = await request.json()

    console.log('phoneNumber', phoneNumber);
    console.log('code', code);
    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      )
    }

    // Validate phone number format (US numbers only for now)
    if (!phoneNumber.match(/^\+?[1-9]\d{1,14}$/)) {
      return NextResponse.json(
        { error: 'Invalid phone number format' },
        { status: 400 }
      )
    }

    if (!code) {
      return NextResponse.json(
        { error: 'Code is required' },
        { status: 400 }
      )
    }

    if (code.length !== 6) {
      return NextResponse.json(
        { error: 'Code must be 6 digits' },
        { status: 400 }
      )
    }

    const data = await v2Service.verificationChecks.create({
      code: code,
      to: phoneNumber,
    })

    return NextResponse.json({ success: true, data: data }, { status: 200 })
  } catch (error) {
    console.error('Error confirm OTP:', error)
    // Check if it's a Twilio error with more details
    const twilioError = error as { code?: string; message?: string }
    return NextResponse.json(
      {
        error: twilioError.message || 'Failed to confirm OTP',
        code: twilioError.code
      },
      { status: 500 }
    )
  }
} 