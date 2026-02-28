const fs = require('fs');
try {
    const buf = fs.readFileSync('.env');
    console.log(buf.toString('hex'));
} catch (e) {
    console.error(e.message);
}
