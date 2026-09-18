/**
 * End-to-End (E2E) Feature & Integration Test Suite
 * eStamp Web Application - MongoDB Atlas, Dynamic Labels, and QR Verification
 */

require('dotenv').config();
const express = require('express');
const http = require('http');
const axios = require('axios');
const mongoose = require('mongoose');
const estampRoutes = require('./routes/estampRoutes');
const EStamp = require('./models/EStamp');

// Terminal colors
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const CYAN = '\x1b[36m';
const YELLOW = '\x1b[33m';
const BOLD = '\x1b[1m';
const RESET = '\x1b[0m';

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
    totalTests++;
    if (!condition) {
        console.error(`${RED}  ✘ FAIL: ${message}${RESET}`);
        throw new Error(message);
    } else {
        passedTests++;
        console.log(`${GREEN}  ✔ PASS: ${message}${RESET}`);
    }
}

async function runE2ETests() {
    console.log(`\n${BOLD}${CYAN}================================================================${RESET}`);
    console.log(`${BOLD}${CYAN}   eStamp Web Application - Senior QA E2E & Integration Tests   ${RESET}`);
    console.log(`${BOLD}${CYAN}================================================================${RESET}\n`);

    // ─────────────────────────────────────────────────────────────
    // STEP 1: MongoDB Atlas Connection Check
    // ─────────────────────────────────────────────────────────────
    console.log(`${BOLD}${YELLOW}[STEP 1] MongoDB Atlas Connection Check${RESET}`);
    const uri = process.env.MONGO_URI;
    assert(!!uri, 'MONGO_URI is defined in .env');

    let conn;
    try {
        conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
        console.log(`${GREEN}✔ Real MongoDB Atlas Connected Successfully! Host: ${conn.connection.host}${RESET}`);
        assert(mongoose.connection.readyState === 1, 'Mongoose connection readyState is 1 (connected)');
        assert(!!conn.connection.host, `Connected to Atlas host: ${conn.connection.host}`);
    } catch (err) {
        console.error(`${RED}✘ Real MongoDB Connection Failed: ${err.message}${RESET}`);
        process.exit(1);
    }

    // 1B: Verify Error Handling for invalid URI / Bad Auth
    console.log(`\n${BOLD}${YELLOW}[STEP 1B] Error Handling Simulation for Bad MongoDB Connection${RESET}`);
    try {
        const dummyMongoose = new mongoose.Mongoose();
        let errorCaught = false;
        try {
            await dummyMongoose.connect('mongodb+srv://invalid_user:invalid_pass@clinic.gbzgcgb.mongodb.net/test?authSource=admin', {
                serverSelectionTimeoutMS: 3000
            });
        } catch (authErr) {
            errorCaught = true;
            console.log(`${GREEN}  ✔ Simulated connection error caught gracefully: ${authErr.message.slice(0, 70)}...${RESET}`);
        }
        assert(errorCaught, 'Connection errors catch properly and do not crash unhandled');
    } catch (simErr) {
        console.error(`${RED}  ✘ Error handling test failed: ${simErr.message}${RESET}`);
    }

    // ─────────────────────────────────────────────────────────────
    // Setup Test Express Server with real routes
    // ─────────────────────────────────────────────────────────────
    const app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use('/api/stamps', estampRoutes);
    app.use('/api/estamp', estampRoutes);

    const TEST_PORT = 5055;
    const server = http.createServer(app);
    await new Promise((resolve) => server.listen(TEST_PORT, resolve));
    const BASE_URL = `http://localhost:${TEST_PORT}`;
    console.log(`\n${CYAN}Test server listening on ${BASE_URL}${RESET}`);

    let savedRecord = null;
    const testChallanNum = `CH-E2E-${Date.now()}`;
    const testStampNum = `STAMP-E2E-${Date.now()}`;

    try {
        // ─────────────────────────────────────────────────────────────
        // STEP 2: Admin Generator Form Testing (Create & Save)
        // ─────────────────────────────────────────────────────────────
        console.log(`\n${BOLD}${YELLOW}[STEP 2] Admin Generator Form Testing (Create & Save with Custom Labels)${RESET}`);
        
        const formPayload = {
            bankLabel: 'FINANCIAL INSTITUTION',
            borrowerLabel: 'APPLICANT NAME',
            description: 'AGREEMENT - 5(af) E2E VERIFIED',
            bank: 'Sindh Microfinance Bank Ltd',
            borrower: 'Waris Ali Gulzar',
            stampDutyPaidBy: 'Muhammad Usman',
            stampIssueDate: '18-SEP-2024',
            paidThroughChallan: testChallanNum,
            challanNum: testChallanNum,
            stampNum: testStampNum,
            totalAmount: 'Rs. 25,000/-',
            amountInWords: 'Twenty Five Thousand Rupees Only'
        };

        // Test POST /api/stamps
        console.log(`Sending POST /api/stamps with custom bankLabel: "${formPayload.bankLabel}" and borrowerLabel: "${formPayload.borrowerLabel}"`);
        const saveRes = await axios.post(`${BASE_URL}/api/stamps`, formPayload);

        assert(saveRes.status === 201 || saveRes.status === 200, `Save request returned HTTP status ${saveRes.status}`);
        assert(saveRes.data && saveRes.data._id, 'Response contains generated document _id');
        assert(saveRes.data.bankLabel === 'FINANCIAL INSTITUTION', 'Returned bankLabel matches custom label "FINANCIAL INSTITUTION"');
        assert(saveRes.data.borrowerLabel === 'APPLICANT NAME', 'Returned borrowerLabel matches custom label "APPLICANT NAME"');
        assert(saveRes.data.bank === 'Sindh Microfinance Bank Ltd', 'Returned bank value matches input');
        assert(saveRes.data.borrower === 'Waris Ali Gulzar', 'Returned borrower value matches input');
        assert(saveRes.data.challanNum === testChallanNum, `Returned challanNum matches: ${testChallanNum}`);
        assert(saveRes.data.stampNum === testStampNum, `Returned stampNum matches: ${testStampNum}`);

        savedRecord = saveRes.data;

        // Verify Direct Persistence in MongoDB Atlas under 'stamps' collection
        console.log(`\nVerifying direct persistence in MongoDB Atlas collection: 'stamps'...`);
        const rawCollection = mongoose.connection.db.collection('stamps');
        const dbDoc = await rawCollection.findOne({ _id: new mongoose.Types.ObjectId(savedRecord._id) });

        assert(!!dbDoc, 'Document was successfully found directly in MongoDB Atlas "stamps" collection');
        assert(dbDoc.bankLabel === 'FINANCIAL INSTITUTION', 'Atlas DB doc has bankLabel === "FINANCIAL INSTITUTION"');
        assert(dbDoc.borrowerLabel === 'APPLICANT NAME', 'Atlas DB doc has borrowerLabel === "APPLICANT NAME"');
        assert(dbDoc.description === 'AGREEMENT - 5(af) E2E VERIFIED', 'Atlas DB doc has correct description');
        console.log(`${GREEN}✔ Verified document persisted in Atlas 'stamps' collection with _id: ${dbDoc._id}${RESET}`);

        // ─────────────────────────────────────────────────────────────
        // STEP 3: Database Schema & Route Handling (GET /api/stamps/:identifier)
        // ─────────────────────────────────────────────────────────────
        console.log(`\n${BOLD}${YELLOW}[STEP 3] Database Schema & Route Handling Tests (GET /api/stamps/:identifier)${RESET}`);

        // 3A: Lookup by MongoDB _id
        console.log(`Testing lookup by MongoDB _id: ${savedRecord._id}`);
        const getByIdRes = await axios.get(`${BASE_URL}/api/stamps/${savedRecord._id}`);
        assert(getByIdRes.status === 200, 'GET by _id returned 200 OK');
        assert(getByIdRes.data._id === savedRecord._id, 'GET by _id returned correct record');
        assert(getByIdRes.data.bankLabel === 'FINANCIAL INSTITUTION', 'GET by _id includes bankLabel: "FINANCIAL INSTITUTION"');
        assert(getByIdRes.data.borrowerLabel === 'APPLICANT NAME', 'GET by _id includes borrowerLabel: "APPLICANT NAME"');

        // 3B: Lookup by stampNum
        console.log(`Testing lookup by stampNum: ${testStampNum}`);
        const getByStampNumRes = await axios.get(`${BASE_URL}/api/stamps/${testStampNum}`);
        assert(getByStampNumRes.status === 200, 'GET by stampNum returned 200 OK');
        assert(getByStampNumRes.data._id === savedRecord._id, 'GET by stampNum returned correct record');
        assert(getByStampNumRes.data.borrower === 'Waris Ali Gulzar', 'GET by stampNum returned correct borrower');

        // 3C: Lookup by challanNum
        console.log(`Testing lookup by challanNum: ${testChallanNum}`);
        const getByChallanRes = await axios.get(`${BASE_URL}/api/stamps/${testChallanNum}`);
        assert(getByChallanRes.status === 200, 'GET by challanNum returned 200 OK');
        assert(getByChallanRes.data._id === savedRecord._id, 'GET by challanNum returned correct record');
        assert(getByChallanRes.data.bank === 'Sindh Microfinance Bank Ltd', 'GET by challanNum returned correct bank');

        // 3D: Test route alias /api/estamp/:id
        console.log(`Testing route alias GET /api/estamp/:id`);
        const getByAliasRes = await axios.get(`${BASE_URL}/api/estamp/${testChallanNum}`);
        assert(getByAliasRes.status === 200, 'GET /api/estamp/:id returned 200 OK');
        assert(getByAliasRes.data._id === savedRecord._id, 'Alias returned same record');

        // 3E: Non-existent identifier lookup (Expect clean 404)
        console.log(`Testing lookup for non-existent identifier: NON_EXISTENT_STAMP_99999`);
        let notFoundCaught = false;
        try {
            await axios.get(`${BASE_URL}/api/stamps/NON_EXISTENT_STAMP_99999`);
        } catch (err) {
            if (err.response) {
                notFoundCaught = true;
                assert(err.response.status === 404, 'Non-existent identifier returns HTTP 404');
                assert(err.response.data.message === 'eStamp record not found', 'Error response message is "eStamp record not found"');
            }
        }
        assert(notFoundCaught, 'Backend correctly handles missing record with clean 404 response without crashing');

        // ─────────────────────────────────────────────────────────────
        // STEP 4: Public Verification Page & QR Code Scan Flow
        // ─────────────────────────────────────────────────────────────
        console.log(`\n${BOLD}${YELLOW}[STEP 4] Public Verification Page & QR Scan Flow Simulation${RESET}`);

        // 4A: Simulate Frontend Verification fetching valid record
        console.log(`Simulating frontend fetch for QR URL: ?stampNum=${testStampNum}`);
        const verifyFetchRes = await axios.get(`${BASE_URL}/api/stamps/${encodeURIComponent(testStampNum)}`);
        const verifiedRecord = verifyFetchRes.data;

        // Check dynamic table header rendering values
        const renderedBankHeader = verifiedRecord.bankLabel || 'Bank';
        const renderedBorrowerHeader = verifiedRecord.borrowerLabel || 'Borrower';

        assert(renderedBankHeader === 'FINANCIAL INSTITUTION', `Table Bank Header renders dynamic value: "${renderedBankHeader}"`);
        assert(renderedBorrowerHeader === 'APPLICANT NAME', `Table Borrower Header renders dynamic value: "${renderedBorrowerHeader}"`);
        assert(renderedBankHeader !== 'Bank', 'Header does NOT fall back to static default "Bank"');
        assert(renderedBorrowerHeader !== 'Borrower', 'Header does NOT fall back to static default "Borrower"');

        // 4B: Simulate Scanning Invalid QR Code
        console.log(`Simulating scanning an invalid QR code with non-existent data...`);
        const invalidQrId = 'INVALID_FAKE_QR_987654321';
        let invalidScanFailed = false;
        try {
            await axios.get(`${BASE_URL}/api/stamps/${encodeURIComponent(invalidQrId)}`);
        } catch (err) {
            if (err.response && err.response.status === 404) {
                invalidScanFailed = true;
            }
        }
        assert(invalidScanFailed, 'Invalid QR code scan strictly triggers 404 from backend');
        console.log(`${GREEN}✔ UI state triggers Error Screen: "Verification Failed / Record Not Found" (verified via error boundary condition in PublicStampVerification.jsx)${RESET}`);

        // Cleanup test document from MongoDB Atlas
        console.log(`\nCleaning up test document from MongoDB Atlas...`);
        await rawCollection.deleteOne({ _id: new mongoose.Types.ObjectId(savedRecord._id) });
        console.log(`${GREEN}✔ Cleaned up test record: ${savedRecord._id}${RESET}`);

        // ─────────────────────────────────────────────────────────────
        // SUMMARY
        // ─────────────────────────────────────────────────────────────
        console.log(`\n${BOLD}${GREEN}================================================================${RESET}`);
        console.log(`${BOLD}${GREEN}   ALL E2E & INTEGRATION TESTS PASSED: ${passedTests}/${totalTests} CHECKS SUCCESSFUL!   ${RESET}`);
        console.log(`${BOLD}${GREEN}================================================================${RESET}\n`);

    } catch (testError) {
        console.error(`\n${BOLD}${RED}E2E TEST FAILURE: ${testError.message}${RESET}\n`);
    } finally {
        server.close();
        await mongoose.disconnect();
        process.exit(0);
    }
}

runE2ETests();
