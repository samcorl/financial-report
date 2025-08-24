#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Global category definitions (extracted from HTML)
const CATEGORIES = [
    'Transfers',
    '3KM',
    'Auto',
    'Bank Fees',
    'Cash',
    'Checks',
    'Child Care and Camps',
    'Deposits',
    'Donations',
    'Education',
    'Entertainment',
    'Fines and Tickets',
    'Girl Scouts',
    'Gifts',
    'Groceries',
    'Hardware',
    'Health and Beauty',
    'Health Supplements',
    'Household',
    'Insurance',
    'Interest Paid',
    'IRS',
    'Medical and Dental Expenses',
    'Mortgage',
    'Office Technology',
    'Office Supplies, Memberships & Subscriptions',
    'Parking',
    'Pets',
    'Postage',
    'Restaurants',
    'Solar Lease',
    'Storage',
    'Subscriptions',
    'Tax Return Preparation',
    'Travel',
    'Unclassified',
    'Utilities',
    'Web Hosting',
    'Wine, Beer, Spirits'
];

// Business deductible categories
const BUSINESS_CATEGORIES = [
    'Office Technology',
    'Office Supplies, Memberships & Subscriptions',
    'Web Hosting',
    '3KM'
];

// Keyword mappings for categorization
const CATEGORY_KEYWORDS = {
    '3KM': ['3km'],
    'Auto': ['chevron', 'shell', 'mobil', 'gas station', 'auto', 'car wash', 'oil change', 'tire', 'mechanic', 'valero', 'exxon', 'bp ', 'citgo', 'arco', 'fastrak', 'bridge toll'],
    'Bank Fees': ['overdraft', 'annual membership fee', 'atm fee', 'maintenance fee', 'wire fee', 'foreign transaction fee'],
    'Cash': ['cash', 'atm withdrawal'],
    'Checks': ['check'],
    'Child Care and Camps': ['child care', 'daycare', 'camp', 'babysit'],
    'Deposits': ['deposit', 'payroll', 'salary', 'wages', 'income', 'direct deposit', 'tripleseat'],
    'Donations': ['donation', 'charity', 'church', 'goodwill'],
    'Education': ['school', 'university', 'college', 'tuition', 'education', 'srjc'],
    'Entertainment': ['movie', 'theater', 'concert', 'entertainment', 'netflix', 'hulu', 'spotify', 'paramount'],
    'Fines and Tickets': ['fine', 'ticket', 'violation', 'penalty'],
    'Girl Scouts': ['girl scout'],
    'Gifts': ['gift'],
    'Groceries': ['safeway', 'grocery', 'whole foods', 'trader joe', 'costco', 'walmart', 'target', 'oliver', 'wholefds'],
    'Hardware': ['home depot', 'lowes', 'hardware', 'ace hardware', 'mission ace'],
    'Health and Beauty': ['cvs', 'walgreens', 'pharmacy', 'cosmetic', 'salon', 'spa', 'beauty'],
    'Health Supplements': ['vitamin', 'supplement', 'gnc', 'health store', 'ryze'],
    'Household': ['household', 'cleaning', 'laundry', 'detergent'],
    'Insurance': ['insurance', 'protective life'],
    'Interest Paid': ['interest', 'finance charge', 'purchase interest charge', 'interest charged'],
    'IRS': ['irs', 'tax payment', 'internal revenue'],
    'Medical and Dental Expenses': ['doctor', 'hospital', 'medical', 'dental', 'dentist', 'physician'],
    'Mortgage': ['mortgage', 'us bank home mtg'],
    'Office Technology': ['microsoft', 'adobe', 'zoom', 'google', 'apple.com', 'linkedin'],
    'Office Supplies, Memberships & Subscriptions': ['office', 'supplies', 'membership', 'subscription', 'staples'],
    'Parking': ['parking', 'meter', 'garage'],
    'Pets': ['pet', 'vet', 'veterinary', 'petco', 'pet food'],
    'Postage': ['usps', 'fedex', 'ups', 'postage', 'shipping'],
    'Restaurants': ['restaurant', 'cafe', 'bistro', 'grill', 'pizza', 'burger', 'taco', 'chinese', 'italian', 'sushi', 'starbucks', 'dunkin', 'lepe', 'taqueria', 'ozzies', 'everest indian', 'tatte bakery', 'kelly', 'salt and stone', 'mombos pizza'],
    'Solar Lease': ['solar', 'spruce power'],
    'Storage': ['storage', 'storagepro'],
    'Subscriptions': ['subscription', 'monthly', 'annual'],
    'Tax Return Preparation': ['tax prep', 'h&r block', 'turbotax'],
    'Transfers': ['transfer', 'payment thank you', 'ach electronic credit', 'ach deposit', 'ach withdrawal', 'redwood cu ach', 'citibank', 'mobile deposit', 'deposit transfer', 'withdrawal transfer', 'home banking transfer', 'checking plus', 'transfer from checking plus', 'share'],
    'Travel': ['hotel', 'airline', 'flight', 'rental car', 'uber', 'lyft', 'taxi', 'hilton', 'marriott', 'travel', 'logan expr', 'commuter rail', 'mbta'],
    'Utilities': ['electric', 'gas', 'water', 'phone', 'internet', 'cable', 'comcast', 'pgande', 'att'],
    'Web Hosting': ['godaddy', 'aws', 'amazon web services', 'google cloud', 'hosting'],
    'Wine, Beer, Spirits': ['wine', 'beer', 'spirits', 'liquor', 'alcohol', 'totalwine']
};

class FinancialReporter {
    constructor() {
        this.allTransactions = [];
        this.processingErrors = [];
    }

    // Header detection function
    detectHeaders(headers) {
        const mapping = {
            dateColumn: -1,
            descriptionColumn: -1
        };

        // Normalize headers to lowercase for comparison
        const normalizedHeaders = headers.map(h => h.toLowerCase().trim());

        // Find date column
        for (let i = 0; i < normalizedHeaders.length; i++) {
            const header = normalizedHeaders[i];
            if (header.includes('date') || header === 'date') {
                mapping.dateColumn = i;
                break;
            }
        }

        // Find description column
        for (let i = 0; i < normalizedHeaders.length; i++) {
            const header = normalizedHeaders[i];
            if (header.includes('description') || header.includes('merchant') || header === 'description') {
                mapping.descriptionColumn = i;
                break;
            }
        }

        // Find debit/credit or amount columns
        for (let i = 0; i < normalizedHeaders.length; i++) {
            const header = normalizedHeaders[i];
            if (header === 'debit' || header === 'withdrawal') {
                mapping.debitColumn = i;
            } else if (header === 'credit' || header === 'deposit') {
                mapping.creditColumn = i;
            } else if (header === 'amount') {
                mapping.amountColumn = i;
            }
        }

        return mapping;
    }

    // Proper CSV row parsing to handle quoted fields with commas
    parseCSVRow(line) {
        const result = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        
        // Add the last field
        result.push(current.trim());
        
        // Remove quotes from fields
        return result.map(field => field.replace(/^"(.*)"$/, '$1'));
    }

    // Parse date function
    parseDate(dateString) {
        // Handle common date formats: MM/DD/YY, MM/DD/YYYY
        const cleaned = dateString.trim();
        const parts = cleaned.split('/');
        if (parts.length === 3) {
            let month = parseInt(parts[0]);
            let day = parseInt(parts[1]);
            let year = parseInt(parts[2]);
            // Handle 2-digit years
            if (year < 100) {
                year += year < 50 ? 2000 : 1900;
            }
            return new Date(year, month - 1, day);
        }
        // Fallback to Date constructor
        return new Date(cleaned);
    }

    // Categorization function with debug logging
    categorizeTransaction(description) {
        const lowerDesc = description.toLowerCase();
        
        // Debug for specific transactions we're troubleshooting
        if (lowerDesc.includes('transfer from checking plus')) {
            console.log(`🔍 CATEGORIZING "Transfer From Checking Plus": "${description}"`);
            console.log(`  - Searching through categories...`);
        }
        
        if (lowerDesc.includes('tripleseat')) {
            console.log(`💼 CATEGORIZING Tripleseat transaction: "${description}"`);
            console.log(`  - Searching through categories...`);
        }
        
        // Process categories in order - first match wins
        for (const category of CATEGORIES) {
            const keywords = CATEGORY_KEYWORDS[category] || [];
            for (const keyword of keywords) {
                if (lowerDesc.includes(keyword.toLowerCase())) {
                    if (lowerDesc.includes('transfer from checking plus')) {
                        console.log(`  ✅ MATCHED keyword "${keyword}" in category "${category}"`);
                    }
                    if (lowerDesc.includes('tripleseat')) {
                        console.log(`  ✅ MATCHED keyword "${keyword}" in category "${category}"`);
                    }
                    return category;
                }
            }
        }
        
        if (lowerDesc.includes('transfer from checking plus')) {
            console.log(`  ❌ NO MATCH FOUND - returning Unclassified`);
        }
        
        if (lowerDesc.includes('tripleseat')) {
            console.log(`  ❌ NO MATCH FOUND - returning Unclassified`);
        }
        
        return 'Unclassified';
    }

    // Parse CSV function (Node.js adapted)
    parseCSVData(csvContent, filename) {
        const lines = csvContent.trim().split('\n');
        const result = {
            transactions: [],
            errors: [],
            skippedRows: 0,
            totalRows: lines.length
        };

        if (lines.length < 2) {
            result.errors.push(`File ${filename}: No data rows found`);
            return result;
        }

        // Parse headers  
        const headers = this.parseCSVRow(lines[0]);
        console.log(`📋 CSV HEADERS for ${filename}:`, headers);
        
        const mapping = this.detectHeaders(headers);
        console.log(`🗂️ HEADER MAPPING for ${filename}:`, mapping);

        // Validate required columns
        if (mapping.dateColumn === -1 || mapping.descriptionColumn === -1) {
            result.errors.push(`File ${filename}: Could not detect required Date and Description columns`);
            return result;
        }

        if (!mapping.debitColumn && !mapping.creditColumn && !mapping.amountColumn) {
            result.errors.push(`File ${filename}: Could not detect amount columns (Debit/Credit or Amount)`);
            return result;
        }

        // Process data rows
        for (let i = 1; i < lines.length; i++) {
            try {
                const row = this.parseCSVRow(lines[i]);
                if (row.length < headers.length) {
                    console.log(`⚠️ SKIPPED ROW ${i + 1}: Too few columns (${row.length} vs ${headers.length})`);
                    result.skippedRows++;
                    continue;
                }

                const date = this.parseDate(row[mapping.dateColumn]);
                const description = row[mapping.descriptionColumn];
                
                if (isNaN(date.getTime()) || !description) {
                    result.skippedRows++;
                    continue;
                }

                let debit = 0;
                let credit = 0;

                // Handle different column formats
                if (mapping.debitColumn !== undefined && mapping.creditColumn !== undefined) {
                    // Separate debit/credit columns
                    const debitStr = row[mapping.debitColumn] || '0';
                    const creditStr = row[mapping.creditColumn] || '0';
                    debit = Math.abs(parseFloat(debitStr.replace(/[^-\d.]/g, '')) || 0);
                    credit = Math.abs(parseFloat(creditStr.replace(/[^-\d.]/g, '')) || 0);
                } else if (mapping.amountColumn !== undefined) {
                    // Single amount column with +/- values
                    const amountStr = row[mapping.amountColumn];
                    const cleanAmount = amountStr.replace(/[^-\d.]/g, '');
                    const amount = parseFloat(cleanAmount) || 0;
                    
                    if (amount < 0) {
                        debit = Math.abs(amount);
                    } else {
                        credit = amount;
                    }
                }

                const category = this.categorizeTransaction(description);
                const isLargeExpense = debit > 200;

                const transaction = {
                    date,
                    description,
                    debit,
                    credit,
                    category,
                    isLargeExpense
                };

                result.transactions.push(transaction);
            } catch (error) {
                result.errors.push(`File ${filename}, row ${i + 1}: ${error}`);
                result.skippedRows++;
            }
        }

        return result;
    }

    // Calculate totals function
    calculateTotals(transactions) {
        const totals = {};
        for (const transaction of transactions) {
            const category = transaction.category;
            if (!totals[category]) {
                totals[category] = {
                    debitTotal: 0,
                    creditTotal: 0,
                    netAmount: 0,
                    transactionCount: 0
                };
            }
            totals[category].debitTotal += transaction.debit;
            totals[category].creditTotal += transaction.credit;
            totals[category].netAmount += transaction.credit - transaction.debit;
            totals[category].transactionCount++;
        }
        return totals;
    }

    // Generate income breakdown with debug logging
    generateIncomeBreakdown(transactions) {
        console.log('\n=== INCOME BREAKDOWN ANALYSIS ===');
        
        const incomeTransactions = transactions.filter(t => t.credit > 0 && t.category !== 'Transfers');
        console.log(`💰 Total income transactions found: ${incomeTransactions.length}`);
        
        // Group income by source type - with debug logging
        const tripleseatTransactions = incomeTransactions.filter(t => 
            t.description.toLowerCase().includes('tripleseat')
        );
        
        console.log(`\n💼 TRIPLESEAT TRANSACTIONS: ${tripleseatTransactions.length} found`);
        tripleseatTransactions.forEach(t => {
            console.log(`  - ${t.date.toLocaleDateString()} | $${t.credit.toFixed(2)} | "${t.description}" | Category: ${t.category}`);
        });
        
        const consultingTransactions = incomeTransactions.filter(t => {
            const desc = t.description.toLowerCase();
            const isCheckDeposit = desc.includes('deposit by check') || 
                                  desc.includes('check received') ||
                                  desc.includes('check hold release');
            const isLargeMobileDeposit = desc.includes('mobile deposit') && t.credit > 5000;
            const isLargeDeposit = desc.includes('deposit') && t.credit > 5000 && !desc.includes('tripleseat');
            
            return isCheckDeposit || isLargeMobileDeposit || isLargeDeposit;
        });
        
        console.log(`\n💼 CONSULTING TRANSACTIONS: ${consultingTransactions.length} found`);
        consultingTransactions.forEach(t => {
            console.log(`  - ${t.date.toLocaleDateString()} | $${t.credit.toFixed(2)} | "${t.description}" | Category: ${t.category}`);
        });
        
        const otherIncomeTransactions = incomeTransactions.filter(t => 
            !tripleseatTransactions.includes(t) &&
            !consultingTransactions.includes(t)
        );
        
        console.log(`\n💰 OTHER INCOME TRANSACTIONS: ${otherIncomeTransactions.length} found`);
        otherIncomeTransactions.forEach(t => {
            console.log(`  - ${t.date.toLocaleDateString()} | $${t.credit.toFixed(2)} | "${t.description}" | Category: ${t.category}`);
        });
        
        const totalTripleseat = tripleseatTransactions.reduce((sum, t) => sum + t.credit, 0);
        const totalConsulting = consultingTransactions.reduce((sum, t) => sum + t.credit, 0);
        const totalOtherIncome = otherIncomeTransactions.reduce((sum, t) => sum + t.credit, 0);
        
        console.log(`\n💰 INCOME TOTALS:`);
        console.log(`  - Tripleseat: $${totalTripleseat.toFixed(2)}`);
        console.log(`  - Consulting: $${totalConsulting.toFixed(2)}`);
        console.log(`  - Other: $${totalOtherIncome.toFixed(2)}`);
        console.log(`  - Total: $${(totalTripleseat + totalConsulting + totalOtherIncome).toFixed(2)}`);
        
        return {
            tripleseat: { transactions: tripleseatTransactions, total: totalTripleseat },
            consulting: { transactions: consultingTransactions, total: totalConsulting },
            other: { transactions: otherIncomeTransactions, total: totalOtherIncome }
        };
    }

    // Process files (Node.js version using fs.readFileSync)
    processFiles(filePaths) {
        this.allTransactions = [];
        this.processingErrors = [];

        for (const filePath of filePaths) {
            try {
                console.log(`\n📁 Processing file: ${path.basename(filePath)}`);
                const content = fs.readFileSync(filePath, 'utf8');
                
                if (!content.trim()) {
                    throw new Error('File appears to be empty');
                }
                
                const result = this.parseCSVData(content, path.basename(filePath));
                console.log(`✅ File ${path.basename(filePath)}: ${result.transactions.length} transactions, ${result.skippedRows} skipped, ${result.errors.length} errors`);
                
                this.allTransactions.push(...result.transactions);
                this.processingErrors.push(...result.errors);
                
            } catch (error) {
                console.error(`❌ Error processing ${path.basename(filePath)}:`, error.message);
                this.processingErrors.push(`❌ Error processing ${path.basename(filePath)}: ${error.message}`);
            }
        }
    }

    getErrors() {
        return this.processingErrors;
    }
}

// Main execution function
function main() {
    console.log('🔧 Financial Reporter Test Script');
    console.log('=================================\n');
    
    const csvDir = path.join(__dirname, 'sample_csv');
    
    // Check if CSV directory exists
    if (!fs.existsSync(csvDir)) {
        console.error(`❌ CSV directory not found: ${csvDir}`);
        process.exit(1);
    }
    
    // Get all CSV files
    const csvFiles = fs.readdirSync(csvDir)
        .filter(file => file.toLowerCase().endsWith('.csv'))
        .map(file => path.join(csvDir, file));
    
    if (csvFiles.length === 0) {
        console.error(`❌ No CSV files found in: ${csvDir}`);
        process.exit(1);
    }
    
    console.log(`📂 Found ${csvFiles.length} CSV files:`);
    csvFiles.forEach(file => console.log(`  - ${path.basename(file)}`));
    
    // Initialize reporter
    const reporter = new FinancialReporter();
    
    // Process files
    reporter.processFiles(csvFiles);
    
    // Display results
    console.log('\n📊 PROCESSING SUMMARY');
    console.log('====================');
    console.log(`Total transactions: ${reporter.allTransactions.length}`);
    console.log(`Processing errors: ${reporter.processingErrors.length}`);
    
    if (reporter.processingErrors.length > 0) {
        console.log('\n⚠️ ERRORS:');
        reporter.processingErrors.forEach(error => console.log(`  ${error}`));
    }
    
    if (reporter.allTransactions.length === 0) {
        console.log('❌ No transactions to analyze.');
        return;
    }
    
    // Calculate totals
    const totals = reporter.calculateTotals(reporter.allTransactions);
    
    // Show category breakdown
    console.log('\n🏷️ CATEGORY BREAKDOWN');
    console.log('=====================');
    Object.entries(totals)
        .sort(([a], [b]) => a.localeCompare(b))
        .forEach(([category, data]) => {
            if (data.transactionCount > 0) {
                console.log(`${category}: ${data.transactionCount} transactions | Expenses: $${data.debitTotal.toFixed(2)} | Income: $${data.creditTotal.toFixed(2)}`);
            }
        });
    
    // Debug specific transactions we're troubleshooting
    console.log('\n🔍 TROUBLESHOOTING SPECIFIC TRANSACTIONS');
    console.log('========================================');
    
    // Find Transfer From Checking Plus transactions
    const transferTransactions = reporter.allTransactions.filter(t => 
        t.description.toLowerCase().includes('transfer from checking plus')
    );
    
    console.log(`\n🔄 "Transfer From Checking Plus" transactions found: ${transferTransactions.length}`);
    transferTransactions.forEach(t => {
        console.log(`  - ${t.date.toLocaleDateString()} | "${t.description}" | Category: ${t.category} | Debit: $${t.debit.toFixed(2)} | Credit: $${t.credit.toFixed(2)}`);
    });
    
    // Find Tripleseat transactions
    const tripleseatTransactions = reporter.allTransactions.filter(t => 
        t.description.toLowerCase().includes('tripleseat')
    );
    
    console.log(`\n💼 Tripleseat transactions found: ${tripleseatTransactions.length}`);
    tripleseatTransactions.forEach(t => {
        console.log(`  - ${t.date.toLocaleDateString()} | "${t.description}" | Category: ${t.category} | Debit: $${t.debit.toFixed(2)} | Credit: $${t.credit.toFixed(2)}`);
    });
    
    // Generate income breakdown with debug
    const incomeBreakdown = reporter.generateIncomeBreakdown(reporter.allTransactions);
    
    // Show interest transactions
    const interestTransactions = reporter.allTransactions.filter(t => t.category === 'Interest Paid');
    const potentialInterest = reporter.allTransactions.filter(t => {
        const desc = t.description.toLowerCase();
        return desc.includes('interest') || desc.includes('finance charge') || desc.includes('purchase interest');
    });
    
    console.log(`\n💸 INTEREST ANALYSIS`);
    console.log(`===================`);
    console.log(`Interest transactions properly categorized: ${interestTransactions.length}`);
    console.log(`Potential interest transactions found: ${potentialInterest.length}`);
    
    if (interestTransactions.length > 0) {
        console.log('\n✅ Properly categorized interest transactions:');
        interestTransactions.forEach(t => {
            console.log(`  - ${t.date.toLocaleDateString()} | "${t.description}" | $${t.debit.toFixed(2)}`);
        });
    }
    
    if (potentialInterest.length > interestTransactions.length) {
        console.log('\n⚠️ Potential interest transactions that may need review:');
        potentialInterest.filter(t => t.category !== 'Interest Paid').forEach(t => {
            console.log(`  - ${t.date.toLocaleDateString()} | "${t.description}" | Category: ${t.category} | $${t.debit.toFixed(2)}`);
        });
    }
    
    console.log('\n✅ Analysis complete!');
    console.log('\n💡 This script shows how the categorization logic works and helps debug');
    console.log('   specific transaction types like Tripleseat and Transfer transactions.');
}

// Run the script
if (require.main === module) {
    main();
}

module.exports = FinancialReporter;