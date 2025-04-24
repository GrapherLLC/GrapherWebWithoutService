export async function sendVerificationCode(phoneNumber: string) {
  const response = await fetch('/api/twilio/send-verification', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ phoneNumber }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to send verification code');
  }

  const data = await response.json();
  return data;
}

export async function sendOTPConfirmation(phoneNumber: string, code: string) {
  const response = await fetch('/api/twilio/confirm-otp', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ phoneNumber, code }),
  });

  console.log('response', response);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to send verification code');
  }

  const data = await response.json();
  return data;
}

