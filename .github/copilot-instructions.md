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
- Tailwind CSS 4.1.18 with CSS variables for theming
- Vite 7.0.4 as build tool
- Prettier & ESLint for automatic formatting

Run `npm run lint -- --fix` to auto-fix formatting issues.

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

## Component Props Pattern

```typescript
type MyComponentProps = {
  error?: FieldError;
  id: string;
  label: string;
  placeholder?: string;
  register: UseFormRegisterReturn;
  required?: boolean;
  type?: string;
};

export function MyComponent({
  error,
  id,
  label,
  placeholder,
  register,
  required = false,
  type = 'text',
}: MyComponentProps) {
  // implementation
}
```

**Rules:**

- Props type has alphabetically sorted properties
- Destructuring matches type order
- Default values in destructuring for optional props
- Use `?` for optional properties

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
├── components/      # Reusable UI components
├── mocks/          # Test/seed factories
├── pages/          # Route page components
├── store/          # Tinybase store setup
├── config/         # Theme configurations
├── types/          # TypeScript types
├── App.tsx         # Main router
├── main.tsx        # Entry point
└── index.css       # Global styles + theme
```

## Key Patterns

| What            | Where                  | Example                               |
| --------------- | ---------------------- | ------------------------------------- |
| Mock factories  | `src/mocks/*.ts`       | `createSong()`, `createSongs()`       |
| Form components | `src/components/*.tsx` | `SongForm.tsx` with validation        |
| Page routes     | `src/pages/*.tsx`      | `AddSongPage.tsx`, `EditSongPage.tsx` |
| Types           | `src/types/*.ts`       | `Song`, `Setlist` interfaces          |
| Store setup     | `src/store/store.ts`   | Tinybase initialization               |

## Important Gotchas

1. ❌ Don't return `Omit<T, 'id'>[]` from factories → ✅ Return `T[]` (with IDs)
2. ❌ Don't spread overrides before defaults → ✅ `{ ...defaults, ...overrides }`
3. ❌ Don't pass `undefined` to Tinybase → ✅ Conditionally add optional fields using `Record<string, T>`
4. ❌ Don't mix import groups → ✅ Separate external and internal with blank line
5. ❌ Don't forget `errors` destructuring from `formState` → ✅ `const { errors } = formState`
6. ❌ Don't use unsorted imports or object keys → ✅ Run `npm run lint -- --fix` before committing

## Code Formatting

Prettier config: `.prettierrc`

- **printWidth**: 100
- **semi**: true
- **singleQuote**: true
- **tabWidth**: 2
- **trailingComma**: all

Always run `npm run lint -- --fix` to auto-format before submitting code.
