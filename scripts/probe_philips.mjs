
import https from 'https';

const url = 'https://images.philips.com/is/image/philipsconsumer/GC360_30-IMS-en_IN?wid=1000';

https.get(url, (res) => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Content-Length: ${res.headers['content-length']}`);
});
