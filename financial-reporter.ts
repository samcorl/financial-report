// Financial Reporting Tool - TypeScript Implementation
// Based on specifications for processing CSV transaction data

// Type definitions
interface Transaction {
  date: Date;
  description: string;
  debit: number;
  credit: number;
  category: string;
  isLargeExpense: boolean;
}

interface CategoryTotal {
  debitTotal: number;
  creditTotal: number;
  netAmount: number;
  transactionCount: number;
}

interface CategoryTotals {
  [categoryName: string]: CategoryTotal;
}

interface HeaderMapping {
  dateColumn: number;
  descriptionColumn: number;
  debitColumn?: number;
  creditColumn?: number;
  amountColumn?: number;
}

interface ProcessingResult {
  transactions: Transaction[];
  errors: string[];
  skippedRows: number;
  totalRows: number;
}

// Global category definitions
const CATEGORIES = [
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
  'Transfers',
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
const CATEGORY_KEYWORDS: { [category: string]: string[] } = {
  '3KM': ['3km'],
  'Auto': ['chevron', 'shell', 'mobil', 'gas station', 'auto', 'car wash', 'oil change', 'tire', 'mechanic', 'valero', 'exxon', 'bp ', 'citgo', 'arco', 'fastrak', 'bridge toll'],
  'Bank Fees': ['fee', 'charge', 'overdraft', 'annual membership fee', 'atm fee'],
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
  'Interest Paid': ['interest', 'finance charge', 'purchase interest charge'],
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
  'Transfers': ['transfer', 'payment thank you', 'ach electronic credit', 'mobile deposit'],
  'Travel': ['hotel', 'airline', 'flight', 'rental car', 'uber', 'lyft', 'taxi', 'hilton', 'marriott', 'travel', 'logan expr', 'commuter rail', 'mbta'],
  'Utilities': ['electric', 'gas', 'water', 'phone', 'internet', 'cable', 'comcast', 'pgande', 'att'],
  'Web Hosting': ['godaddy', 'aws', 'amazon web services', 'google cloud', 'hosting'],
  'Wine, Beer, Spirits': ['wine', 'beer', 'spirits', 'liquor', 'alcohol', 'totalwine']
};

class FinancialReporter {
  private allTransactions: Transaction[] = [];
  private processingErrors: string[] = [];
  
  // Header detection function
  private detectHeaders(headers: string[]): HeaderMapping {
    const mapping: HeaderMapping = {
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
  
  // Parse date function
  private parseDate(dateString: string): Date {
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
  
  // Categorization function
  private categorizeTransaction(description: string): string {
    const lowerDesc = description.toLowerCase();
    
    // Process categories in order - first match wins
    for (const category of CATEGORIES) {
      const keywords = CATEGORY_KEYWORDS[category] || [];
      for (const keyword of keywords) {
        if (lowerDesc.includes(keyword.toLowerCase())) {
          return category;
        }
      }
    }
    
    return 'Unclassified';
  }
  
  // Parse CSV function
  private parseCSVData(csvContent: string, filename: string): ProcessingResult {
    const lines = csvContent.trim().split('\n');
    const result: ProcessingResult = {
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
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const mapping = this.detectHeaders(headers);
    
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
        const row = lines[i].split(',').map(cell => cell.trim().replace(/"/g, ''));
        
        if (row.length < headers.length) {
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
          const amount = parseFloat(amountStr.replace(/[^-\d.]/g, '')) || 0;
          
          if (amount < 0) {
            debit = Math.abs(amount);
          } else {
            credit = amount;
          }
        }
        
        const category = this.categorizeTransaction(description);
        const isLargeExpense = debit > 200;
        
        const transaction: Transaction = {
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
  private calculateTotals(transactions: Transaction[]): CategoryTotals {
    const totals: CategoryTotals = {};
    
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
  
  // Utility functions
  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }
  
  private sortTransactionsByDate(transactions: Transaction[]): Transaction[] {
    return transactions.sort((a, b) => a.date.getTime() - b.date.getTime());
  }
  
  private getDateRange(transactions: Transaction[]): string {
    if (transactions.length === 0) return '';
    
    const sorted = this.sortTransactionsByDate([...transactions]);
    const startDate = sorted[0].date.toLocaleDateString();
    const endDate = sorted[sorted.length - 1].date.toLocaleDateString();
    
    return startDate === endDate ? startDate : `${startDate} - ${endDate}`;
  }
  
  // Report generation functions
  private generateSummaryHTML(totals: CategoryTotals): string {
    let totalDebits = 0;
    let totalCredits = 0;
    
    // Exclude transfers from totals
    for (const [category, categoryTotal] of Object.entries(totals)) {
      if (category !== 'Transfers') {
        totalDebits += categoryTotal.debitTotal;
        totalCredits += categoryTotal.creditTotal;
      }
    }
    
    const netAmount = totalCredits - totalDebits;
    
    return `
      <div class="card mb-4">
        <div class="card-header bg-primary text-white">
          <h3 class="card-title mb-0">Executive Summary</h3>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-4">
              <h5>Total Expenses</h5>
              <p class="h4 text-danger">${this.formatCurrency(totalDebits)}</p>
            </div>
            <div class="col-md-4">
              <h5>Total Income</h5>
              <p class="h4 text-success">${this.formatCurrency(totalCredits)}</p>
            </div>
            <div class="col-md-4">
              <h5>Net Amount</h5>
              <p class="h4 ${netAmount >= 0 ? 'text-success' : 'text-danger'}">${this.formatCurrency(netAmount)}</p>
            </div>
          </div>
        </div>
      </div>
    `;
  }
  
  private generateInterestSummaryHTML(transactions: Transaction[]): string {
    const interestTransactions = transactions.filter(t => t.category === 'Interest Paid');
    
    if (interestTransactions.length === 0) {
      return '';
    }
    
    const totalInterest = interestTransactions.reduce((sum, t) => sum + t.debit, 0);
    
    return `
      <div class="card mb-4">
        <div class="card-header bg-warning text-dark">
          <h3 class="card-title mb-0">Interest Paid Summary</h3>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-6">
              <h5>Total Interest Paid</h5>
              <p class="h4 text-danger">${this.formatCurrency(totalInterest)}</p>
            </div>
            <div class="col-md-6">
              <h5>Number of Charges</h5>
              <p class="h4">${interestTransactions.length}</p>
            </div>
          </div>
          <h6>Interest Transactions:</h6>
          <div class="table-responsive">
            <table class="table table-sm">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th class="text-end">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${interestTransactions.map(t => `
                  <tr>
                    <td>${t.date.toLocaleDateString()}</td>
                    <td>${t.description}</td>
                    <td class="text-end text-danger">${this.formatCurrency(t.debit)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }
  
  private generateBusinessDeductionsHTML(transactions: Transaction[], totals: CategoryTotals): string {
    const businessTransactions = transactions.filter(t => BUSINESS_CATEGORIES.includes(t.category));
    
    if (businessTransactions.length === 0) {
      return '';
    }
    
    const totalDeductions = BUSINESS_CATEGORIES.reduce((sum, category) => {
      return sum + (totals[category]?.debitTotal || 0);
    }, 0);
    
    return `
      <div class="card mb-4">
        <div class="card-header bg-success text-white">
          <h3 class="card-title mb-0">Business Deductions</h3>
        </div>
        <div class="card-body">
          <div class="row mb-3">
            <div class="col-md-6">
              <h5>Total Business Deductions</h5>
              <p class="h4 text-success">${this.formatCurrency(totalDeductions)}</p>
            </div>
          </div>
          
          <h6>By Category:</h6>
          <div class="row">
            ${BUSINESS_CATEGORIES.map(category => {
              const categoryTotal = totals[category];
              if (!categoryTotal || categoryTotal.debitTotal === 0) return '';
              
              return `
                <div class="col-md-6 mb-2">
                  <strong>${category}:</strong> ${this.formatCurrency(categoryTotal.debitTotal)}
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;
  }
  
  private generateCategorySummaryHTML(totals: CategoryTotals): string {
    const sortedCategories = Object.entries(totals)
      .filter(([category, total]) => total.debitTotal > 0 || total.creditTotal > 0)
      .sort(([a], [b]) => a.localeCompare(b));
    
    return `
      <div class="card mb-4">
        <div class="card-header bg-info text-white">
          <h3 class="card-title mb-0">Category Summary</h3>
        </div>
        <div class="card-body">
          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th class="text-end">Expenses</th>
                  <th class="text-end">Income</th>
                  <th class="text-end">Net</th>
                  <th class="text-end">Transactions</th>
                </tr>
              </thead>
              <tbody>
                ${sortedCategories.map(([category, total]) => `
                  <tr>
                    <td><a href="#category-${category.replace(/\s+/g, '-').toLowerCase()}">${category}</a></td>
                    <td class="text-end ${total.debitTotal > 0 ? 'text-danger' : ''}">${total.debitTotal > 0 ? this.formatCurrency(total.debitTotal) : '-'}</td>
                    <td class="text-end ${total.creditTotal > 0 ? 'text-success' : ''}">${total.creditTotal > 0 ? this.formatCurrency(total.creditTotal) : '-'}</td>
                    <td class="text-end ${total.netAmount >= 0 ? 'text-success' : 'text-danger'}">${this.formatCurrency(total.netAmount)}</td>
                    <td class="text-end">${total.transactionCount}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }
  
  private generateCategoryDetailHTML(category: string, transactions: Transaction[]): string {
    if (transactions.length === 0) return '';
    
    const sortedTransactions = this.sortTransactionsByDate(transactions);
    const categoryId = category.replace(/\s+/g, '-').toLowerCase();
    
    return `
      <div class="card mb-4" id="category-${categoryId}">
        <div class="card-header">
          <h4 class="card-title mb-0">${category}</h4>
        </div>
        <div class="card-body">
          <div class="table-responsive">
            <table class="table table-sm">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th class="text-end">Debit</th>
                  <th class="text-end">Credit</th>
                </tr>
              </thead>
              <tbody>
                ${sortedTransactions.map(t => `
                  <tr ${t.isLargeExpense ? 'class="fw-bold"' : ''}>
                    <td>${t.date.toLocaleDateString()}</td>
                    <td>${t.description}</td>
                    <td class="text-end ${t.debit > 0 ? 'text-danger' : ''}">${t.debit > 0 ? this.formatCurrency(t.debit) : '-'}</td>
                    <td class="text-end ${t.credit > 0 ? 'text-success' : ''}">${t.credit > 0 ? this.formatCurrency(t.credit) : '-'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          <div class="mt-3">
            <a href="#category-summary" class="btn btn-sm btn-outline-primary">← Back to Summary</a>
          </div>
        </div>
      </div>
    `;
  }
  
  // Main report generation function
  public generateReport(): string {
    if (this.allTransactions.length === 0) {
      return '<div class="alert alert-warning">No transactions to report.</div>';
    }
    
    const totals = this.calculateTotals(this.allTransactions);
    const dateRange = this.getDateRange(this.allTransactions);
    
    // Group transactions by category
    const transactionsByCategory: { [category: string]: Transaction[] } = {};
    for (const transaction of this.allTransactions) {
      if (!transactionsByCategory[transaction.category]) {
        transactionsByCategory[transaction.category] = [];
      }
      transactionsByCategory[transaction.category].push(transaction);
    }
    
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Financial Report - ${dateRange}</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.0/dist/css/bootstrap.min.css" rel="stylesheet">
        <style>
          @media print {
            .no-print { display: none !important; }
          }
          body { font-size: 14px; }
          .card-title { font-size: 1.1rem; }
        </style>
      </head>
      <body>
        <div class="container-fluid py-4">
          <div class="row">
            <div class="col-12">
              <h1 class="text-center mb-4">Financial Report</h1>
              <p class="text-center text-muted mb-4">Date Range: ${dateRange}</p>
              
              ${this.generateSummaryHTML(totals)}
              ${this.generateInterestSummaryHTML(this.allTransactions)}
              ${this.generateBusinessDeductionsHTML(this.allTransactions, totals)}
              
              <div id="category-summary">
                ${this.generateCategorySummaryHTML(totals)}
              </div>
              
              <h2>Transaction Details</h2>
              ${Object.entries(transactionsByCategory)
                .filter(([category, transactions]) => transactions.length > 0)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([category, transactions]) => this.generateCategoryDetailHTML(category, transactions))
                .join('')}
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }
  
  // Public method to process files
  public processFiles(files: FileList): Promise<void> {
    return new Promise((resolve, reject) => {
      this.allTransactions = [];
      this.processingErrors = [];
      
      let filesProcessed = 0;
      const totalFiles = files.length;
      
      if (totalFiles === 0) {
        reject(new Error('No files provided'));
        return;
      }
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const reader = new FileReader();
        
        reader.onload = (e) => {
          try {
            const content = e.target?.result as string;
            const result = this.parseCSVData(content, file.name);
            
            this.allTransactions.push(...result.transactions);
            this.processingErrors.push(...result.errors);
            
            filesProcessed++;
            if (filesProcessed === totalFiles) {
              resolve();
            }
          } catch (error) {
            this.processingErrors.push(`Error processing ${file.name}: ${error}`);
            filesProcessed++;
            if (filesProcessed === totalFiles) {
              resolve();
            }
          }
        };
        
        reader.onerror = () => {
          this.processingErrors.push(`Error reading ${file.name}`);
          filesProcessed++;
          if (filesProcessed === totalFiles) {
            resolve();
          }
        };
        
        reader.readAsText(file);
      }
    });
  }
  
  public getErrors(): string[] {
    return this.processingErrors;
  }
}

// Global instance
let reporter: FinancialReporter;

// Initialize the application
function initializeApp() {
  reporter = new FinancialReporter();
  setupUI();
}

// UI Setup
function setupUI() {
  const fileInput = document.getElementById('fileInput') as HTMLInputElement;
  const dropZone = document.getElementById('dropZone') as HTMLDivElement;
  const processBtn = document.getElementById('processBtn') as HTMLButtonElement;
  const reportContainer = document.getElementById('reportContainer') as HTMLDivElement;
  const errorContainer = document.getElementById('errorContainer') as HTMLDivElement;
  
  // File input change handler
  fileInput.addEventListener('change', (e) => {
    const files = (e.target as HTMLInputElement).files;
    if (files && files.length > 0) {
      updateFileList(files);
      processBtn.disabled = false;
    }
  });
  
  // Drag and drop handlers
  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('border-primary', 'bg-light');
  });
  
  dropZone.addEventListener('dragleave', (e) => {
    e.preventDefault();
    dropZone.classList.remove('border-primary', 'bg-light');
  });
  
  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('border-primary', 'bg-light');
    
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      // Set files to input element
      fileInput.files = files;
      updateFileList(files);
      processBtn.disabled = false;
    }
  });
  
  // Process button handler
  processBtn.addEventListener('click', async () => {
    const files = fileInput.files;
    if (!files || files.length === 0) return;
    
    processBtn.disabled = true;
    processBtn.textContent = 'Processing...';
    errorContainer.innerHTML = '';
    reportContainer.innerHTML = '';
    
    try {
      await reporter.processFiles(files);
      
      // Display errors if any
      const errors = reporter.getErrors();
      if (errors.length > 0) {
        errorContainer.innerHTML = `
          <div class="alert alert-warning">
            <h5>Processing Warnings:</h5>
            <ul>
              ${errors.map(error => `<li>${error}</li>`).join('')}
            </ul>
          </div>
        `;
      }
      
      // Generate and display report
      const reportHTML = reporter.generateReport();
      reportContainer.innerHTML = reportHTML;
      
    } catch (error) {
      errorContainer.innerHTML = `
        <div class="alert alert-danger">
          <h5>Error:</h5>
          <p>${error}</p>
        </div>
      `;
    } finally {
      processBtn.disabled = false;
      processBtn.textContent = 'Generate Report';
    }
  });
}

function updateFileList(files: FileList) {
  const fileList = document.getElementById('fileList') as HTMLDivElement;
  const fileNames = Array.from(files).map(f => f.name).join(', ');
  fileList.innerHTML = `<small class="text-muted">Selected files: ${fileNames}</small>`;
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApp);