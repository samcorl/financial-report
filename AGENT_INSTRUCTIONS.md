# Financial Reporting Tool - Agent Instructions

Build a web-based financial reporting tool that processes CSV transaction data to generate comprehensive expense analysis reports with business deduction tracking and detailed debugging.

## Core Requirements

### Input Processing
- **File Format**: CSV files from banks/credit cards
- **Multi-file Support**: Process multiple CSV files simultaneously  
- **Flexible Headers**: Auto-detect variations of Date, Description, Debit/Credit/Amount columns
- **Amount Handling**: Support both separate Debit/Credit columns and single Amount columns (+/-)
- **Proper CSV Parsing**: Handle quoted fields with commas (e.g., `"$1,234.56"`)

### Transaction Categorization
Implement keyword-based categorization with these categories:

**Expense Categories:**
- Auto (gas stations, car maintenance)
- Bank Fees (overdraft, ATM fees, monthly fees)
- Dining (restaurants, cafes, delivery)  
- Entertainment (streaming, movies, concerts)
- Groceries (supermarkets, grocery stores)
- Hardware (Home Depot, Lowe's, hardware stores)
- Health (pharmacy, medical, dental)
- Insurance (life, auto, health insurance)
- **Interest Paid** (credit card interest, loan interest)
- Office Supplies (Staples, office equipment)
- Parking (meters, garages, parking fees)
- Pets (vet, pet stores, pet food)
- Shopping (retail, clothing, general purchases)
- **Software Subscriptions** (SaaS, development tools - business deductible)
- Subscriptions (streaming, memberships)
- Travel (hotels, flights, transportation)
- Transfers (between own accounts - exclude from totals)
- Utilities (electric, gas, internet, phone)
- **Web Hosting** (AWS, hosting services - business deductible)
- Unclassified (default for unmatched transactions)

**Income Categories:**
- **Salary Income** (direct deposit, payroll)
- **Other Income** (freelance, side projects, misc)
- Transfers (exclude from income totals)

### Business Deductions
Track tax-deductible categories:
- Software Subscriptions
- Web Hosting  
- Office Supplies

### Financial Calculations
- Total expenses (exclude transfers)
- Total income (exclude transfers)
- Net amount (income - expenses)
- Interest paid summary
- Business deductions total
- Category breakdowns with transaction counts

### Report Features
**Technology**: Single HTML file with embedded TypeScript (compiled to JavaScript) + Bootstrap 5

**Report Sections:**
1. **Executive Summary** - totals, debug info toggle
2. **Income Breakdown** - salary vs other income with transaction tables
3. **Interest Paid Summary** - highlighted section with detailed breakdown
4. **Business Deductions** - tax-focused section
5. **Category Summary** - table with links to detail sections
6. **Transaction Details** - per-category listings with large expenses (>$200) highlighted

### UI Requirements
- **File Upload**: Drag-and-drop interface supporting multiple CSV files
- **Processing Feedback**: Loading states, error handling, success metrics
- **Debug Features**: Extensive console logging, processing statistics, error reporting
- **Bootstrap Styling**: Professional, responsive design with print support

### Debug Features (FULL NERD MODE)
- **CSV Parsing Debug**: Header detection, column mapping, row processing
- **Categorization Debug**: Real-time keyword matching logs
- **Amount Parsing Debug**: Raw strings → parsed numbers for large amounts
- **Income Processing Debug**: Transaction filtering and categorization
- **Visual Debug Panel**: Collapsible section showing category breakdowns
- **Console Logging**: Comprehensive transaction processing logs
- **Error Reporting**: Multi-level error handling with detailed feedback

## Sample CSV Formats

**Format 1 - Separate Debit/Credit:**
```csv
Date,Description,Debit,Credit
1/15/25,Amazon Web Services,29.99,
1/14/25,Direct Deposit Salary,,4500.00
1/13/25,Starbucks,5.47,
```

**Format 2 - Single Amount Column:**
```csv
Transaction Date,Merchant,Amount,Category
01/15/2025,AWS Cloud Services,-29.99,
01/14/2025,Payroll Deposit,4500.00,
01/13/2025,Coffee Shop,-5.47,
```

**Format 3 - Complex Headers with Quoted Amounts:**
```csv
"Date","Description","Amount","Balance"
"1/15/25","Amazon Web Services","$29.99","$1,234.56"
"1/14/25","Direct Deposit","$4,500.00","$5,734.56"
```

## Key Implementation Notes

### TypeScript Structure
```typescript
interface Transaction {
  date: Date;
  description: string; 
  debit: number;
  credit: number;
  category: string;
  isLargeExpense: boolean;
}

class FinancialReporter {
  // CSV parsing with proper quoted field handling
  parseCSVRow(line: string): string[]
  
  // Flexible header detection
  detectHeaders(headers: string[]): HeaderMapping
  
  // Keyword-based categorization  
  categorizeTransaction(description: string): string
  
  // Income source separation
  generateIncomeBreakdownHTML(transactions: Transaction[]): string
  
  // Business deduction tracking
  generateBusinessDeductionsHTML(transactions: Transaction[]): string
}
```

### Categorization Logic
- Process categories in order (first match wins)
- Case-insensitive keyword matching
- Extensive transfer detection to exclude internal account movements
- Debug logging for interest transactions and large amounts

### Error Handling
- File reading errors with detailed messages
- CSV parsing validation 
- Row-level error reporting
- Malformed data graceful handling
- Processing statistics and warnings

## Success Criteria
- Processes multiple CSV formats automatically
- Accurately categorizes transactions with debugging visibility
- Identifies business deductions for tax purposes
- Separates salary from other income sources  
- Tracks interest payments separately
- Provides comprehensive debug information
- Generates professional, print-ready reports
- Single-file deployment (no server required)

Build this as a complete, production-ready tool with extensive debugging capabilities that developers can customize for their own financial tracking needs.