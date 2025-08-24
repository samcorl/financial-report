# Financial Reporting Suite

A comprehensive web-based financial reporting tool suite that processes CSV transaction data from banks and credit cards to generate detailed expense analysis reports with business deduction tracking and customizable categorization.

## 🎯 Quick Start

1. **Download** this repository or clone it locally
2. **Open** `index.html` in your web browser to get started
3. **Optional**: Customize categories in `category-manager.html` for your specific banks
4. **Upload** your CSV files in `financial-reporter.html` to generate reports

**No installation required** - runs entirely in your browser with complete privacy.

## 🛠️ What's Included

### 📊 Financial Reporter (`financial-reporter.html`)
The main tool that processes CSV files and generates comprehensive reports:
- **Multi-file CSV processing** with automatic format detection
- **Intelligent categorization** of transactions using keywords
- **Business deduction tracking** for tax purposes  
- **Detailed debugging** with extensive console logging
- **Professional reports** with Bootstrap styling and print support
- **Income vs expense breakdown** with interest paid summaries

### ⚙️ Category Manager (`category-manager.html`) 
Administrative interface for customizing transaction categorization:
- **Visual category management** with drag-and-drop interface
- **Keyword customization** - add/remove keywords for better accuracy
- **Business category marking** for tax deductible expenses
- **Import/Export** category configurations
- **Real-time search** and filtering
- **Statistics dashboard** showing category performance

### 🏠 Landing Page (`index.html`)
Central hub providing access to all tools with documentation and guidance:
- **Tool overview** and feature descriptions
- **Quick start guide** with step-by-step instructions  
- **CSV format examples** and compatibility information
- **Privacy and security** information

## 💡 Key Features

### 🔒 Privacy First
- **100% local processing** - no data leaves your computer
- **No server required** - works offline after initial load
- **No account registration** or cloud services needed

### 🎨 User-Friendly Design
- **Responsive Bootstrap UI** works on desktop, tablet, and mobile
- **Drag-and-drop file upload** with progress indicators
- **Professional report styling** optimized for viewing and printing
- **Intuitive navigation** between tools

### 💼 Business-Ready Features  
- **Tax deduction tracking** with business category marking
- **Interest paid summaries** for tax preparation
- **Comprehensive expense categorization** with 25+ default categories
- **Large expense highlighting** (transactions over $200)
- **Multi-format CSV support** for different banks and credit cards

### 🔧 Developer-Friendly
- **Single HTML files** - no build process or dependencies
- **Embedded TypeScript/JavaScript** with full source code
- **Extensible architecture** for adding new features
- **LocalStorage persistence** for user customizations

## 📁 File Structure

```
financial-report/
├── index.html                 # 🏠 Landing page - start here
├── financial-reporter.html    # 📊 Main CSV processing tool  
├── category-manager.html      # ⚙️ Category customization
├── financial-reporter.ts      # TypeScript source (optional)
├── financial-reporter.js      # Compiled JavaScript
├── sample_csv/                # 📋 Example CSV files for testing
│   ├── sample-bank-format1.csv
│   ├── sample-credit-format2.csv
│   └── sample-complex-format3.csv
├── AGENT_INSTRUCTIONS.md      # 🤖 Detailed build instructions
├── README.md                  # 📖 This file
└── LICENSE                    # ⚖️ License information
```

## 🚀 Supported CSV Formats

The tool automatically detects and handles various CSV formats from different financial institutions:

### Format 1: Separate Debit/Credit Columns
```csv
Date,Description,Debit,Credit
1/15/25,Amazon Web Services,29.99,
1/14/25,Direct Deposit Salary,,4500.00
```

### Format 2: Single Amount Column  
```csv
Transaction Date,Merchant,Amount
01/15/2025,AWS Cloud Services,-29.99
01/14/2025,Payroll Deposit,4500.00
```

### Format 3: Quoted Amounts with Commas
```csv
"Date","Description","Amount","Balance" 
"1/15/25","Amazon Web Services","$29.99","$1,234.56"
"1/14/25","Direct Deposit","$4,500.00","$5,734.56"
```

**Flexible header detection** automatically maps common variations like:
- Date fields: "Date", "Transaction Date", "Posted Date"
- Amount fields: "Amount", "Debit", "Credit", "Transaction Amount"  
- Description fields: "Description", "Merchant", "Transaction Details"

## 📈 Default Categories

The system includes 25+ pre-configured expense categories with extensive keyword matching:

### 💼 Business Categories (Tax Deductible)
- **Office Technology** - Microsoft, Adobe, Zoom, LinkedIn subscriptions
- **Web Hosting** - AWS, GoDaddy, Google Cloud services
- **Office Supplies** - Staples, business memberships, software subscriptions

### 🏠 Personal Expense Categories  
- **Auto** - Gas stations, car maintenance, tolls, parking
- **Groceries** - Supermarkets, Whole Foods, Costco, Target
- **Restaurants** - Dining out, coffee shops, delivery services
- **Utilities** - Electric, gas, internet, phone bills
- **Healthcare** - Medical, dental, pharmacy, insurance
- **Travel** - Hotels, flights, Uber/Lyft, public transportation
- **Entertainment** - Movies, streaming services, concerts
- *...and many more*

### 💰 Income Categories
- **Salary Income** - Payroll, direct deposits, wages
- **Other Income** - Freelance, side projects, miscellaneous income
- **Transfers** - Internal account movements (excluded from totals)

## 🎯 Usage Examples

### Basic Workflow
1. **Download your bank CSV files** (checking, savings, credit cards)
2. **Optional**: Open Category Manager to add keywords specific to your spending patterns
3. **Open Financial Reporter** and drag/drop your CSV files  
4. **Review the generated report** with categorized expenses and business deductions
5. **Print or save the report** for your records or tax preparation

### Customization Example
If you frequently shop at "Joe's Market" but it's not being categorized as groceries:
1. Open **Category Manager**
2. Find the **Groceries** category  
3. Add **"joe's market"** to the keywords list
4. Click **Save Changes**
5. Return to **Financial Reporter** - future uploads will now categorize Joe's Market correctly

### Business Use Case
For freelancers and small business owners:
1. Use **Category Manager** to mark relevant categories as "Business"
2. Add business-specific keywords (your coworking space, business travel vendors, etc.)
3. Generate reports that automatically separate business vs personal expenses
4. Use the **Business Deductions** section for tax preparation

## 🛠️ Technical Requirements

### Browser Compatibility
- **Chrome** 90+ (recommended)
- **Firefox** 88+
- **Safari** 14+  
- **Edge** 90+

### System Requirements
- **JavaScript enabled** (required for all functionality)
- **LocalStorage support** (for saving customizations)
- **File API support** (for CSV upload - standard in all modern browsers)

### Privacy & Security
- **No data transmission** - all processing happens locally in your browser
- **No cookies or tracking** - completely privacy-focused
- **No external API calls** - works completely offline after initial load
- **LocalStorage only** - customizations saved locally on your device

## 🔧 Development & Customization

### For Developers
This project uses vanilla JavaScript with TypeScript source files available. No build tools required for basic usage.

**Compile TypeScript** (optional):
```bash
tsc financial-reporter.ts
```

**Customize Categories**: 
- Edit the default categories in `category-manager.html`
- Modify keyword lists for your specific use case
- Add new expense categories as needed

**Extend CSV Parsing**:
- Update header detection logic in the Financial Reporter
- Add support for new bank CSV formats
- Customize amount parsing for different currency formats

### Deployment Options

#### 🌐 Web Hosting
Upload all HTML files to any static hosting service:
- **GitHub Pages** - Free hosting directly from repository
- **Netlify/Vercel** - Drag and drop deployment  
- **AWS S3** - Static website hosting
- **Your own web server** - No server-side processing required

#### 💾 Local Distribution
Package the files for offline use:
```bash
# Create distribution package
zip -r financial-reporting-suite.zip *.html sample_csv/ README.md LICENSE
```

Recipients can extract and open `index.html` - no installation required.

## 🤝 Contributing

This is an open-source project. Contributions welcome!

### Areas for Enhancement
- **Additional CSV formats** for more banks and countries
- **Export options** (PDF, Excel, additional formats)
- **More expense categories** and keyword refinements  
- **UI/UX improvements** and accessibility features
- **Mobile app** version using web technologies
- **Integration APIs** for accounting software

### Development Setup
1. Clone the repository
2. Open HTML files directly in browser for testing
3. Use sample CSV files in `sample_csv/` directory for development
4. Submit pull requests with improvements

## 📄 License

This project is open source. See [LICENSE](LICENSE) for details.

## 🆘 Support & FAQ

### Common Issues

**Q: My bank's CSV format isn't recognized**
A: The tool auto-detects most formats, but you can customize the header detection logic in the Financial Reporter source code.

**Q: Transactions aren't categorizing correctly**  
A: Use the Category Manager to add specific keywords from your transaction descriptions. The system matches keywords case-insensitively.

**Q: Can I use this with non-US currencies?**
A: Yes, the amount parsing handles various currency symbols and formats. You may need to add currency-specific keywords.

**Q: Is my financial data secure?**
A: Absolutely. All processing happens locally in your browser. No data is transmitted anywhere.

**Q: Can I share my category customizations?**
A: Yes! Use the Export feature in Category Manager to save your configurations, then share the JSON file with others.

### Getting Help

- **Check the sample CSV files** in `sample_csv/` directory for format examples
- **Review the AGENT_INSTRUCTIONS.md** for detailed technical specifications  
- **Open browser developer tools** for debugging information (the tool logs extensively to console)
- **Create an issue** in the repository for bugs or feature requests

---

**Built for privacy, designed for simplicity, optimized for accuracy.** 

*Transform your financial CSV chaos into organized, actionable reports in minutes.*