import { Twilio } from "twilio";

const twilioClient = new Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const v2Service = twilioClient.verify.v2.services(process.env.TWILIO_PHONE_VERIFICATION_SID as string)

export { twilioClient, v2Service };