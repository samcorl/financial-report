# Financial Reporting Tool Suite - Agent Instructions

Build a complete web-based financial reporting tool suite that processes CSV transaction data to generate comprehensive expense analysis reports with business deduction tracking, detailed debugging, and customizable category management.

## Project Overview

This is a complete financial reporting suite consisting of:
1. **Financial Reporter** - Main reporting tool that processes CSV files and generates detailed reports
2. **Category Manager** - Administrative interface for customizing transaction categorization 
3. **Landing Page** - Central hub linking both tools with documentation

All tools are built as standalone HTML files with embedded JavaScript/TypeScript for easy deployment and sharing.

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

## Category Manager Tool

Build a comprehensive Category Manager (`category-manager.html`) that allows users to customize transaction categorization rules for their specific banking patterns.

### Category Manager Requirements

**Purpose**: Provide a user-friendly interface to manage keywords and categories used by the Financial Reporter for automatic transaction categorization.

**Technology**: Single HTML file with embedded JavaScript + Bootstrap 5

### Core Features

#### 1. Category Management Interface
- **Visual Category Cards**: Each category displayed as a Bootstrap card with:
  - Category name and keyword count
  - Business deduction indicator (green border + badge)
  - Delete and toggle business status buttons
  - Keyword display with individual remove buttons
  - Add new keyword input field

#### 2. Keyword Management
- **Dynamic Keyword Addition**: Users can add keywords via input field + Enter key or button
- **Keyword Removal**: Individual remove buttons (×) for each keyword tag
- **Real-time Validation**: Prevent duplicate keywords, empty entries
- **Case Insensitive**: Automatically convert keywords to lowercase for consistency

#### 3. Business Category Tracking
- **Business Toggle**: Mark/unmark categories as business deductible
- **Visual Indicators**: Green border and "Business" badge for business categories
- **Statistics Tracking**: Count of business categories in dashboard

#### 4. Search and Filter
- **Category Search**: Real-time search by category name or keywords
- **Responsive Design**: Mobile-friendly interface with Bootstrap grid system

#### 5. Data Persistence
- **LocalStorage**: Save all customizations to browser localStorage
- **Auto-save**: Persist changes when Save button clicked
- **Reset Option**: Restore default categories with confirmation dialog

#### 6. Import/Export
- **Export Categories**: Download JSON file with all categories, keywords, and business flags
- **Import Categories**: Upload and restore from JSON file
- **Backup/Restore**: Enable sharing configurations between users

#### 7. Navigation Integration
- **Back to Home**: Link to main landing page (`index.html`)
- **Launch Reporter**: Direct link to Financial Reporter (`financial-reporter.html`)
- **Seamless Workflow**: Easy switching between tools

### Default Category Structure

The Category Manager should include these default categories with extensive keyword mappings:

**Expense Categories:**
- Auto, Bank Fees, Cash, Checks, Child Care and Camps, Donations, Education
- Entertainment, Fines and Tickets, Girl Scouts, Gifts, Groceries, Hardware
- Health and Beauty, Health Supplements, Household, Insurance, Interest Paid
- IRS, Medical and Dental Expenses, Mortgage, Parking, Pets, Postage
- Restaurants, Solar Lease, Storage, Subscriptions, Tax Return Preparation
- Travel, Utilities, Wine Beer Spirits, Unclassified

**Business Categories (Tax Deductible):**
- Office Technology, Office Supplies/Memberships/Subscriptions, Web Hosting, 3KM

**Income Categories:**
- Deposits (salary, payroll, income), Transfers (internal account movements)

### Technical Implementation

#### Category Data Structure
```javascript
// Categories array - ordered list for display
let CATEGORIES = ['Transfers', 'Auto', 'Bank Fees', ...];

// Business categories array - subset of CATEGORIES
let BUSINESS_CATEGORIES = ['Office Technology', 'Web Hosting', ...];

// Keywords mapping - category name to array of keywords
let CATEGORY_KEYWORDS = {
  'Auto': ['chevron', 'shell', 'gas station', 'car wash', ...],
  'Groceries': ['safeway', 'whole foods', 'trader joe', ...],
  ...
};
```

#### LocalStorage Integration
```javascript
// Save format - must match Financial Reporter expectations
const data = {
  categories: CATEGORIES,
  keywords: CATEGORY_KEYWORDS, 
  business: BUSINESS_CATEGORIES
};
localStorage.setItem('financialReportCategories', JSON.stringify(data));
```

#### UI Components
- **Statistics Dashboard**: Show total categories, keywords, business categories, average keywords per category
- **Add New Category Form**: Name input, keywords input (comma-separated), business checkbox
- **Save Status Alerts**: Toast notifications for save confirmations
- **Confirmation Dialogs**: Prevent accidental deletions

### Integration with Financial Reporter

The Category Manager must be fully compatible with the Financial Reporter:

1. **Shared Data Format**: Both tools use identical localStorage structure
2. **Real-time Updates**: Changes in Category Manager immediately affect Financial Reporter
3. **Keyword Prioritization**: Categories processed in order (first match wins)
4. **Case Insensitive Matching**: All keyword comparisons use lowercase

### User Experience Flow

1. **Initial Setup**: User opens Category Manager, sees default categories
2. **Customization**: User adds/removes keywords based on their banking patterns
3. **Business Marking**: User marks appropriate categories as business deductible
4. **Save Changes**: User clicks Save to persist customizations
5. **Use Reporter**: User switches to Financial Reporter to process CSV files
6. **Iterative Improvement**: User returns to Category Manager to refine rules

## Landing Page (index.html)

Build a professional landing page that serves as the entry point to the financial reporting suite.

### Landing Page Requirements

**Purpose**: Provide a central hub for accessing all tools with clear documentation and quick start guidance.

### Features Required

#### 1. Hero Section
- **Tool Suite Overview**: Clear description of the complete financial reporting solution
- **Quick Access Buttons**: Direct links to Financial Reporter and Category Manager
- **Visual Appeal**: Professional design with consistent branding

#### 2. Tool Descriptions
- **Financial Reporter Card**: 
  - Description of CSV processing and report generation
  - Key features: multi-file upload, categorization, business deductions
  - "Launch Reporter" button
- **Category Manager Card**:
  - Description of customization capabilities  
  - Key features: keyword management, business categories, import/export
  - "Launch Category Manager" button

#### 3. Quick Start Guide
- **Step-by-Step Workflow**:
  1. Customize categories (optional but recommended)
  2. Upload CSV files from banks/credit cards
  3. Review generated reports
  4. Export or print results

#### 4. Documentation Links
- **CSV Format Examples**: Link to supported CSV formats
- **Feature Overview**: List of all capabilities
- **Business Deduction Guide**: Tax-focused information

#### 5. Technical Information
- **Browser Requirements**: Modern browsers, no server required
- **Privacy Notice**: All processing happens locally, no data uploaded
- **Open Source**: Link to source code repository

## Complete Financial Reporter Tool

Build the main Financial Reporter (`financial-reporter.html`) as specified in the original requirements, with these additional enhancements:

### Enhanced Integration Features

#### 1. Category Configuration Loading
```javascript
// Load customized categories from Category Manager
function loadCustomCategories() {
  const saved = localStorage.getItem('financialReportCategories');
  if (saved) {
    const data = JSON.parse(saved);
    CATEGORIES = data.categories || DEFAULT_CATEGORIES;
    CATEGORY_KEYWORDS = data.keywords || DEFAULT_KEYWORDS;
    BUSINESS_CATEGORIES = data.business || DEFAULT_BUSINESS;
  }
}
```

#### 2. Category Management Integration  
- **Link to Category Manager**: Prominent button to open Category Manager in new tab
- **Configuration Status**: Show whether default or customized categories are being used
- **Quick Category Info**: Display count of active categories and business deductions

#### 3. Enhanced Debugging for Categories
- **Category Match Details**: Show which keywords triggered each categorization
- **Unmatched Transactions**: Highlight transactions that fell through to "Unclassified"
- **Keyword Performance**: Statistics on which keywords are most/least used

## Deployment and Sharing Instructions

### For Users Downloading/Cloning

#### Quick Start
1. **Download**: Clone repository or download all HTML files
2. **No Installation**: Open any HTML file in modern web browser
3. **Local Processing**: All data processing happens in browser, no server required
4. **Privacy**: No data leaves your computer

#### File Structure
```
financial-report/
├── index.html              # Landing page - start here
├── financial-reporter.html # Main CSV processing tool  
├── category-manager.html   # Category customization tool
├── sample_csv/             # Example CSV files
└── AGENT_INSTRUCTIONS.md   # This file
```

#### Usage Workflow
1. **Optional**: Open `category-manager.html` to customize categories for your banks
2. **Required**: Open `financial-reporter.html` to upload CSV files and generate reports
3. **Reference**: Use `index.html` as central hub and documentation

### For Developers/Contributors

#### Technology Stack
- **Frontend Only**: HTML5, CSS3, JavaScript/TypeScript
- **Frameworks**: Bootstrap 5 for UI, no external dependencies for core logic
- **Storage**: Browser localStorage for persistence
- **Build**: TypeScript compilation optional (include both .ts and .js versions)

#### Development Setup
1. Clone repository
2. Open HTML files directly in browser for testing
3. Use TypeScript compiler if modifying .ts files: `tsc financial-reporter.ts`
4. Test with sample CSV files in `sample_csv/` directory

#### Customization Points
- **Categories**: Modify default categories and keywords in Category Manager
- **Report Styling**: Update CSS in Financial Reporter for custom branding
- **CSV Parsing**: Extend header detection logic for new bank formats
- **Export Formats**: Add new export options (PDF, Excel, etc.)

### Publishing Options

#### 1. GitHub Pages
- Fork repository
- Enable GitHub Pages in repository settings
- Share `https://username.github.io/financial-report/` URL

#### 2. Static Hosting
- Upload all HTML files to any static hosting service
- No server-side processing required
- Works with Netlify, Vercel, AWS S3, etc.

#### 3. Local Distribution
- Package all files in ZIP archive
- Recipients can extract and open `index.html`
- No installation or technical setup required

#### 4. Corporate Deployment
- Host on internal servers
- Customize branding and categories for organization
- Add corporate-specific expense categories and keywords

## Success Criteria

### Functional Requirements
- **Complete Suite**: All three tools (Landing, Reporter, Category Manager) working together
- **Data Persistence**: Categories and customizations saved between sessions
- **CSV Processing**: Handles multiple bank CSV formats automatically
- **Report Generation**: Comprehensive reports with business deductions
- **User Experience**: Intuitive workflow from customization to reporting

### Technical Requirements  
- **Single File Deployment**: Each tool is a standalone HTML file
- **No Server Dependencies**: Runs entirely in browser
- **Cross-Browser Compatible**: Works in Chrome, Firefox, Safari, Edge
- **Mobile Responsive**: Usable on tablets and phones
- **Performance**: Handles large CSV files (thousands of transactions)

### Documentation Requirements
- **Clear Instructions**: Step-by-step guidance for non-technical users
- **Developer Documentation**: Technical details for customization
- **Example Data**: Sample CSV files for testing
- **Sharing Guidelines**: Multiple deployment and distribution options

Build this as a complete, production-ready financial reporting suite that non-technical users can download, customize, and use immediately, while also providing developers with clear customization and extension points.