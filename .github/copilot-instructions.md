---
applyTo: '**'
---

# Gig Buddy - Copilot Instructions

You are helping develop Gig Buddy, a React/TypeScript pianist companion app. Follow these coding conventions and patterns strictly.

## Tech Stack

- React 19.1.0 with TypeScript
- React Router DOM for navigation
- React Hook Form for form management and validation
- Tinybase for state management with localStorage persistence
- Tailwind CSS 4.1.18 with CSS variables for theming (dark mode only)
- Vite 7.0.4 as build tool
- Prettier & ESLint for automatic formatting
- class-variance-authority (CVA) for composable component variants
- @tabler/icons-react for consistent icon system

**Development Commands:**

- `npm run lint -- --fix` - Auto-fix formatting and linting issues
- `npm run typecheck` - Quick TypeScript type checking (use during development)
- `npm run build` - Full build with type checking and bundling

## Mandatory Sorting Rules

**All imports, import members, and object keys must be alphabetically sorted.** This is enforced by ESLint.

### Import Organization

1. External libraries first (React, packages)
2. Internal imports second (relative paths)
3. Separate groups with blank lines
4. Alphabetize within each group

```typescript
// ✅ CORRECT
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { FormField } from './FormField';
import { RadioGroup } from './RadioGroup';
import type { Song } from '../types/setlist';

// ❌ WRONG - mixed groups, not alphabetical
import type { Song } from '../types/setlist';
import { useEffect } from 'react';
import { FormField } from './FormField';
```

### Object Properties

Always sort object properties alphabetically:

```typescript
// ✅ CORRECT
const defaults = {
  artist: '',
  bpm: undefined,
  id: '1',
  key: 'C',
  timeSignature: '4/4',
  title: '',
};

// ❌ WRONG
const defaults = {
  artist: '',
  title: '',
  key: 'C',
};
```

## Mock Factory Functions

Location: `src/mocks/*.ts`

### Single Item Factory Pattern

```typescript
export const createSong = (overrides: Partial<Song> = {}): Song => ({
  artist: 'Queen',
  bpm: 72,
  id: '1',
  key: 'Bb',
  timeSignature: '4/4',
  title: 'Bohemian Rhapsody',
  ...overrides,
});
```

**Rules:**

- Parameter: `overrides: Partial<T> = {}`
- Return full type, not `Omit<>`
- Spread defaults first, then overrides (overrides take precedence)
- All keys alphabetized
- Complete, realistic defaults

### Multiple Items Factory Pattern

```typescript
export const createSongs = (): Song[] => [
  createSong(),
  createSong({
    artist: 'Stevie Wonder',
    bpm: 100,
    id: '3',
    key: 'Ebm',
    title: 'Superstition',
  }),
  createSong({
    artist: 'Earth, Wind & Fire',
    bpm: 126,
    id: '2',
    key: 'Ab',
    title: 'September',
  }),
  // ... more items
];
```

**Rules:**

- Compose using individual factory calls
- Override objects have alphabetically sorted keys
- Return `Song[]` (full type with IDs)
- Use for database seeding and test data

## React Hook Form Configuration

### Form Type Definition

```typescript
type FormData = Omit<Song, 'id'> & {
  keyNote?: string;
  keyQuality?: string;
};

type FormProps = {
  initialData?: Song;
  onSubmit: (data: ProcessedData) => void;
  title: string;
};
```

### useForm Setup

```typescript
const {
  register,
  handleSubmit,
  formState: { errors },
} = useForm<FormData>({
  defaultValues: {
    artist: initialData?.artist || '',
    bpm: initialData?.bpm || undefined,
    keyNote: 'C',
    keyQuality: '',
    timeSignature: '4/4',
    title: initialData?.title || '',
  },
});
```

**Rules:**

- Explicit type parameter: `useForm<T>()`
- Destructure: `register`, `handleSubmit`, `formState`
- Always provide `defaultValues` for all fields
- Use optional chaining: `?.`
- Keys alphabetically sorted in defaultValues

### Field Validation

```typescript
// Required text field
<FormField
  error={errors.artist}
  id="artist"
  label="Artist"
  placeholder="Enter artist name"
  register={register('artist', { required: 'Artist is required' })}
  required
/>

// Optional number field with range
<input
  {...register('bpm', {
    max: { message: 'BPM must be at most 200', value: 200 },
    min: { message: 'BPM must be at least 0', value: 0 },
    valueAsNumber: true,
  })}
  id="bpm"
  max="200"
  min="0"
  type="number"
/>

// Radio group with required validation
<RadioGroup
  error={errors.keyNote}
  label="Key (Note)"
  options={noteOptions}
  register={register('keyNote', { required: 'Key note is required' })}
  required
/>
```

**Rules:**

- Validation rules as second `register()` parameter
- `valueAsNumber: true` for number inputs
- Custom error messages for all validations
- `required: 'message'` for required fields
- Object keys alphabetically sorted in validation rules

### Form Submission

```typescript
const handleFormSubmit = (data: FormData) => {
  // Combine form fields if needed
  const key = (data.keyNote || 'C') + (data.keyQuality || '');

  // Build final data with conditional optional fields
  const finalData: Record<string, string | number> = {
    artist: data.artist,
    key,
    timeSignature: data.timeSignature,
    title: data.title,
  };
  if (data.bpm) {
    finalData.bpm = data.bpm;
  }

  onSubmit(finalData);
};
```

**Rules:**

- Transform/combine fields before submission
- Use `Record<string, T>` for dynamic keys
- Conditionally add optional fields (don't pass `undefined`)
- Call parent callback with processed data

## Button Component with CVA

Location: `src/components/Button.tsx`

The Button component uses `class-variance-authority` for composable, type-safe styling:

```typescript
// Props
<Button
  as="a"                    // Polymorphic: 'button' | 'a' | etc
  color="primary"           // Color: 'default' | 'primary' | 'danger'
  icon                      // Icon-only: boolean (sets p-2)
  iconStart={<Icon />}      // Icon on left: ReactNode
  iconEnd={<Icon />}        // Icon on right: ReactNode
  variant="outlined"        // Variant: 'filled' | 'outlined' | 'ghost'
  href="/path"              // When using as="a"
  className="custom"        // Extra classes
  onClick={() => {}}        // Event handlers
>
  Content
</Button>
```

**Rules:**

- Combine `color` + `variant` for any combination
- Use `icon={true}` for standalone icon buttons (applies p-2)
- Use `iconStart` or `iconEnd` for icon + text combinations
- `icon` prop takes priority over `size` variant padding
- Polymorphic `as` prop lets it render as `<button>`, `<a>`, or custom elements
- All combinations are type-safe with `VariantProps<typeof buttonVariants>`

**Common patterns:**

```tsx
// Icon button
<Button color="primary" icon onClick={() => {}}>
  <IconPlus className="h-4 w-4" />
</Button>

// Icon + text
<Button iconStart={<IconPlus className="h-4 w-4" />}>
  Add Item
</Button>

// Danger ghost variant
<Button color="danger" variant="ghost">
  Delete
</Button>

// Link-style button
<Button as={Link} color="primary" to="/path" variant="outlined">
  Navigate
</Button>
```

## Reusable Components

### PageHeader

Location: `src/components/PageHeader.tsx`

Consistent header for list pages with title, subtitle, and action button:

```typescript
<PageHeader
  title="Songs"
  subtitle="Library"                    // Default: "Library"
  action={<Button>New song</Button>}    // Optional action button
/>
```

### EmptyState

Location: `src/components/EmptyState.tsx`

Consistent empty state UI across all pages:

```typescript
import { IconMusic } from '@tabler/icons-react';

<EmptyState
  title="No songs in your library"
  description="Add songs to build your repertoire."
  icon={<IconMusic className="w-12 h-12" />}
/>
```

### BackButton

Location: `src/components/BackButton.tsx`

Link-based back navigation button:

```typescript
<BackButton to="/songs" />        // Navigate to specific path
<BackButton />                    // Navigate back one page
```

### Page

Location: `src/components/Page.tsx`

Consistent page layout wrapper with flex column, full height, and gap:

```typescript
<Page>
  <PageHeader title="Title" />
  {/* Page content */}
</Page>
```

### InputField & SelectField

Location: `src/components/InputField.tsx`, `src/components/SelectField.tsx`

Reusable form inputs with validation display:

```typescript
// InputField (text input)
<InputField
  error={errors.title}
  id="title"
  label="Song Title"
  placeholder="Enter title"
  register={register('title', { required: 'Title is required' })}
  required
/>

// SelectField (supports both controlled and uncontrolled)
<SelectField
  options={[{ label: 'Major', value: 'major' }]}
  register={register('scale')}    // Uncontrolled
  value={value}                   // Or: controlled with onChange
  onChange={(e) => {}}
/>
```

### SortButtonsBar

Location: `src/components/SortButtonsBar.tsx`

Renders sort buttons dynamically for list pages:

```typescript
<SortButtonsBar
  fields={['title', 'artist', 'key'] as const}
  isActive={(field) => field === activeSortField}
  onSort={(field) => handleSort(field)}
  sortDirection="asc"
/>
```

## Custom Hooks

### useSortState

Location: `src/hooks/useSortState.ts`

Generic hook for managing sort state with cycling logic:

```typescript
const { sortBy, sortDirection, handleSort, isActive } = useSortState<SortField>(
  'title', // Initial field
  'asc', // Initial direction
);

// Returns:
// - sortBy: Current sort field or null
// - sortDirection: 'asc' | 'desc' | 'none'
// - handleSort(field): Cycles through directions
// - isActive(field): boolean
```

Cycling logic: `asc` → `desc` → `none` (clears sort)

## Icons

Location: `@tabler/icons-react`

Use tabler icons throughout the app for consistency:

```typescript
import { IconMusic, IconPlaylist, IconPlus, IconArrowUp, IconTrash } from '@tabler/icons-react';

// Usage
<IconMusic className="h-4 w-4" />
```

**Common icons used:**

- `IconMusic`: Songs list
- `IconPlaylist`: Setlists
- `IconPlaylistOff`: No active setlist
- `IconPlus`: Add actions
- `IconArrowUp`, `IconArrowDown`: Move/reorder
- `IconTrash`: Delete
- `IconPencil`: Edit
- `IconArrowLeft`: Back navigation
- `IconSettings`: Settings

## Theming

CSS custom properties with `data-theme` attribute:

```css
@theme {
  --color-brand-50: okLch(97% 0.14 273);
  --color-brand-100: okLch(93% 0.22 273);
  /* ... */
}

[data-theme='orange'] {
  --color-brand-50: okLch(97% 0.14 45);
}

[data-theme='violet'] {
  --color-brand-50: okLch(97% 0.14 316);
}
```

Use OKLCH color space for perceptually uniform theming.

## File Structure

```
src/
├── components/           # Reusable UI components
│   ├── Button.tsx       # Polymorphic button with CVA variants
│   ├── Page.tsx         # Consistent page layout wrapper
│   ├── PageHeader.tsx   # Page header with title and action
│   ├── BackButton.tsx   # Link-based back navigation
│   ├── EmptyState.tsx   # Consistent empty state UI
│   ├── FormField.tsx    # Text input with validation
│   ├── SelectField.tsx  # Select input (controlled/uncontrolled)
│   ├── SortButtonsBar.tsx # Dynamic sort buttons
│   ├── SongCard.tsx     # Song list item card
│   ├── SetlistCard.tsx  # Setlist list item card
│   └── ...              # Other components
├── hooks/               # Custom React hooks
│   └── useSortState.ts  # Generic sort state management
├── mocks/              # Test/seed factories
├── pages/              # Route page components
├── store/              # Tinybase store setup
├── types/              # TypeScript types
├── App.tsx             # Main router
├── main.tsx            # Entry point
└── index.css           # Global styles + theme
```

## Key Patterns

| What                  | Where                               | Example                                       |
| --------------------- | ----------------------------------- | --------------------------------------------- |
| Button component      | `src/components/Button.tsx`         | `<Button color="primary" variant="outlined">` |
| Page layout           | `src/components/Page.tsx`           | `<Page><PageHeader />{content}</Page>`        |
| Empty states          | `src/components/EmptyState.tsx`     | `<EmptyState icon={...} title="..." />`       |
| Back navigation       | `src/components/BackButton.tsx`     | `<BackButton to="/songs" />`                  |
| Sort management       | `src/hooks/useSortState.ts`         | `useSortState<'title' \| 'date'>()`           |
| Sort button rendering | `src/components/SortButtonsBar.tsx` | `<SortButtonsBar fields={[...]} />`           |
| Mock factories        | `src/mocks/*.ts`                    | `createSong()`, `createSongs()`               |
| Form components       | `src/components/*.tsx`              | `SongForm.tsx` with FormProvider              |
| Page routes           | `src/pages/*.tsx`                   | `AddSongPage.tsx`, `ManageSongsPage.tsx`      |
| Types                 | `src/types/*.ts`                    | `Song`, `Setlist` interfaces                  |
| Store setup           | `src/store/store.ts`                | Tinybase initialization                       |

## Important Gotchas

1. ❌ Don't return `Omit<T, 'id'>[]` from factories → ✅ Return `T[]` (with IDs)
2. ❌ Don't spread overrides before defaults → ✅ `{ ...defaults, ...overrides }`
3. ❌ Don't pass `undefined` to Tinybase → ✅ Conditionally add optional fields using `Record<string, T>`
4. ❌ Don't mix import groups → ✅ Separate external and internal with blank line
5. ❌ Don't forget `errors` destructuring from `formState` → ✅ `const { errors } = formState`
6. ❌ Don't use unsorted imports or object keys → ✅ Run `npm run lint -- --fix` before committing
7. ❌ Don't create standalone button elements → ✅ Use the `Button` component with props
8. ❌ Don't use dark: prefixes → ✅ App is dark mode only, use base classes
9. ❌ Don't use inline SVGs for icons → ✅ Use tabler icons (`IconMusic`, `IconPlus`, etc.)

## Code Formatting

Prettier config: `.prettierrc`

- **printWidth**: 100
- **semi**: true
- **singleQuote**: true
- **tabWidth**: 2
- **trailingComma**: all

Always run `npm run lint -- --fix` to auto-format before submitting code.
