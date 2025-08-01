# WHPH Landing Page Wireframe Specifications

**Document Version:** 1.0  
**Date:** August 1, 2025  
**Related Document:** PRD-LANDING-PAGE.md

---

## 1. Page Structure Overview

### 1.1 Layout Hierarchy

```
Header (Sticky Navigation)
├── Hero Section
├── Features Section
├── Screenshots Gallery
├── Download Section
├── Social Proof Section
├── FAQ Section
├── About Section (Simplified)
└── Footer (Minimal)
```

### 1.2 Responsive Breakpoints

- **Mobile:** 320px - 767px (Single column layout)
- **Tablet:** 768px - 1023px (Two column layout)
- **Desktop:** 1024px - 1439px (Multi-column layout)
- **Large Desktop:** 1440px+ (Max-width container with margins)

---

## 2. Header Navigation

### 2.1 Desktop Header (1024px+)

```
[WHPH Logo] [Features] [Download] [GitHub]     [Download App CTA]
```

**Specifications:**

- Height: 64px
- Background: Surface 0 with subtle shadow (matching app design)
- Logo: 32px height, left-aligned with 24px margin
- Navigation items: 16px font, 24px spacing between items
- CTA button: Primary filled button with exact app styling, right-aligned with 24px margin

### 2.2 Mobile Header (320px - 767px)

```
[WHPH Logo]                                    [☰ Menu]
```

**Specifications:**

- Height: 56px
- Hamburger menu: 24px icon, expands to full-screen overlay
- Mobile menu items: 20px font, 48px touch targets
- Logo: 28px height for mobile optimization

### 2.3 Sticky Behavior

- Remains visible during scroll
- Subtle background blur effect when scrolled
- Download CTA always accessible
- Smooth scroll to sections when navigation items clicked

---

## 3. Hero Section

### 3.1 Desktop Layout (1024px+)

```
┌─────────────────────────────────────────────────────────────┐
│  [Headline Text - 48px]                    [Hero Image/     │
│  [Subheadline - 20px]                       App Screenshot] │
│  [Download CTA Button]                                      │
│  [Platform Badges: Android | Windows | Linux]               │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Mobile Layout (320px - 767px)

```
┌─────────────────────────────────┐
│        [Hero Image/             │
│         App Screenshot]         │
│                                 │
│    [Headline Text - 32px]       │
│    [Subheadline - 16px]         │
│    [Download CTA Button]        │
│    [Platform Badges]            │
└─────────────────────────────────┘
```

### 3.3 Content Specifications

- **Headline:** "Work Hard, Play Hard—Master Your Productivity"
- **Subheadline:** Value proposition (max 2 lines)
- **CTA Button:** "Download Free Now" - Primary filled button
- **Hero Image:** App screenshot or animated demo (max 600px width)
- **Platform Badges:** Visual indicators for supported platforms

---

## 4. Features Section

### 4.1 Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│                    [Section Title]                          │
│                                                             │
│  [Feature 1]    [Feature 2]    [Feature 3]    [Feature 4]   │
│  [Icon]         [Icon]         [Icon]         [Icon]        │
│  [Title]        [Title]        [Title]        [Title]       │
│  [Description]  [Description]  [Description]  [Description] │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Feature Cards

**Desktop:** 4 columns, 280px width each
**Tablet:** 2 columns, responsive width
**Mobile:** 1 column, full width

### 4.3 Feature Content

1. **Task Management**

   - Icon: Task/checklist icon (48px)
   - Title: "Smart Task Management"
   - Description: Brief benefit-focused copy (max 3 lines)

2. **Habit Tracking**

   - Icon: Calendar/streak icon (48px)
   - Title: "Habit Development"
   - Description: Progress tracking and motivation features

3. **Time Analytics**

   - Icon: Chart/analytics icon (48px)
   - Title: "Time Insights"
   - Description: App usage tracking and productivity analysis

4. **Cross-Platform**
   - Icon: Devices icon (48px)
   - Title: "Everywhere You Work"
   - Description: Seamless experience across all platforms

---

## 5. Screenshots Gallery

### 5.1 Gallery Layout

```
┌─────────────────────────────────────────────────────────────┐
│                    [Gallery Title]                          │
│                                                             │
│  [Screenshot 1] [Screenshot 2] [Screenshot 3] [Screenshot 4]│
│  [Today View]   [Task Detail]  [Habits]      [Analytics]    │
│                                                             │
│              [Navigation Dots/Arrows]                       │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 Screenshot Specifications

- **Desktop:** 4 screenshots visible, horizontal scroll
- **Tablet:** 2-3 screenshots visible, swipe navigation
- **Mobile:** 1 screenshot visible, swipe navigation
- **Image Size:** 300px width, maintain aspect ratio
- **Interaction:** Click to expand in lightbox modal

### 5.3 Screenshot Content

1. **Today View:** Main dashboard with tasks and habits (exact app interface)
2. **Task Management:** Detailed task view with subtasks (actual app screenshot)
3. **Habit Tracking:** Habit progress and streak visualization (real app interface)
4. **Analytics:** Time distribution and productivity charts (actual app charts)

---

## 6. Download Section

### 6.1 Smart Platform Detection

```
┌─────────────────────────────────────────────────────────────┐
│                 [Download Section Title]                    │
│                                                             │
│        [Detected Platform Icon] "We detected you're         │
│         using [Platform Name]"                              │
│                                                             │
│              [Primary Download Button]                      │
│                                                             │
│    [Other Platforms]                                        │
│    [Android] [Windows] [Linux] [F-Droid] [GitHub]           │
└─────────────────────────────────────────────────────────────┘
```

### 6.2 Download Options

- **Primary CTA:** Platform-specific download (largest button)
- **Alternative Downloads:** Smaller buttons for other platforms
- **Special Sources:** F-Droid and GitHub releases highlighted
- **System Requirements:** Expandable section with technical details

---

## 7. Social Proof Section

### 7.1 Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│                   [Social Proof Title]                      │
│                                                             │
│  [Testimonial 1]     [Testimonial 2]     [Testimonial 3]    │
│  [User Avatar]       [User Avatar]       [User Avatar]      │
│  [User Name]         [User Name]         [User Name]        │
│  [User Role]         [User Role]         [User Role]        │
│                                                             │
│              [GitHub Stats] [Download Count]                │
└─────────────────────────────────────────────────────────────┘
```

### 7.2 Content Elements

- **Testimonials:** 3 user quotes with attribution
- **GitHub Metrics:** Star count, fork count, contributors
- **Download Statistics:** Total downloads across platforms
- **Community Indicators:** GitHub Discussions activity

---

## 8. FAQ Section

### 8.1 Accordion Layout

```
┌─────────────────────────────────────────────────────────────┐
│                      [FAQ Title]                            │
│                                                             │
│  ▼ Is WHPH really free?                                     │
│    [Answer content expanded]                                │
│                                                             │
│  ▶ What platforms are supported?                            │
│  ▶ How is my data protected?                                │
│  ▶ Can I contribute to development?                         │
│  ▶ How do I sync data between devices?                      │
└─────────────────────────────────────────────────────────────┘
```

### 8.2 FAQ Content

- **5-7 key questions** addressing common concerns
- **Expandable answers** with detailed explanations
- **Links to documentation** where appropriate
- **Contact information** for additional questions

---

## 9. About Section (Simplified)

### 9.1 Single-Column Layout

```
┌─────────────────────────────────────────────────────────────┐
│                    [About WHPH]                             │
│  [Brief app description and purpose]                        │
│  [Open source values and privacy commitment]                │
│  [GitHub Repository Link]                                   │
│  [GitHub Discussions Link]                                  │
└─────────────────────────────────────────────────────────────┘
```

### 9.2 Content Focus

- **App Purpose:** Brief description of WHPH's core functionality
- **Open Source Values:** Commitment to transparency and community
- **Privacy Stance:** Local-first approach and data ownership
- **Community Link:** GitHub Discussions for support and engagement

---

## 10. Footer (Minimal)

### 10.1 Simplified Footer Structure

```
┌─────────────────────────────────────────────────────────────┐
│  [WHPH Logo]                                                │
│                                                             │
│  [GitHub Repository] [GitHub Discussions] [License]         │
│                                                             │
│              © 2025 WHPH - Open Source Productivity         │
└─────────────────────────────────────────────────────────────┘
```

### 10.2 Minimal Footer Content

- **GitHub Repository:** Link to source code
- **GitHub Discussions:** Community support and engagement
- **License:** Open source license information
- **Copyright:** Simple copyright notice

---

## 11. Interactive Elements

### 11.1 Animations and Transitions

- **Smooth Scrolling:** 0.3s ease-in-out for navigation
- **Button Hover States:** 0.2s color and elevation transitions
- **Image Loading:** Progressive loading with blur-to-sharp effect
- **Section Reveals:** Fade-in animations on scroll (subtle)

### 11.2 Micro-interactions

- **Download Button:** Success state after click
- **Platform Detection:** Smooth transition when detected
- **Screenshot Gallery:** Smooth swipe/scroll animations
- **FAQ Accordion:** Smooth expand/collapse with icons

### 11.3 Loading States

- **Page Load:** Skeleton screens for content areas
- **Image Loading:** Placeholder with loading animation
- **Download Links:** Loading state while generating download
- **Form Submissions:** Button loading state with spinner

---

## 12. Accessibility Considerations

### 12.1 Navigation

- **Keyboard Navigation:** Tab order follows visual hierarchy
- **Focus Indicators:** Clear focus rings on all interactive elements
- **Skip Links:** "Skip to main content" for screen readers
- **ARIA Labels:** Descriptive labels for all interactive elements

### 12.2 Content Structure

- **Heading Hierarchy:** Proper H1-H6 structure for screen readers
- **Alt Text:** Descriptive alternative text for all images
- **Color Contrast:** WCAG AA compliance for all text
- **Touch Targets:** Minimum 44px for mobile interactions

### 12.3 Responsive Design

- **Text Scaling:** Supports up to 200% zoom without horizontal scroll
- **Mobile Navigation:** Touch-friendly menu with adequate spacing
- **Content Reflow:** Logical content order on all screen sizes
- **Reduced Motion:** Respects user's motion preferences
