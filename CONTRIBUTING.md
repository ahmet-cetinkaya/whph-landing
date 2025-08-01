# Contributing to WHPH Landing Page

Thanks for your interest in contributing! This is the landing page for the WHPH productivity app.

## 🚀 Development Setup

### Prerequisites
- [Bun](https://bun.sh/) or [Node.js](https://nodejs.org/) 18+
- Git

### Getting Started

```bash
# Clone and setup
git clone https://github.com/YOUR_USERNAME/whph-landing.git
cd whph-landing/src/presentation/web

# Install dependencies
bun install

# Start development server
bun run dev
```

Visit `http://localhost:4321` to see the landing page.

### Build Commands
- `bun run dev` - Development server
- `bun run build` - Build for production
- `bun run preview` - Preview production build

## 🎨 Design Guidelines

Follow the [WHPH Design System](docs/DESIGN-SYSTEM.md):
- **Primary Color**: #F4D03E (Golden Yellow)
- **Typography**: 14px base, 1.5 line height
- **Spacing**: 4px grid system
- Use Tailwind CSS classes

## 🔄 How to Contribute

1. **Fork** the repository
2. **Create a branch**: `git checkout -b feature/your-feature`
3. **Make changes** following design guidelines
4. **Test** on mobile and desktop
5. **Submit** a pull request

### What We Need
- Performance improvements
- Mobile-first responsive design
- Accessibility fixes
- Better content and copy

## 📋 Code Style

- Use semantic HTML
- Follow Tailwind CSS patterns
- Keep JavaScript minimal
- Maintain accessibility (WCAG AA)
- Test on Chrome, Firefox, Safari

## 🚀 Deployment

The site auto-deploys to GitHub Pages when you push to `main`.

## 🙏 Thank You!