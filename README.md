# Arab Stock AI Metadata Generator - Browser Extension

🤖 **Professional bilingual metadata generator for Arab Stock contributors with OpenAI & Gemini AI integration**

## Features

- **🎯 AI-Powered Generation**: OpenAI GPT-4 & Google Gemini integration
- **🌍 Bilingual Support**: Generate titles & keywords in English and Arabic
- **📸 Image Analysis**: AI analyzes uploaded images for context-aware metadata
- **🚀 Auto-Fill**: Automatically fill Arab Stock upload forms
- **📂 20+ Categories**: Specialized for Middle Eastern content
- **💾 Smart Storage**: Securely save API keys and preferences
- **⌨️ Keyboard Shortcuts**: Fast workflow with hotkeys
- **🎨 Modern UI**: Clean, responsive interface

## Installation Steps

### Method 1: Install from Chrome Web Store (Recommended)
*Coming soon - extension will be published to Chrome Web Store*

### Method 2: Manual Installation (Developer Mode)

1. **Download Extension Files**
   ```bash
   # Create extension folder
   mkdir arab-stock-ai-extension
   cd arab-stock-ai-extension
   ```

2. **Save Required Files**
   Create these files in your extension folder:
   
   - `manifest.json`
   - `popup.html`
   - `popup.js`
   - `styles.css`
   - `content.js`
   - `content.css`
   - `background.js`

3. **Create Icons Folder**
   ```bash
   mkdir icons
   ```
   Add these icon files in the icons folder:
   - `icon16.png` (16x16 pixels)
   - `icon32.png` (32x32 pixels)  
   - `icon48.png` (48x48 pixels)
   - `icon128.png` (128x128 pixels)

4. **Install in Chrome/Edge**
   - Open Chrome/Edge browser
   - Go to `chrome://extensions/` (or `edge://extensions/`)
   - Enable "Developer mode" (top right toggle)
   - Click "Load unpacked"
   - Select your extension folder
   - The extension will appear in your browser toolbar

## Setup Guide

### 1. Get API Keys

**For OpenAI:**
1. Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign in or create account
3. Click "Create new secret key"
4. Copy the API key (starts with `sk-`)

**For Google Gemini:**
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with Google account
3. Click "Create API key"
4. Copy the API key

### 2. Configure Extension

1. Click the extension icon in your browser
2. Select AI provider (OpenAI or Gemini)
3. Enter your API key
4. Choose default category and style preferences

### 3. Usage Instructions

#### Basic Workflow:
1. **Upload Image**: Drag & drop or browse image file
2. **Select Category**: Choose from 20+ Arab Stock categories
3. **Add Description**: Optional context for better results
4. **Generate**: Click "Generate" for AI metadata
5. **Review Results**: Switch between English/Arabic tabs
6. **Copy/Export**: Use copy buttons or export JSON

#### Auto-Fill on Arab Stock:
1. Navigate to [Arab Stock Contributor](https://contributor.arabsstock.com/en/warehouse?type=Images)
2. Open upload form
3. Use extension to generate metadata
4. Click "Auto Fill" button
5. Extension automatically populates form fields

## File Structure

```
arab-stock-ai-extension/
├── manifest.json           # Extension configuration
├── popup.html             # Main interface
├── popup.js               # Main logic & AI integration
├── styles.css             # Extension styling
├── content.js             # Arab Stock page integration
├── content.css            # Content script styles
├── background.js          # Service worker
├── icons/                 # Extension icons
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   └── icon128.png
└── README.md             # This file
```

## API Usage & Costs

### OpenAI Pricing (as of 2024):
- **GPT-4**: ~$0.03 per 1K tokens
- **GPT-4 Vision**: ~$0.01-0.04 per image
- **Estimated cost**: $0.05-0.10 per metadata generation

### Gemini Pricing:
- **Gemini Pro**: Free tier available (60 requests/minute)
- **Gemini Pro Vision**: Free tier available
- **Estimated cost**: Free for moderate usage

## Keyboard Shortcuts

- `Ctrl+G` - Generate metadata
- `Ctrl+K` - Focus API key field  
- `Ctrl+1` - Switch to English results
- `Ctrl+2` - Switch to Arabic results
- `Ctrl+E` - Export metadata

## Categories Supported

- People & Lifestyle
- Business & Finance  
- Technology & Innovation
- Culture & Heritage
- Architecture & Buildings
- Nature & Landscapes
- Food & Cuisine
- Travel & Tourism
- Education & Learning
- Healthcare & Medical
- Fashion & Beauty
- Sports & Recreation
- Islamic & Religious
- Transportation
- Shopping & Retail
- Events & Celebrations
- Abstract & Concepts
- Animals & Pets
- Home & Interior
- Industrial & Manufacturing

## Troubleshooting

### Common Issues:

**1. "API key invalid" error**
- Check API key is correct (starts with `sk-` for OpenAI)
- Ensure API key has sufficient credits
- Try regenerating API key

**2. "Auto-fill not working"**
- Ensure you're on contributor.arabsstock.com
- Check if form fields are loaded
- Try refreshing the page and retry

**3. "Extension not loading"**
- Check all files are in correct folder
- Ensure manifest.json is valid
- Try reloading extension in chrome://extensions

**4. "No metadata generated"**
- Check internet connection
- Verify API key and credits
- Try with different image or description

### Debug Mode:
1. Open browser Developer Tools (F12)
2. Check Console tab for error messages
3. Check Network tab for API request issues

## Security & Privacy

- **API Keys**: Stored locally in browser, never sent to our servers
- **Images**: Processed by AI providers (OpenAI/Google) according to their privacy policies
- **No Tracking**: Extension doesn't collect personal data
- **HTTPS**: All API communications encrypted

## Browser Compatibility

- ✅ Chrome 88+
- ✅ Microsoft Edge 88+
- ✅ Brave Browser
- ✅ Opera 74+
- ❌ Firefox (Manifest v2 only - v3 version coming soon)
- ❌ Safari (WebExtension support limited)

## Updates & Support

### Auto-Updates:
- Extension auto-updates when published to Chrome Web Store
- Manual installation requires re-downloading files

### Get Support:
- Check troubleshooting section above
- Open browser Developer Console for error details
- Ensure you have latest version of files

## Contributing

Want to improve the extension? Here are ways to contribute:

1. **Report Issues**: Found bugs or have suggestions?
2. **Translate**: Help add more language support
3. **Test**: Try with different Arab Stock workflows
4. **Improve AI**: Suggest better prompts for metadata generation

## License

This extension is provided as-is for Arab Stock contributors. 

## Disclaimer

- This extension is not officially affiliated with Arab Stock
- AI-generated content should be reviewed before submission
- Users responsible for API costs and compliance with AI provider terms
- Always verify metadata accuracy and cultural appropriateness

---

**Happy Contributing! 🚀**

*Generate professional metadata for your Arab Stock submissions with the power of AI*
