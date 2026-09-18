const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const axios = require('axios');
const cheerio = require('cheerio');
const EStamp = require('../models/EStamp');

// Helper function to extract table values by label
const extractFieldValue = ($, labelRegexes) => {
    let foundValue = '';

    $('td, th, span, label, p, div').each((i, el) => {
        if (foundValue) return;
        if ($(el).children('td, th, tr, div, table').length > 0) return;

        const text = $(el).text().trim().replace(/:$/, '');
        if (!text) return;

        for (const regex of labelRegexes) {
            if (regex.test(text)) {
                // Look for next sibling table cell
                const nextCell = $(el).next('td, th, span, div, p').text().trim();
                if (nextCell && nextCell.toLowerCase() !== text.toLowerCase()) {
                    foundValue = nextCell;
                    return;
                }
                // Look for sibling element in parent container
                const parentChildren = $(el).parent().children();
                const myIndex = $(el).index();
                if (parentChildren.length > myIndex + 1) {
                    const siblingVal = parentChildren.eq(myIndex + 1).text().trim();
                    if (siblingVal && siblingVal.toLowerCase() !== text.toLowerCase()) {
                        foundValue = siblingVal;
                        return;
                    }
                }
            }
        }
    });

    return foundValue;
};

// @route   POST /api/estamp/fetch-external
// @desc    Fetch and parse external eStamp verification HTML page with fallback
router.post('/fetch-external', async (req, res) => {
    let url = '';
    let parsedFromUrlParams = {};

    try {
        url = req.body?.url || '';
        if (!url || typeof url !== 'string') {
            return res.status(200).json({
                success: false,
                message: 'No valid URL provided',
                description: '',
                bank: '',
                borrower: '',
                stampDutyPaidBy: '',
                stampIssueDate: '',
                paidThroughChallan: '',
                totalAmount: '',
                amountInWords: ''
            });
        }

        // Try extracting query parameters from URL
        try {
            const urlObj = new URL(url);
            const params = urlObj.searchParams;
            parsedFromUrlParams = {
                description: params.get('description') || params.get('desc') || '',
                bank: params.get('bank') || '',
                borrower: params.get('borrower') || '',
                stampDutyPaidBy: params.get('stampDutyPaidBy') || params.get('paidBy') || '',
                stampIssueDate: params.get('stampIssueDate') || params.get('date') || '',
                paidThroughChallan: params.get('paidThroughChallan') || params.get('challan') || params.get('challanNo') || '',
                totalAmount: params.get('totalAmount') || params.get('amount') || '',
                amountInWords: params.get('amountInWords') || params.get('words') || ''
            };
        } catch (e) {
            // Ignore URL structure parse errors
        }

        let htmlContent = '';
        try {
            const response = await axios.get(url, {
                timeout: 8000,
                headers: {
                    'User-Agent':
                        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
                }
            });
            htmlContent = response.data || '';
        } catch (fetchError) {
            console.warn('External site HTTP fetch failed, using parameter fallback:', fetchError.message);
            const fallbackResult = {
                description: parsedFromUrlParams.description || url,
                bank: parsedFromUrlParams.bank || '',
                borrower: parsedFromUrlParams.borrower || '',
                stampDutyPaidBy: parsedFromUrlParams.stampDutyPaidBy || '',
                stampIssueDate: parsedFromUrlParams.stampIssueDate || '',
                paidThroughChallan: parsedFromUrlParams.paidThroughChallan || '',
                totalAmount: parsedFromUrlParams.totalAmount || '',
                amountInWords: parsedFromUrlParams.amountInWords || ''
            };

            return res.status(200).json({
                success: true,
                data: fallbackResult,
                ...fallbackResult
            });
        }

        // Scrape Web Page Content using cheerio
        const $ = cheerio.load(htmlContent);

        const extractedData = {
            description:
                extractFieldValue($, [/description/i, /document type/i, /category/i]) ||
                parsedFromUrlParams.description ||
                '',
            bank:
                extractFieldValue($, [/bank/i, /financial institution/i]) ||
                parsedFromUrlParams.bank ||
                '',
            borrower:
                extractFieldValue($, [/borrower/i, /first party/i, /applicant/i]) ||
                parsedFromUrlParams.borrower ||
                '',
            stampDutyPaidBy:
                extractFieldValue($, [/stamp duty paid by/i, /paid by/i, /second party/i]) ||
                parsedFromUrlParams.stampDutyPaidBy ||
                '',
            stampIssueDate:
                extractFieldValue($, [/stamp issue date/i, /issue date/i, /date of issue/i]) ||
                parsedFromUrlParams.stampIssueDate ||
                '',
            paidThroughChallan:
                extractFieldValue($, [/paid through challan/i, /challan no/i, /challan number/i, /challan/i]) ||
                parsedFromUrlParams.paidThroughChallan ||
                '',
            totalAmount:
                extractFieldValue($, [/total amount/i, /stamp duty amount/i, /amount/i]) ||
                parsedFromUrlParams.totalAmount ||
                '',
            amountInWords:
                extractFieldValue($, [/amount in words/i, /in words/i]) ||
                parsedFromUrlParams.amountInWords ||
                ''
        };

        if (!extractedData.description && !extractedData.paidThroughChallan) {
            extractedData.description = url;
        }

        // Return JSON that maps keys directly for EStampPortal state
        return res.status(200).json({
            success: true,
            data: extractedData,
            ...extractedData
        });
    } catch (err) {
        console.error('Fetch external route safe catch:', err.message);
        const safeFallback = {
            description: parsedFromUrlParams.description || url || '',
            bank: parsedFromUrlParams.bank || '',
            borrower: parsedFromUrlParams.borrower || '',
            stampDutyPaidBy: parsedFromUrlParams.stampDutyPaidBy || '',
            stampIssueDate: parsedFromUrlParams.stampIssueDate || '',
            paidThroughChallan: parsedFromUrlParams.paidThroughChallan || '',
            totalAmount: parsedFromUrlParams.totalAmount || '',
            amountInWords: parsedFromUrlParams.amountInWords || ''
        };

        return res.status(200).json({
            success: true,
            data: safeFallback,
            ...safeFallback
        });
    }
});

// Save handler for both POST /save and POST /
const saveHandler = async (req, res) => {
    try {
        const {
            _id,
            stampNum,
            challanNum,
            description,
            bank,
            bankLabel,
            borrower,
            borrowerLabel,
            stampDutyPaidBy,
            stampIssueDate,
            paidThroughChallan,
            totalAmount,
            amountInWords
        } = req.body;

        const effectiveChallan = challanNum || paidThroughChallan || '';

        const stampData = {
            stampNum:           stampNum           || (_id && mongoose.Types.ObjectId.isValid(_id) ? String(_id) : '') || '',
            challanNum:         effectiveChallan,
            description:        description        || '',
            bank:               bank               || '',
            bankLabel:          bankLabel          || 'Bank',
            borrower:           borrower           || '',
            borrowerLabel:      borrowerLabel      || 'Borrower',
            stampDutyPaidBy:    stampDutyPaidBy    || '',
            stampIssueDate:     stampIssueDate     || '',
            paidThroughChallan: effectiveChallan,
            totalAmount:        totalAmount        || '',
            amountInWords:      amountInWords      || '',
        };

        const isValidObjectId = _id && mongoose.Types.ObjectId.isValid(_id);

        // Update existing document if a valid _id was provided
        if (isValidObjectId) {
            const updated = await EStamp.findByIdAndUpdate(_id, stampData, {
                new: true,
                runValidators: true,
            });
            if (updated) {
                return res.status(200).json(updated);
            }
        }

        // No matching document — create a new one
        const newStamp = new EStamp(stampData);
        if (!newStamp.stampNum) {
            newStamp.stampNum = newStamp._id.toString();
        }
        const saved = await newStamp.save();
        return res.status(201).json(saved);

    } catch (error) {
        console.error('Error saving eStamp:', error);
        return res.status(400).json({ message: error.message || 'Failed to save eStamp document' });
    }
};

// @route   POST /api/estamp/save or POST /api/stamps
router.post('/save', saveHandler);
router.post('/', saveHandler);

// Lookup handler by _id, stampNum, OR challanNum
const getByIdentifier = async (req, res) => {
    try {
        const identifier = (req.params.identifier || req.params.id)?.trim();

        if (!identifier) {
            return res.status(400).json({ message: 'No identifier provided' });
        }

        // Build $or conditions to search flexibly by _id, stampNum, OR challanNum / paidThroughChallan
        const orConditions = [
            { paidThroughChallan: identifier },
            { challanNum: identifier },
            { stampNum: identifier }
        ];

        if (mongoose.Types.ObjectId.isValid(identifier)) {
            orConditions.unshift({ _id: identifier });
        }

        const stamp = await EStamp.findOne({ $or: orConditions });

        if (!stamp) {
            return res.status(404).json({ message: 'eStamp record not found' });
        }
        return res.json(stamp);

    } catch (error) {
        console.error('GET /:identifier error:', error.message);
        return res.status(500).json({ message: error.message || 'Server error' });
    }
};

// @route   GET /api/stamps/:identifier or GET /api/estamp/:id
router.get('/:identifier', getByIdentifier);

// @route   GET /api/estamp or GET /api/stamps
// @desc    Get all EStamp documents from Atlas (newest first)
router.get('/', async (req, res) => {
    try {
        const stamps = await EStamp.find().sort({ createdAt: -1 });
        return res.json(stamps);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

module.exports = router;


