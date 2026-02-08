
import { execSync } from 'child_process';

const url = 'https://b3h2.scene7.com/is/image/BedBathandBeyond/32185542845607p';
try {
    const cmd = `curl -I "${url}"`;
    const output = execSync(cmd).toString();
    console.log(output);
} catch (e) {
    console.log(e.message);
}
