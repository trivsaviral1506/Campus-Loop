---
name: CampusLoop Design System
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#464555'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#777587'
  outline-variant: '#c7c4d8'
  surface-tint: '#4d44e3'
  primary: '#3525cd'
  on-primary: '#ffffff'
  primary-container: '#4f46e5'
  on-primary-container: '#dad7ff'
  inverse-primary: '#c3c0ff'
  secondary: '#712ae2'
  on-secondary: '#ffffff'
  secondary-container: '#8a4cfc'
  on-secondary-container: '#fffbff'
  tertiary: '#7e3000'
  on-tertiary: '#ffffff'
  tertiary-container: '#a44100'
  on-tertiary-container: '#ffd2be'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#0f0069'
  on-primary-fixed-variant: '#3323cc'
  secondary-fixed: '#eaddff'
  secondary-fixed-dim: '#d2bbff'
  on-secondary-fixed: '#25005a'
  on-secondary-fixed-variant: '#5a00c6'
  tertiary-fixed: '#ffdbcc'
  tertiary-fixed-dim: '#ffb695'
  on-tertiary-fixed: '#351000'
  on-tertiary-fixed-variant: '#7b2f00'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  margin: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system delivers a clean, highly reliable, and accessible interface utilizing a trusted corporate sans-serif to ensure maximum readability for university students. 

- **Personality:** Approachable, systematic, authoritative yet collaborative, engineered to foster trust within academic and campus communities.
- **Target Audience:** University students, faculty, and campus administrators navigating high-frequency asset sharing and resource allocation.
- **Emotional Response:** Reassurance, clarity, efficiency, and modern academic empowerment.
- **Design Style:** Corporate / Modern combined with subtle glassmorphism to elevate the student experience without sacrificing legibility or compliance.

## Colors

The color palette centers on a robust indigo primary (`#4F46E5`) paired with an electric violet secondary (`#7C3AED`) to create clear hierarchical focal points for resource actions and real-time inventory badges. Neutrals are calibrated for high-contrast readability against bright campus environments, utilizing crisp white surfaces and dark slate typography.

## Typography

Utilizing **Inter** across all roles, this system ensures a neutral, systematic, and utilitarian reading experience. Font sizes scale conservatively for mobile viewports, ensuring that headlines never overflow or break semantic hierarchy on smaller screens.

## Layout & Spacing

A fluid 12-column grid provides consistent alignment for resource cards, filters, and navigational elements. Generous whitespace reinforces the modern, premium aesthetic, ensuring that dense resource listings remain scannable and uncrowded.

## Elevation & Depth

Visual hierarchy is conveyed using a hybrid approach of tonal layers and subtle ambient shadows. Cards and interactive floating elements utilize low-opacity, diffused indigo-tinted shadows that give a soft, tactile separation from the background without feeling heavy or dated.

## Shapes

With a roundedness factor of `2`, UI elements feature a balanced 0.5rem base radius (scaling up to 1rem for `rounded-lg` and 1.5rem for `rounded-xl`). This provides a friendly, contemporary silhouette that feels approachable for students while maintaining structural precision.

## Components

- **Buttons:** Solid primary actions use the indigo fill with high-contrast white text, utilizing rounded corners and subtle hover elevation. Secondary actions apply ghost variants with low-opacity borders.
- **Chips & Badges:** Compact pill-like indicators displaying real-time item status (e.g., "Available", "Reserved") utilizing soft secondary violet backgrounds and high-contrast text.
- **Input Fields:** Clean text fields featuring subtle borders, clear focus rings in primary indigo, and generous internal padding for touch targets.
- **Cards:** Clean surfaces utilizing rounded corners, subtle shadows, and ample internal whitespace to showcase shared campus items clearly.
- **Lists & Checkboxes:** Systematic list rows with distinct typography weights and accessible checkbox states for multi-item selection.