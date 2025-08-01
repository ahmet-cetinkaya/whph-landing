# WHPH Design System Documentation

## Overview

WHPH (Work Hard Play Hard) is a comprehensive productivity application with a modern, adaptive design system built on Flutter's Material Design 3 principles. The design emphasizes clarity, accessibility, and user focus while maintaining visual consistency across all platforms (Android, Windows, and Linux).

### Design Philosophy

- **Dark Mode Only**: Exclusively uses dark theme for optimal focus and reduced eye strain
- **Dynamic Colors**: Material You integration with custom accent color support
- **Accessibility First**: High contrast ratios and clear visual hierarchy
- **Minimalist Approach**: Clean interfaces that reduce cognitive load
- **Consistent Spacing**: Systematic spacing scale for visual harmony

## Color System

### Primary Colors

The application uses a golden yellow as its primary brand color, with support for dynamic theming:

- **Default Primary**: `#F4D03E` (Golden Yellow)
- **Dynamic Colors**: Material You integration when enabled
- **Custom Accent**: User-configurable accent colors

### Surface Colors

#### Dark Theme (Only)
- **Surface 0** (Background): `#000000` - Pure black background
- **Surface 1** (Primary Surface): `#121212` - Dark surface
- **Surface 2** (Cards/Containers): `#181818` - Dark surface variant for cards
- **Surface 3** (Elevated Surfaces): `#202020` - Dark surface for elevated content

### Text Colors

#### Dark Theme (Only)
- **Primary Text**: `#FFFFFF` - Pure white text
- **Secondary Text**: `#B0B0B0` - Secondary gray for supporting content
- **Light Text**: `#FFFFFF` - Pure white
- **Dark Text**: `#000000` - Pure black

### Semantic Colors

Static colors that maintain consistency across themes:

- **Success**: `#4CAF50` - Green for positive actions and states
- **Warning**: `#FFC107` - Amber for caution and alerts
- **Error**: `#F44336` - Red for errors and destructive actions
- **Info**: `#2196F3` - Blue for informational content
- **Disabled**: `#9E9E9E` - Gray for disabled elements

### Chart Colors

A carefully curated palette for data visualization:

1. `#2E7D32` - Forest Green
2. `#1565C0` - Deep Blue
3. `#FF8F00` - Orange
4. `#C62828` - Deep Red
5. `#6A1B9A` - Purple
6. `#00838F` - Teal
7. `#4E342E` - Brown
8. `#37474F` - Blue Gray
9. `#558B2F` - Light Green
10. `#9E9D24` - Lime

### UI Accent Colors (Dark Theme Only)

- **Border**: `#282828` - Dark theme border color
- **Shadow**: Not used (dark theme relies on surface differentiation)
- **Hover**: `#0A000000` - Subtle hover state
- **Focus**: `#1F000000` - Focus indicator
- **Splash**: `#1F000000` - Touch feedback
- **Divider**: `#282828` - Dark theme dividers

## Typography

### Font Scale

The typography system uses a consistent scale with optimal line heights:

- **XX-Small**: 10px
- **X-Small**: 11px  
- **Small**: 12px
- **Medium**: 14px (Base size)
- **Large**: 16px
- **X-Large**: 20px
- **XX-Large**: 24px

### Text Styles

#### Body Text
- **Body X-Small**: 11px, line-height 1.5
- **Body Small**: 12px, line-height 1.5
- **Body Medium**: 14px, line-height 1.5 (Default body text)
- **Body Large**: 16px, line-height 1.5, weight 500

#### Headlines
- **Headline Small**: 16px, bold, line-height 1.3
- **Headline Medium**: 20px, bold, line-height 1.3
- **Headline Large**: 28px, bold, line-height 1.2

#### Display Text
- **Display Small**: 16px, bold
- **Display Large**: 48px, bold, line-height 1.1

#### Labels
- **Label X-Small**: 10px, weight 500, letter-spacing 0.5
- **Label Small**: 12px, weight 500, letter-spacing 0.5
- **Label Medium**: 14px, weight 500, letter-spacing 0.5
- **Label Large**: 16px, weight 500, letter-spacing 0.5

## Component Library

### Buttons

#### Filled Buttons (Primary)
- **Background**: Primary color or Surface 3 (disabled)
- **Text**: Contrasting color based on background
- **Padding**: 16px horizontal, 12px vertical
- **Border Radius**: 12px
- **Typography**: 16px, weight 600, letter-spacing 0.5

#### Outlined Buttons (Secondary)
- **Border**: Primary color (1.5px) or disabled color (1px)
- **Text**: Primary color or secondary text (disabled)
- **Padding**: 16px horizontal, 12px vertical
- **Border Radius**: 12px
- **Typography**: 16px, weight 600, letter-spacing 0.5

#### Text Buttons (Tertiary)
- **Text**: Primary color or secondary text (disabled)
- **Padding**: 16px horizontal, 12px vertical
- **Border Radius**: 12px
- **Typography**: 16px, weight 600, letter-spacing 0.5

### Cards

- **Background**: Surface 2
- **Border Radius**: 12px
- **Elevation**: 0 (dark theme only)
- **Shadow**: None (dark theme uses surface color differentiation)
- **Margin**: Zero (handled by parent containers)
- **Clip Behavior**: Anti-alias

### Input Fields

- **Border**: None (uses Material 3 filled style)
- **Background**: Transparent
- **Content Padding**: 12px all sides
- **Text Style**: Body Medium
- **Hint Style**: Body Medium with 60% opacity

### Icons

#### Icon Sizes
- **2X-Small**: 8px
- **X-Small**: 12px
- **Small**: 16px
- **Medium**: 20px (Default)
- **Large**: 32px
- **X-Large**: 48px
- **2X-Large**: 64px
- **3X-Large**: 96px

### Chips and Tags

- **Border Radius**: 12px
- **Padding**: 4px horizontal, 4px vertical
- **Selected State**: Primary color with 20% opacity
- **Typography**: Compact visual density

## Layout System

### Spacing Scale

Consistent spacing system based on 4px grid:

- **4X-Small**: 1px
- **3X-Small**: 2px
- **2X-Small**: 4px
- **X-Small**: 6px
- **Small**: 8px
- **2-Small**: 10px
- **Medium**: 12px (Base unit)
- **Large**: 16px
- **X-Large**: 24px
- **2X-Large**: 32px
- **3X-Large**: 36px
- **4X-Large**: 48px

### Container Standards

- **Border Radius**: 15px (standard containers)
- **Padding**: 12px (medium spacing)
- **Card Padding**: 12px horizontal, 8px vertical

### Button Sizing

- **2X-Small**: 20px height
- **X-Small**: 24px height
- **Small**: 28px height
- **Medium**: 36px height
- **Large**: 44px height

### Responsive Breakpoints

- **Small**: 320px (Mobile portrait)
- **Medium**: 768px (Tablet)
- **Large**: 1024px (Desktop)
- **X-Large**: 1440px (Large desktop)

## Visual Patterns

### Elevation and Shadows

- **Dark Theme Only**: No shadows, relies on surface color differentiation
- **Card Elevation**: 0dp (dark theme only)

### State Indicators

- **Success States**: Green checkmark icons and text
- **Loading States**: Primary color indicators
- **Error States**: Red error color with appropriate icons
- **Disabled States**: Reduced opacity and muted colors

### Data Visualization

- **Charts**: Use the 10-color chart palette
- **Progress Indicators**: Primary color with background track
- **Time Distribution**: Pie charts with distinct color segments

## Accessibility

### Color Contrast

- **Primary Text**: Meets WCAG AA standards (4.5:1 minimum)
- **Secondary Text**: Maintains readability with sufficient contrast
- **Interactive Elements**: Clear focus indicators and touch targets

### Touch Targets

- **Minimum Size**: 44px for interactive elements
- **Button Heights**: Range from 20px to 44px based on importance
- **Icon Buttons**: 20px minimum touch target

### Visual Hierarchy

- **Typography Scale**: Clear size differentiation between content levels
- **Color Usage**: Consistent semantic meaning across the application
- **Spacing**: Logical grouping and separation of content

## Implementation Notes

### Theme Service

The application uses a sophisticated theme service that:
- Exclusively uses dark mode for optimal user experience
- Integrates with Material You dynamic colors
- Allows custom accent color selection
- Maintains consistent dark surface colors

### Material 3 Integration

- **useMaterial3**: true
- **Color Scheme**: Custom implementation with fixed surface colors
- **Component Theming**: Comprehensive theming for all Material components
- **Dynamic Color Support**: Optional Material You integration

This design system ensures visual consistency, accessibility, and a premium user experience across all supported platforms while maintaining the flexibility for user customization and system integration.
