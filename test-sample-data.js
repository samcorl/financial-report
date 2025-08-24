#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read and extract the JavaScript from the HTML file
const htmlContent = fs.readFileSync('/Users/samcorl/gitsrc/financial_report/financial-reporter.html', 'utf8');
const scriptMatch = htmlContent.match(/<script>([\s\S]*?)<\/script>/);
if (!scriptMatch) {
    console.error('Could not find JavaScript in HTML file');
    process.exit(1);
}

// Extract the JavaScript code and adapt it for Node.js
let jsCode = scriptMatch[1];

// Remove browser-specific code and adapt for Node.js
jsCode = jsCode.replace(/document\.addEventListener.*initializeApp.*$/m, '');
jsCode = jsCode.replace(/setupUI.*$/m, '');
jsCode = jsCode.replace(/updateFileList.*$/m, '');
jsCode = jsCode.replace(/FileReader/g, 'NodeFileReader');

// Add Node.js FileReader simulation
const nodeFileReaderSim = `
class NodeFileReader {
    readAsText(content) {
        setTimeout(() => {
            this.onload({ target: { result: content } });
        }, 0);
    }
}
`;

// Combine and execute
const fullCode = nodeFileReaderSim + jsCode;
eval(fullCode);

// Mock file objects for the CSV files
function createMockFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    return {
        name: path.basename(filePath),
        size: content.length,
        content: content
    };
}

// Test function
async function testWithSampleData() {
    console.log('🧪 Testing Financial Reporter with Sample Data\n');
    
    const sampleDir = '/Users/samcorl/gitsrc/financial_report/sample_csv';
    const csvFiles = fs.readdirSync(sampleDir)
        .filter(file => file.toLowerCase().endsWith('.csv'))
        .map(file => createMockFile(path.join(sampleDir, file)));
    
    console.log(`📁 Found ${csvFiles.length} CSV files:`);
    csvFiles.forEach(file => console.log(`  - ${file.name} (${file.size} bytes)`));
    console.log('');
    
    // Create reporter instance
    const reporter = new FinancialReporter();
    
    // Process files
    console.log('🔄 Processing files...\n');
    
    try {
        // Simulate file processing
        for (const file of csvFiles) {
            const result = reporter.parseCSVData(file.content, file.name);
            reporter.allTransactions.push(...result.transactions);
            reporter.processingErrors.push(...result.errors);
            
            console.log(`✅ ${file.name}: ${result.transactions.length} transactions, ${result.skippedRows} skipped, ${result.errors.length} errors`);
        }
        
        console.log(`\n📊 Total transactions processed: ${reporter.allTransactions.length}`);
        
        // Calculate totals
        const totals = reporter.calculateTotals(reporter.allTransactions);
        console.log(`\n🏷️ Categories found: ${Object.keys(totals).length}`);
        
        // Show category breakdown
        console.log('\n📋 Category Summary:');
        Object.entries(totals)
            .sort(([a], [b]) => a.localeCompare(b))
            .forEach(([category, total]) => {
                if (total.debitTotal > 0 || total.creditTotal > 0) {
                    console.log(`  ${category}: ${total.transactionCount} txns, $${total.debitTotal.toFixed(2)} expenses, $${total.creditTotal.toFixed(2)} income`);
                }
            });
        
        // Test income breakdown
        console.log('\n💰 Income Analysis:');
        const incomeTransactions = reporter.allTransactions.filter(t => t.credit > 0 && t.category !== 'Transfers');
        console.log(`Total income transactions: ${incomeTransactions.length}`);
        
        const tripleseatTransactions = incomeTransactions.filter(t => t.description.toLowerCase().includes('tripleseat'));
        console.log(`Tripleseat transactions: ${tripleseatTransactions.length}`);
        tripleseatTransactions.forEach(t => {
            console.log(`  - $${t.credit.toFixed(2)} - "${t.description}" (Category: ${t.category})`);
        });
        
        const totalTripleseat = tripleseatTransactions.reduce((sum, t) => sum + t.credit, 0);
        console.log(`Total Tripleseat salary: $${totalTripleseat.toFixed(2)}`);
        
        // Check for transfer categorization
        console.log('\n🔄 Transfer Analysis:');
        const transferTransactions = reporter.allTransactions.filter(t => t.category === 'Transfers');
        console.log(`Total transfer transactions: ${transferTransactions.length}`);
        
        const rcuTransfers = transferTransactions.filter(t => t.description.toLowerCase().includes('redwood cu rcu xfer'));
        console.log(`REDWOOD CU RCU XFER transactions: ${rcuTransfers.length}`);
        rcuTransfers.forEach(t => {
            console.log(`  - $${(t.debit || t.credit).toFixed(2)} - "${t.description}"`);
        });
        
        // Show any errors
        const errors = reporter.getErrors();
        if (errors.length > 0) {
            console.log('\n⚠️ Processing Errors:');
            errors.forEach(error => console.log(`  - ${error}`));
        }
        
    } catch (error) {
        console.error('❌ Error during processing:', error.message);
    }
}

// Run the test
testWithSampleData();