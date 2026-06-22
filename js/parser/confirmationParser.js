import { scoreNearby, statusFor } from './confidence.js';
export function extractConfirmationCodes(text) {
  return [...new Set((text.match(/\b[A-Z0-9]{6,8}\b/g) || []))].filter(v => !/^[A-Z]{2}\d/.test(v)).map(code => { const confidence = scoreNearby(text, code, ['confirmation','booking','reservation','PNR','reference','record locator']); return { type:'note', title:'Possible confirmation code', confirmationCode:code, confidence, status: statusFor(confidence), reason:'Matched 6–8 character code; confidence depends on nearby confirmation words.' }; });
}
