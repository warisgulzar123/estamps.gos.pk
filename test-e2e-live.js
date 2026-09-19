const https = require('https');
const http = require('http');

const samplePayload = {
    description: "POWER OF ATTORNEY - 48(c)",
    bank: "National Bank of Pakistan",
    bankLabel: "Financial Institution",
    borrower: "Syed Ali Raza",
    borrowerLabel: "Applicant Name",
    stampDutyPaidBy: "Muhammad Usman",
    stampIssueDate: "19-SEP-2026",
    paidThroughChallan: "CH-2026-992144",
    totalAmount: "Rs. 10,000/-",
    amountInWords: "Ten Thousand Rupees Only"
};

const sendRequest = (options, data = null) => {
    return new Promise((resolve) => {
        const client = options.protocol === 'http:' ? http : https;
        const req = client.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                let json = null;
                try { json = JSON.parse(body); } catch(e) {}
                resolve({
                    statusCode: res.statusCode,
                    headers: res.headers,
                    rawBody: body,
                    json
                });
            });
        });

        req.on('error', (err) => {
            resolve({ error: err.message });
        });

        req.setTimeout(10000, () => {
            req.destroy();
            resolve({ error: 'Timeout after 10000ms' });
        });

        if (data) {
            req.write(typeof data === 'string' ? data : JSON.stringify(data));
        }
        req.end();
    });
};

const runLiveTests = async () => {
    console.log('=====================================================');
    console.log('  RUNNING LIVE E2E HTTP TESTS ON VERCEL');
    console.log('  Target: https://estampsgospk.vercel.app');
    console.log('=====================================================\n');

    // Test 1: Frontend Root
    console.log('1. Testing Frontend Route GET / ...');
    const res1 = await sendRequest({
        protocol: 'https:',
        hostname: 'estampsgospk.vercel.app',
        path: '/',
        method: 'GET'
    });
    console.log(`   Status: ${res1.statusCode} | Has HTML: ${res1.rawBody?.includes('<!doctype html>')}\n`);

    // Test 2: POST /api/estamp/save
    console.log('2. Testing POST /api/estamp/save ...');
    const postData = JSON.stringify(samplePayload);
    const res2 = await sendRequest({
        protocol: 'https:',
        hostname: 'estampsgospk.vercel.app',
        path: '/api/estamp/save',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
        }
    }, postData);
    console.log(`   Status: ${res2.statusCode}`);
    console.log(`   Response: ${res2.json ? JSON.stringify(res2.json) : res2.rawBody?.substring(0, 150)}\n`);

    // Test 3: POST /api/estamp/fetch-external
    console.log('3. Testing POST /api/estamp/fetch-external ...');
    const fetchPayload = JSON.stringify({ url: 'https://es.gos.pk/eStampCitizenPortal/GeneratePDF/StampVerification?stampNum=65AFFECD05039DC0' });
    const res3 = await sendRequest({
        protocol: 'https:',
        hostname: 'estampsgospk.vercel.app',
        path: '/api/estamp/fetch-external',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(fetchPayload)
        }
    }, fetchPayload);
    console.log(`   Status: ${res3.statusCode}`);
    console.log(`   Response: ${res3.json ? JSON.stringify(res3.json) : res3.rawBody?.substring(0, 150)}\n`);

    // Test 4: Verification Route
    console.log('4. Testing SPA Verification Route GET /eStampCitizenPortal/GeneratePDF/StampVerification ...');
    const res4 = await sendRequest({
        protocol: 'https:',
        hostname: 'estampsgospk.vercel.app',
        path: '/eStampCitizenPortal/GeneratePDF/StampVerification?id=test12345',
        method: 'GET'
    });
    console.log(`   Status: ${res4.statusCode} | Rewritten to SPA: ${res4.rawBody?.includes('<!doctype html>')}\n`);

    console.log('=====================================================');
    console.log('  TEST RUN COMPLETE');
    console.log('=====================================================');
};

runLiveTests();
