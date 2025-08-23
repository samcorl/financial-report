# Financial Reporting Tool - Technical Specifications

## Project Overview
Create a web-based financial reporting tool that processes CSV transaction data from banks and credit cards to generate comprehensive expense analysis reports with business deduction tracking and interest payment summaries.

## Core Requirements

### Input Data Processing
- **File Format**: CSV files exported from various financial institutions
- **Expected Columns**: Date, Description, Debit, Credit (with flexible header detection)
- **Multi-file Support**: Process multiple CSV files in a single report run
- **Header Intelligence**: Automatically detect and map common column variations:
  - Date: "Date", "Transaction Date", "Posted Date"
  - Description: "Description", "Transaction Description", "Merchant"
  - Debit: "Debit", "Amount", "Withdrawal" (negative values)
  - Credit: "Credit", "Deposit" (positive values)
- **Amount Handling**: Handle both separate Debit/Credit columns and single Amount columns with +/- signs

### Transaction Categorization System
Implement keyword-based categorization matching the existing Ruby system categories:

**Primary Categories**:
- 3KM (Business - Design contests)
- Auto (Vehicle expenses)
- Bank Fees
- Cash
- Checks
- Child Care and Camps
- Deposits (Income)
- Donations
- Education
- Entertainment
- Fines and Tickets
- Girl Scouts
- Gifts
- Groceries
- Hardware
- Health and Beauty
- Health Supplements
- Household
- Insurance
- **Interest Paid** (Special tracking required)
- IRS
- Medical and Dental Expenses
- Mortgage
- Office Technology (Business deductible)
- Office Supplies, Memberships & Subscriptions (Business deductible)
- Parking
- Pets
- Postage
- Restaurants
- Solar Lease
- Storage
- Subscriptions
- Tax Return Preparation
- Transfers (Exclude from totals)
- Travel
- Unclassified
- Utilities
- Web Hosting (Business deductible)
- Wine, Beer, Spirits

**Categorization Logic**:
- Use case-insensitive keyword matching within transaction descriptions
- First match wins (process categories in defined order)
- Default to "Unclassified" for unmatched transactions
- Maintain existing keyword mappings from Ruby implementation

### Financial Calculations

**Summary Totals**:
- Total Debits (expenses)
- Total Credits (income/deposits)
- Net Amount (Credits - Debits)
- All amounts formatted with thousands separators and currency symbols

**Special Tracking**:
- **Interest Paid Summary**: Aggregate all "Interest Paid" category transactions
- **Business Deductions**: Sum transactions from business-related categories:
  - Office Technology
  - Office Supplies, Memberships & Subscriptions  
  - Web Hosting (GoDaddy, AWS specifically noted)
  - 3KM category

**Category Exclusions**:
- Exclude "Transfers" category from all totals to avoid double-counting

### Report Output Format

**Technology Stack**: HTML with embedded CSS and TypeScript (compiled to JavaScript, single file)
**Styling**: Bootstrap 5 CSS framework via CDN
**Layout Structure**:

1. **Header Section**:
   - Report title with data source filename(s)
   - Date range automatically determined from transaction data
   - Executive summary with total debits, credits, and net amount

2. **Interest Paid Section** (Featured):
   - Separate highlighted section showing total interest paid
   - Breakdown by interest type if identifiable (credit card vs. loan)
   
3. **Business Deductions Section** (Featured):
   - Dedicated section for tax-deductible business expenses
   - Subtotals for each business category
   - Total business deductions amount

4. **Category Summary Table**:
   - All categories with non-zero amounts
   - Category names linked to detailed sections
   - Amount totals with currency formatting
   - Sorted alphabetically

5. **Detailed Transaction Listings**:
   - Separate section for each category with transactions
   - Transactions sorted chronologically within categories
   - Table format: Date | Description | Debit | Credit
   - Highlight large expenses (>$200) with bold formatting
   - Navigation links back to summary

**Visual Design**:
- Clean, professional appearance suitable for financial review
- Responsive design for desktop/tablet viewing
- Print-friendly styling
- Clear visual hierarchy with proper heading structure
- Consistent spacing and typography

### Technical Implementation

**File Structure**: Single HTML file with embedded CSS and compiled TypeScript/JavaScript
**Libraries**: 
- Bootstrap 5.2.0+ (CDN)
- No additional dependencies required
- TypeScript compiled to JavaScript for data processing

**Core Functions Needed**:
```typescript
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

// Data processing functions
function parseCSVData(csvContent: string): Transaction[]
function detectHeaders(headers: string[]): HeaderMapping
function categorizeTransaction(description: string): string
function calculateTotals(transactions: Transaction[]): CategoryTotals

// Report generation functions
function generateSummaryHTML(totals: CategoryTotals): string
function generateInterestSummaryHTML(interestTransactions: Transaction[]): string
function generateBusinessDeductionsHTML(businessTransactions: Transaction[]): string
function generateCategoryDetailHTML(category: string, transactions: Transaction[]): string
function generateFullReport(transactions: Transaction[]): string

// Utility functions
function formatCurrency(amount: number): string
function parseDate(dateString: string): Date
function sortTransactionsByDate(transactions: Transaction[]): Transaction[]
```

**Data Structures**:
```typescript
// Transaction interface
interface Transaction {
  date: Date;
  description: string;
  debit: number;
  credit: number;
  category: string;
  isLargeExpense: boolean;
}

// Category totals interface
interface CategoryTotals {
  [categoryName: string]: {
    debitTotal: number;
    creditTotal: number;
    netAmount: number;
    transactionCount: number;
  };
}

// Header mapping for CSV parsing
interface HeaderMapping {
  dateColumn: number;
  descriptionColumn: number;
  debitColumn?: number;
  creditColumn?: number;
  amountColumn?: number;
}

// File processing result
interface ProcessingResult {
  transactions: Transaction[];
  errors: string[];
  skippedRows: number;
  totalRows: number;
}
```

### User Interface Requirements

**File Input**:
- File upload interface supporting multiple CSV files
- Drag-and-drop functionality preferred
- File validation (CSV format, reasonable size limits)
- Clear error messages for invalid files

**Processing Feedback**:
- Loading indicator during file processing
- Progress feedback for large datasets
- Error handling for malformed data

**Report Display**:
- Immediate display of generated report
- Export options (print, save HTML)
- Option to process additional files without losing current report

### Data Validation and Error Handling

**Input Validation**:
- Verify required columns are present
- Handle missing or malformed dates
- Validate numeric amounts
- Skip invalid rows with logging

**Error Recovery**:
- Continue processing when encountering bad data
- Report skipped rows/files to user
- Graceful handling of empty files
- Clear error messages with suggested fixes

**Data Integrity**:
- Verify debit/credit calculations
- Flag unusual patterns (excessive unclassified items)
- Validate date ranges make sense

### Performance Considerations

**File Size Handling**:
- Efficiently process files up to 10MB
- Memory-conscious parsing for large datasets
- Progress indication for long operations

**Browser Compatibility**:
- Support modern browsers with ES6+ support (Chrome, Firefox, Safari, Edge)
- TypeScript compiled to ES2018+ JavaScript
- No Internet Explorer support required
- Mobile responsive for review purposes

### TypeScript Configuration

**Compilation Settings**:
```json
{
  "compilerOptions": {
    "target": "ES2018",
    "module": "ES2015", 
    "lib": ["ES2018", "DOM"],
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noImplicitReturns": true,
    "moduleResolution": "node"
  }
}
```

**Type Safety Requirements**:
- Full type coverage for all functions and interfaces
- Strict null checking enabled
- No `any` types except for necessary DOM interactions
- Proper error handling with typed exceptions

### Future Extensibility

**Customization Hooks**:
- Easy keyword list modification
- Category addition/removal capability
- Custom business deduction rules
- Date range filtering options

**Data Export**:
- Foundation for CSV export of categorized data
- API endpoints for integration possibilities
- Structured data format for external tools

**Development Notes**

**TypeScript Implementation**:
- Use strict TypeScript configuration for type safety
- Compile to single JavaScript file for embedding in HTML
- Leverage TypeScript interfaces for data modeling
- Implement proper error handling with typed exceptions

**Based on Existing Ruby Implementation**:
- Preserve all existing keyword mappings exactly
- Maintain identical categorization logic
- Keep same visual styling patterns
- Ensure mathematical calculations match current output

**Testing Requirements**:
- Test with sample bank CSV formats using proper TypeScript typing
- Verify category assignment accuracy with type-safe interfaces
- Validate all mathematical calculations with proper number handling
- Cross-reference output with Ruby version
- Unit tests for core TypeScript functions where possible

**Deployment**:
- Single HTML file with compiled JavaScript embedded
- TypeScript source code included as comments for future modifications
- No server requirements
- Fully client-side processing
- Works offline after initial load

## Success Criteria

1. **Functional**: Successfully processes multiple CSV formats and generates accurate financial reports
2. **Business Value**: Clearly identifies business deductions and interest payments for tax purposes  
3. **Usability**: Simple interface requiring no technical knowledge to operate
4. **Accuracy**: Mathematical calculations and categorizations match existing Ruby implementation
5. **Performance**: Handles typical personal finance CSV files (1000+ transactions) efficiently
6. **Reliability**: Gracefully handles various CSV formats and data quality issues