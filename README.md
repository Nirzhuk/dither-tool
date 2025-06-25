# Dither Tool 🎨

A modern, interactive web application for creating stunning dithered images with advanced export capabilities. Transform your photos into beautiful, retro-style artwork with multiple dithering algorithms and real-time preview.

![Dither SVG Demo](https://img.shields.io/badge/Status-Active-brightgreen)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-15.3-black)
![React](https://img.shields.io/badge/React-19.0-blue)

## ✨ Features

### 🎯 **Advanced Dithering Algorithms**
- **Floyd-Steinberg** - Classic error diffusion algorithm
- **Atkinson** - Apple's preferred dithering method
- **Burkes** - Enhanced error distribution pattern
- **Sierra** - Multi-level error diffusion
- **Sierra Lite** - Simplified Sierra algorithm
- **Stucki** - High-quality error diffusion
- **Bayer (Ordered)** - Pattern-based dithering

### 🎨 **Real-time Image Processing**
- **Exposure Control** - Adjust exposure (-100 to +100 EV)
- **Pixelation Control** - Scale from 1x to 50x
- **Detail Enhancement** - Sharpen details (0-10)
- **Brightness Adjustment** - -100 to +100 range
- **Midtones Control** - Gamma correction (0-2)
- **Noise Addition** - Add texture (0-100)
- **Glow Effect** - Soft blur overlay (0-100)
- **Serpentine Scanning** - Alternative processing order

### 📤 **Multi-format Export**
- **PNG** - Lossless raster format
- **JPEG** - Compressed raster format
- **WebP** - Modern web-optimized format
- **SVG** - Vector format with advanced compression

### 🚀 **Optimized SVG Export**
- **Quadtree Compression** - Groups similar regions
- **Path Optimization** - Connected component analysis
- **Run-length Encoding** - Merges adjacent pixels
- **Adaptive Compression** - Auto-selects best strategy
- **File Size Reduction** - Up to 95% smaller files

### 🎮 **User Experience**
- **Drag & Drop** - Intuitive image upload
- **Real-time Preview** - Instant visual feedback
- **Responsive Design** - Works on all devices
- **Loading States** - Progress indicators
- **Error Handling** - Graceful fallbacks

## 🛠️ Technology Stack

- **Framework**: Next.js 15.3 with React 19
- **Language**: TypeScript 5.0
- **Styling**: Tailwind CSS 4.0
- **State Management**: Zustand
- **UI Components**: Radix UI + Custom components
- **Build Tool**: Turbopack
- **Linting**: Biome
- **Package Manager**: pnpm

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/nirzhuk/dither-tool.git
   cd dither-tool
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Start development server**
   ```bash
   pnpm dev
   # or
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
# Build the application
pnpm build

# Start production server
pnpm start
```

## 📖 Usage Guide

### Basic Workflow

1. **Upload Image**
   - Drag and drop an image onto the canvas
   - Or click to select a file from your device
   - Supports all common image formats (PNG, JPEG, WebP, etc.)

2. **Adjust Settings**
   - **Algorithm**: Choose your preferred dithering method
   - **Exposure**: Adjust exposure levels (-100 to +100 EV)
   - **Pixelation**: Control the level of pixelation (1-50)
   - **Detail Enhancement**: Sharpen or soften details (0-10)
   - **Brightness**: Adjust overall brightness (-100 to +100)
   - **Midtones**: Control gamma correction (0-2)
   - **Noise**: Add texture and grain (0-100)
   - **Glow**: Apply soft blur effect (0-100)
   - **Serpentine**: Enable alternative scanning pattern

3. **Export**
   - Select your preferred format (PNG, JPEG, WebP, SVG)
   - Click "Export" to download your dithered image
   - For SVG exports, the system will automatically optimize file size

### Advanced Features

#### SVG Optimization
The SVG export uses multiple compression strategies:

1. **Quadtree Decomposition** - Groups uniform regions
2. **Connected Components** - Finds and optimizes connected areas
3. **Run-length Encoding** - Merges adjacent pixels
4. **Adaptive Compression** - Auto-selects best method

#### Algorithm Selection
Each dithering algorithm produces different results:

- **Floyd-Steinberg**: Best for most images, classic look
- **Atkinson**: Good for portraits, less noise
- **Burkes**: Enhanced detail preservation
- **Sierra**: High-quality, more processing time
- **Sierra Lite**: Faster, good quality
- **Stucki**: Excellent for high-contrast images
- **Bayer**: Pattern-based, good for gradients

## 🏗️ Project Structure

```
dither-tool/
├── src/
│   ├── app/                    # Next.js app directory
│   │   └── page.tsx           # Main application page
│   ├── components/            # React components
│   │   ├── options-panel/     # Modular options components
│   │   │   ├── algorithm-selector.tsx
│   │   │   ├── slider-control.tsx
│   │   │   ├── checkbox-control.tsx
│   │   │   ├── export-section.tsx
│   │   │   └── action-buttons.tsx
│   │   ├── playground.tsx     # Image upload and display
│   │   └── ui/               # Reusable UI components
│   └── lib/                  # Core functionality
│       ├── dither.ts         # Dithering algorithms
│       ├── store.ts          # State management
│       └── utils.ts          # Utility functions
├── public/                   # Static assets
├── package.json             # Dependencies and scripts
└── README.md               # This file
```

## 🔧 Development

### Available Scripts

```bash
# Development
pnpm dev          # Start development server with Turbopack
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run Biome linter

# Type checking
npx tsc --noEmit  # Check TypeScript types
```

### Code Style

This project uses:
- **Biome** for linting and formatting
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Component-based architecture** for maintainability

### Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📊 Performance

### SVG Optimization Results
- **Small images** (< 100KB): 90-95% size reduction
- **Medium images** (100KB-1MB): 80-90% size reduction
- **Large images** (> 1MB): 70-85% size reduction

### Browser Compatibility
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

1. Fork and clone the repository
2. Install dependencies: `pnpm install`
3. Start development server: `pnpm dev`
4. Make your changes
5. Run tests and linting: `pnpm lint`
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Dithering Algorithms**: Based on classic computer graphics research
- **SVG Optimization**: Inspired by modern vector graphics techniques
- **UI Components**: Built with Radix UI primitives
- **Styling**: Powered by Tailwind CSS

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/nirzhuk/dither-tool/issues)
- **Discussions**: [GitHub Discussions](https://github.com/nirzhuk/dither-tool/discussions)
- **Email**: your.email@example.com

---

**Made with ❤️ by Nirzhuk**

*Transform your images into stunning dithered artwork with the power of modern web technologies.*
