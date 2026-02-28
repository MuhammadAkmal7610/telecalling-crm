const crypto = require('crypto');

const anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqcGtvemZ5ZWJwaXdsYnB4d2t3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5MjkwNTUsImV4cCI6MjA4NzUwNTA1NX0.O3uyYwgS2fQrV1zsdyM3R_am4Lx9uAp1Wb2ykww-5MA";
const secret = "+8UHwmt+a4xOsdt66gPos0Lkd4Dj1PSYU0ZkMd2S1DWKLp8VQkWuEjEC0y+lzmNDGRdkmtLVXVCvqxLnmj9N+g==";

const [header, payload, signature] = anonKey.split('.');

const sign = crypto.createHmac('sha256', secret)
    .update(`${header}.${payload}`)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

console.log('Provided signature:', signature);
console.log('Calculated signature (raw):', sign);

const signBase64Decoded = crypto.createHmac('sha256', Buffer.from(secret, 'base64'))
    .update(`${header}.${payload}`)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

console.log('Calculated signature (base64 decoded secret):', signBase64Decoded);

if (signature === sign) {
    console.log('MATCH: Secret should be used as as plain string.');
} else if (signature === signBase64Decoded) {
    console.log('MATCH: Secret must be decoded from Base64.');
} else {
    console.log('NO MATCH: The secret provided does not match the anon key signature.');
}
