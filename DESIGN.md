---
name: Conecta SINTEDORP
description: Editorial warmth and clear tools for domestic work.
colors:
  "brand": "#202020"
  "brand-hover": "#3b3b3b"
  "ink": "#202020"
  "muted": "#62635f"
  "paper": "#fff"
  "cream": "#f5f5f2"
  "accent": "#c43e12"
  "accent-bright": "#f15a24"
  "accent-soft": "#fff0e8"
  "line": "#e4e5e0"
  "control-line": "#8b8d87"
  "panel": "#202020"
  "panel-text": "#f1f2ee"
  "panel-line": "#62635f"
  "highlight": "#ff9f70"
  "focus": "#ad370f"
  "surface": "#f7f8f5"
typography:
  "display":
    fontFamily: "Manrope, Segoe UI, sans-serif"
    fontSize: "clamp(60px, 6.15vw, 88px)"
    fontWeight: 550
    lineHeight: 1.03
    letterSpacing: "-0.04em"
  "headline":
    fontFamily: "Manrope, Segoe UI, sans-serif"
    fontSize: "clamp(30px, 3.1vw, 42px)"
    fontWeight: 550
    lineHeight: 1.15
    letterSpacing: "-0.035em"
  "title":
    fontFamily: "Manrope, Segoe UI, sans-serif"
    fontSize: "20px"
    fontWeight: 600
    lineHeight: 1.35
  "body":
    fontFamily: "Manrope, Segoe UI, sans-serif"
    fontSize: "16px"
    lineHeight: 1.55
  "label":
    fontFamily: "Manrope, Segoe UI, sans-serif"
    fontSize: "14px"
    fontWeight: 600
rounded:
  "control": "12px"
  "panel": "16px"
  "image": "24px"
  "pill": "999px"
  "access": "10px"
  "badge": "6px"
spacing:
  "1": "4px"
  "2": "8px"
  "3": "12px"
  "4": "16px"
  "6": "24px"
  "8": "32px"
  "12": "48px"
  "16": "64px"
  "24": "96px"
components:
  "button-primary":
    backgroundColor: "{colors.brand}"
    textColor: "{colors.paper}"
    rounded: "{rounded.pill}"
    padding: "12px 22px"
  "button-secondary":
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "12px 22px"
  "button-access":
    backgroundColor: "{colors.accent}"
    textColor: "{colors.paper}"
    rounded: "{rounded.access}"
    padding: "12px 22px"
  "input":
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "11px 12px"
  "job-card":
    backgroundColor: "{colors.paper}"
    rounded: "{rounded.panel}"
    padding: "28px"
  "badge-neutral":
    backgroundColor: "{colors.cream}"
    textColor: "{colors.muted}"
    rounded: "{rounded.badge}"
    padding: "5px 9px"
---

# Design System: Conecta SINTEDORP

## Overview

**Creative North Star: "Work with a Human Face"**

Mineral whites, charcoal text and black-and-white editorial photography give domestic work a human presence. Orange concentrates recognition in the brand symbol and account actions. Local variable Manrope connects spacious public pages to compact operational screens.

Public pages give photographs and large type room to breathe. Account and workspace screens retain the palette and soft geometry while bringing forms, conditions and next actions forward. Generated photographs are editorial illustrations, not institutional evidence.

**Key Characteristics:**

- Neutral surfaces with concentrated orange accents.
- One local variable family across display and interface text.
- Pill actions, soft panels and rounded editorial photographs.
- Visible labels, keyboard focus and reduced-motion alternatives.

## Colors

### Primary

Charcoal brand and ink carry actions and text; brand-hover lightens the action state. Burnt orange accent serves account actions. The brighter accent belongs to small brand symbols. Accent-soft supports notices and selected details; highlight accents dark surfaces. Focus identifies keyboard interaction. The frontmatter preserves actual source values.

### Neutral

Paper is the white canvas. Surface backs private and account screens; cream distinguishes quiet regions. Muted carries supporting text. Line divides content while control-line gives fields a stronger boundary. Panel, panel-text and panel-line support dark surfaces. Semantic green, red, amber and blue remain local feedback and status colors.

**The Concentrated Accent Rule.** Use charcoal for general primary actions; reserve orange for brand marks, account actions and selected small signals.

## Typography

**Display Font:** Local variable Manrope with Segoe UI and sans-serif fallbacks.
**Body Font:** The same family, loaded from public/fonts/manrope-latin.woff2 with weights 200 through 800 and swap rendering.

Display type uses medium variable weights and tight tracking. Forms and record titles gain emphasis through weight rather than a second family.

### Hierarchy

- Display belongs to the home hero. It changes to 65px below 1100px, 72px below 899px, and 55px with 1.07 line-height below 599px.
- Headline serves operational page titles. Public section headings use clamp(30px, 3.3vw, 44px), weight 500 and 1.18 line-height.
- Title serves record and component headings. Operational section headings use 26px at weight 550.
- Body is 16px with 1.55 line-height. Supporting descriptions commonly use 14px or 15px; hero copy uses 17px, 1.75 line-height and a 440px maximum width.
- Labels use weight 600. Account labels use 13px at weight 550. General inputs use 16px; account inputs use 15px.

**The Shared Voice Rule.** Use local Manrope for editorial headings and operational text; change scale and weight to establish hierarchy.

## Layout

The main container caps at 1240px with 96px total horizontal clearance. Below 850px it uses 40px total clearance. Operational pages use 52px top and 80px bottom spacing at desktop. The token rhythm starts at 4px; local component padding follows content needs.

The public hero and account shell use two desktop columns. The hero stacks below 899px, keeping text and search ahead of imagery. Below 767px the account shell becomes a single form column and hides the photograph. Its desktop maximum width is 1220px, with form content capped at 375px.

Workspaces use a 235px sidebar and flexible content column separated by 42px. At 1100px the sidebar narrows to 208px; at 850px it becomes an explicitly opened mobile navigation area. Job filters move above results at that breakpoint. Tables preserve horizontal scrolling when needed; reports provide mobile cards. Use the relevant component breakpoint rather than one global mobile threshold.

## Elevation & Depth

White panels against mineral backgrounds, fine borders and overlapping photography create most depth. Desktop account shells, confirmation dialogs and editorial support use ambient lift. Open mobile menus use the menu shadow; the sticky header gains a light shadow after scrolling. Forms and job cards have no resting shadow. Job cards move upward 3px on hover while strengthening their border.

**The Tonal Surface Rule.** Separate ordinary panels through white and mineral surfaces, borders and spacing. Reserve ambient lift for overlays, menus and the editorial support composition.

Exact shadows and motion values live in the sidecar. Reduced-motion handling removes animations and transitions and disables portrait parallax. Forms remain available immediately.

## Shapes

Actions use capsules; fields use the control radius; panels use the panel radius; large public photographs use the image radius. Account fields and orange actions share the smaller access radius. Badges use the badge radius. Circular symbols and arrow controls recur throughout the interface. Mobile account shells and images have local reductions in curvature.

## Components

### Buttons

Charcoal primary actions have white text and a 48px minimum height. Small buttons preserve 44px minimum height. Hover changes color; active scales to 0.97 and hovered icons shift 3px. Secondary actions use fine neutral borders and a cream hover surface. Account primary actions use orange, a 50px minimum height and the access radius, darkening to #aa320a on hover. Disabled controls use 0.55 opacity and a disabled cursor.

### Chips

Neutral badges use cream and muted text. Semantic states retain green, amber or red. Active filter controls have a stronger border and wrapping text; preserve their control semantics instead of treating them as status labels.

### Cards / Containers

Job cards have a white surface, fine border and 28px desktop padding, reduced to 20px below 1100px. Forms use 30px desktop padding. Task and recent-activity panels are borderless white against the private mineral canvas. Nested mutation forms become flat divided regions rather than repeated frames.

### Inputs / Fields

Fields have visible labels, a strong control boundary, white background and 48px minimum height. Focus uses a charcoal border and 2px focus outline with 2px offset. Other keyboard focus uses a 2px outline with 4px offset. Account fields use 50px minimum height and 12px 14px padding. Errors and submission feedback remain visible and textual.

### Navigation

The public header is sticky, white and spacious with a 94px desktop row. Current links gain an orange underline. Selected sidebar items become charcoal with white text and warm icons. Mobile navigation opens through labeled controls. Account entry simplifies the header to brand and a contextual link.

### Editorial Opportunity Row

Desktop rows align role, schedule, pay and a circular arrow, with dividers between entries. Hover adds a mineral background and rotates the arrow. Compact layouts rearrange the information for reading. Pay uses tabular figures; real records or explicit empty states supply content.

## Do's and Don'ts

### Do:

- Do keep visible field labels and readable error and submission feedback.
- Do use tabular numerals for comparable amounts.
- Do preserve reduced-motion handling when adding reveals or transitions.
- Do preserve task order when columns collapse.

### Don't:

- Don't present generated editorial images as real institutional records.
- Don't replace semantic feedback colors with the brand accent.
- Don't inherit residual uppercase eyebrows as a new heading pattern.
- Don't delay form availability with entrance animation.

Source of truth: src/styles/tokens.css, the final cascade in globals.css, redesign.css, home.css and access.css, and src/live components. Import order is globals, redesign, home, access. This records implemented styles, not a runtime test certification. Residual eyebrow markup and earlier overridden CSS are not reusable system rules.
