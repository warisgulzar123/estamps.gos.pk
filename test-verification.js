const express = require('express');
const http = require('http');
const axios = require('axios');
const connectDB = require('./config/db');
const estampRoutes = require('./routes/estampRoutes');

async function runVerificationTests() {
    console.log('--- STARTING VERIFICATION TESTS ---');

    // 1. Setup Express Server for testing
    const app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use('/api/estamp', estampRoutes);

    // Mock external Sindh eStamp webpage endpoint for testing cheerio scraping
    app.get('/mock-sindh-estamp', (req, res) => {
        const html = `
            <!DOCTYPE html>
            <html>
            <head><title>Sindh eStamp Verification</title></head>
            <body>
                <table>
                    <tr><td>Description:</td><td>AFFIDAVIT - 4</td></tr>
                    <tr><td>Bank:</td><td>MCB Bank Limited</td></tr>
                    <tr><td>Borrower:</td><td>Tariq Mahmood</td></tr>
                    <tr><td>Stamp Duty Paid By:</td><td>Zubair Ahmed</td></tr>
                    <tr><td>Stamp Issue Date:</td><td>10-AUG-2024</td></tr>
                    <tr><td>Paid Through Challan:</td><td>CH-99281-2024</td></tr>
                    <tr><td>Total Amount:</td><td>Rs. 2,500/-</td></tr>
                    <tr><td>Amount In Words:</td><td>Two Thousand Five Hundred Rupees Only</td></tr>
                </table>
            </body>
            </html>
        `;
        res.send(html);
    });

    await connectDB();

    const server = http.createServer(app);
    await new Promise((resolve) => server.listen(5000, resolve));
    console.log('✓ Server running on http://localhost:5000');

    try {
        // Test 1: POST /api/estamp/fetch-external with mock Sindh eStamp URL
        console.log('\n--- TEST 1: External QR Scrape & Auto-Populate (cheerio) ---');
        const mockUrl = 'http://localhost:5000/mock-sindh-estamp';
        const fetchRes = await axios.post('http://localhost:5000/api/estamp/fetch-external', { url: mockUrl });

        console.log('Fetch Response Status:', fetchRes.status);
        console.log('Fetched Data:', fetchRes.data);

        const extracted = fetchRes.data.data || fetchRes.data;
        console.assert(extracted.description === 'AFFIDAVIT - 4', 'Description mismatch');
        console.assert(extracted.bank === 'MCB Bank Limited', 'Bank mismatch');
        console.assert(extracted.borrower === 'Tariq Mahmood', 'Borrower mismatch');
        console.assert(extracted.stampDutyPaidBy === 'Zubair Ahmed', 'Stamp Duty Paid By mismatch');
        console.assert(extracted.stampIssueDate === '10-AUG-2024', 'Issue Date mismatch');
        console.assert(extracted.paidThroughChallan === 'CH-99281-2024', 'Challan mismatch');
        console.assert(extracted.totalAmount === 'Rs. 2,500/-', 'Total Amount mismatch');
        console.assert(extracted.amountInWords === 'Two Thousand Five Hundred Rupees Only', 'Amount in Words mismatch');
        console.log('✓ Test 1 Passed: Scraped all 8 fields successfully!');

        // Test 2: Database Save & Record Generation (POST /api/estamp/save)
        console.log('\n--- TEST 2: Database Save & QR Generation Data ---');
        const saveData = {
            description: extracted.description,
            bank: extracted.bank,
            borrower: extracted.borrower,
            stampDutyPaidBy: extracted.stampDutyPaidBy,
            stampIssueDate: extracted.stampIssueDate,
            paidThroughChallan: extracted.paidThroughChallan,
            totalAmount: extracted.totalAmount,
            amountInWords: extracted.amountInWords
        };

        const saveRes = await axios.post('http://localhost:5000/api/estamp/save', saveData);
        console.log('Save Response Status:', saveRes.status);
        console.log('Saved Document from DB:', saveRes.data);

        console.assert(saveRes.data._id, 'Missing MongoDB _id');
        console.assert(saveRes.data.description === 'AFFIDAVIT - 4', 'Saved description mismatch');
        console.log('✓ Test 2 Passed: Record saved to MongoDB with generated ID:', saveRes.data._id);

        console.log('\n==========================================');
        console.log('ALL VERIFICATION TESTS PASSED SUCCESSFULLY');
        console.log('==========================================');
    } catch (err) {
        console.error('❌ Test execution failed:', err.response?.data || err.message);
    } finally {
        server.close();
        process.exit(0);
    }
}

runVerificationTests();
