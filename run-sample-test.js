#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Financial Reporter with Sample Data\n');

// Simple CSV reader for testing
function parseSimpleCSV(content) {
    const lines = content.trim().split('\n');
    if (lines.length < 2) return [];
    
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const rows = [];
    
    for (let i = 1; i < lines.length; i++) {
        const row = lines[i].split(',').map(cell => cell.trim().replace(/"/g, ''));
        if (row.length >= headers.length) {
            const rowObj = {};
            headers.forEach((header, idx) => {
                rowObj[header] = row[idx] || '';
            });
            rows.push(rowObj);
        }
    }
    
    return { headers, rows };
}

// Test categorization function (simplified version)
function categorizeTransaction(description) {
    const lowerDesc = description.toLowerCase();
    
    // Debug output
    if (lowerDesc.includes('tripleseat')) {
        console.log(`💼 CATEGORIZING Tripleseat transaction: "${description}"`);
        console.log(`✅ TRIPLESEAT SPECIAL CASE: Forcing category to "Deposits"`);
        return 'Deposits';
    }
    
    if (lowerDesc.includes('redwood cu rcu xfer')) {
        console.log(`🔄 CATEGORIZING RCU transfer: "${description}"`);
        console.log(`✅ MATCHED "redwood cu rcu xfer" -> Transfers`);
        return 'Transfers';
    }
    
    if (lowerDesc.includes('transfer from checking plus')) {
        console.log(`🔍 CATEGORIZING "Transfer From Checking Plus": "${description}"`);
        console.log(`✅ MATCHED "transfer" -> Transfers`);
        return 'Transfers';
    }
    
    // Check other transfer keywords
    const transferKeywords = ['transfer', 'ach electronic credit', 'ach deposit', 'ach withdrawal'];
    for (const keyword of transferKeywords) {
        if (lowerDesc.includes(keyword)) {
            return 'Transfers';
        }
    }
    
    // Check for other categories
    if (lowerDesc.includes('deposit')) return 'Deposits';
    if (lowerDesc.includes('interest')) return 'Interest Paid';
    
    return 'Unclassified';
}

// Process sample files
const sampleDir = '/Users/samcorl/gitsrc/financial_report/sample_csv';
const csvFiles = fs.readdirSync(sampleDir)
    .filter(file => file.toLowerCase().endsWith('.csv'));

console.log(`📁 Found ${csvFiles.length} CSV files:`);
csvFiles.forEach(file => console.log(`  - ${file}`));
console.log('');

let allTransactions = [];

for (const filename of csvFiles) {
    const filePath = path.join(sampleDir, filename);
    const content = fs.readFileSync(filePath, 'utf8');
    const { headers, rows } = parseSimpleCSV(content);
    
    console.log(`\n📋 Processing ${filename}:`);
    console.log(`Headers: ${headers.join(', ')}`);
    console.log(`Rows: ${rows.length}`);
    
    // Find key columns
    const dateCol = headers.find(h => h.toLowerCase().includes('date'));
    const descCol = headers.find(h => h.toLowerCase().includes('description') || h.toLowerCase().includes('merchant'));
    const amountCol = headers.find(h => h.toLowerCase().includes('amount'));
    const debitCol = headers.find(h => h.toLowerCase().includes('debit'));
    const creditCol = headers.find(h => h.toLowerCase().includes('credit'));
    
    console.log(`Key columns - Date: ${dateCol}, Desc: ${descCol}, Amount: ${amountCol}, Debit: ${debitCol}, Credit: ${creditCol}`);
    
    for (const row of rows) {
        const description = row[descCol] || '';
        if (!description) continue;
        
        let debit = 0, credit = 0;
        
        if (debitCol && creditCol) {
            debit = Math.abs(parseFloat((row[debitCol] || '0').replace(/[^-\d.]/g, '')) || 0);
            credit = Math.abs(parseFloat((row[creditCol] || '0').replace(/[^-\d.]/g, '')) || 0);
        } else if (amountCol) {
            const amount = parseFloat((row[amountCol] || '0').replace(/[^-\d.]/g, '')) || 0;
            if (amount < 0) {
                debit = Math.abs(amount);
            } else {
                credit = amount;
            }
        }
        
        if (debit > 0 || credit > 0) {
            const category = categorizeTransaction(description);
            allTransactions.push({ description, debit, credit, category });
        }
    }
}

console.log(`\n📊 Summary:`);
console.log(`Total transactions: ${allTransactions.length}`);

// Group by category
const categories = {};
allTransactions.forEach(t => {
    if (!categories[t.category]) {
        categories[t.category] = { count: 0, debit: 0, credit: 0, transactions: [] };
    }
    categories[t.category].count++;
    categories[t.category].debit += t.debit;
    categories[t.category].credit += t.credit;
    categories[t.category].transactions.push(t);
});

console.log(`\n🏷️ Categories:`);
Object.entries(categories)
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([cat, data]) => {
        console.log(`  ${cat}: ${data.count} txns, $${data.debit.toFixed(2)} expenses, $${data.credit.toFixed(2)} income`);
    });

// Check specific items
console.log(`\n🔍 Specific Checks:`);

const tripleseatTxns = allTransactions.filter(t => t.description.toLowerCase().includes('tripleseat'));
console.log(`Tripleseat transactions: ${tripleseatTxns.length}`);
tripleseatTxns.forEach(t => console.log(`  - $${t.credit.toFixed(2)} - "${t.description}" (${t.category})`));

const rcuTxns = allTransactions.filter(t => t.description.toLowerCase().includes('redwood cu rcu xfer'));
console.log(`REDWOOD CU RCU XFER transactions: ${rcuTxns.length}`);
rcuTxns.forEach(t => console.log(`  - $${(t.debit || t.credit).toFixed(2)} - "${t.description}" (${t.category})`));

const unclassified = allTransactions.filter(t => t.category === 'Unclassified');
console.log(`\n❓ Unclassified transactions: ${unclassified.length}`);
if (unclassified.length > 0) {
    console.log(`First 10 unclassified:`);
    unclassified.slice(0, 10).forEach(t => console.log(`  - "${t.description}"`));
}