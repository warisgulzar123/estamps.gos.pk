const mongoose = require('mongoose');

const eStampSchema = new mongoose.Schema(
  {
    stampNum: {
      type: String,
      default: '',
      trim: true
    },
    challanNum: {
      type: String,
      default: '',
      trim: true
    },
    description: {
      type: String,
      default: '',
      trim: true
    },
    bank: {
      type: String,
      default: '',
      trim: true
    },
    bankLabel: {
      type: String,
      default: 'Bank',
      trim: true
    },
    borrower: {
      type: String,
      default: '',
      trim: true
    },
    borrowerLabel: {
      type: String,
      default: 'Borrower',
      trim: true
    },
    stampDutyPaidBy: {
      type: String,
      default: '',
      trim: true
    },
    stampIssueDate: {
      type: String,
      default: '',
      trim: true
    },
    paidThroughChallan: {
      type: String,
      default: '',
      trim: true
    },
    totalAmount: {
      type: String,
      default: '',
      trim: true
    },
    amountInWords: {
      type: String,
      default: '',
      trim: true
    }
  },
  {
    timestamps: true,
    collection: 'stamps'
  }
);

// Register model under EStamp if not already registered
const EStamp = mongoose.models.EStamp || mongoose.model('EStamp', eStampSchema);

module.exports = EStamp;
