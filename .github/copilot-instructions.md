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
- clsx + tailwind-merge for conditional classname merging
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

## Utility Functions

### cn (Conditional Classnames)

Location: `src/utils/cn.ts`

Utility for merging conditional Tailwind classes using `clsx` and `tailwind-merge`:

```typescript
import { cn } from '../utils/cn';

// Use for conditional styling
<span className={cn(
  'base-classes',
  condition ? 'conditional-classes' : 'alternative-classes',
  anotherCondition && 'more-classes'
)}>
```

**Rules:**

- Use `cn()` instead of template literals for conditional classes
- First argument(s): base/static classes
- Subsequent arguments: conditional classes or boolean conditions
- `tailwind-merge` handles conflicting classes (e.g., multiple `text-` or `bg-` classes)

## Reusable Components

### PageHeader

Location: `src/components/PageHeader.tsx`

Consistent header for list pages with title, subtitle, action button, and optional back button:

```typescript
// Without back button
<PageHeader
  title="Songs"
  subtitle="Library"                    // Default: "Library"
  action={<Button>New song</Button>}    // Optional action button
/>

// With back button (automatically wraps header)
<PageHeader
  backPath="/songs"                     // Shows BackButton, wraps in flex container
  title="Edit Song"
  subtitle="Library"
/>
```

**Rules:**

- When `backPath` is provided, automatically renders wrapper div with BackButton
- When `backPath` is omitted, renders just the header without wrapper
- Don't manually wrap PageHeader with BackButton - use the `backPath` prop instead

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

## Route-Based Form Management Pattern

Use dedicated routes for add/edit operations instead of dialogs. Follow this pattern consistently:

### Structure

1. **Reusable Form Component** (`src/components/*Form.tsx`)
   - Accepts `initialData`, `onSubmit`, `backPath`, and `title` props
   - Handles form state with react-hook-form
   - Returns complete page layout with `<Page>`, `<PageHeader backPath={backPath}>`, and form

2. **Add Page** (`src/pages/Add*Page.tsx`)
   - Minimal component that renders Form with `useAdd*` hook
   - Example: `AddSongPage.tsx`, `AddInstrumentPage.tsx`

3. **Edit Page** (`src/pages/Edit*Page.tsx`)
   - Fetches existing data by ID from route params
   - Renders Form with `initialData` and `useUpdate*` hook
   - Shows "not found" state if ID invalid

### Example Implementation

```typescript
// 1. Form Component (InstrumentForm.tsx)
type InstrumentFormProps = {
  backPath: string;
  initialData?: Instrument;
  onSubmit: (data: InstrumentData) => void;
  title: string;
};

export function InstrumentForm({ backPath, initialData, onSubmit, title }: InstrumentFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      name: initialData?.name || '',
      // ... other fields
    },
  });

  return (
    <Page>
      <PageHeader backPath={backPath} subtitle="Settings" title={title} />
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Form fields */}
      </form>
    </Page>
  );
}

// 2. Add Page (AddInstrumentPage.tsx)
function AddInstrumentPage() {
  const backPath = '/settings/instruments';
  const navigate = useNavigate();
  const addInstrument = useAddInstrument(() => navigate(backPath));

  return <InstrumentForm backPath={backPath} onSubmit={addInstrument} title="Add Instrument" />;
}

// 3. Edit Page (EditInstrumentPage.tsx)
function EditInstrumentPage() {
  const backPath = '/settings/instruments';
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const instrument = useGetInstrument(id);
  const updateInstrument = useUpdateInstrument(id, () => navigate(backPath));

  if (!id || !instrument) {
    return (
      <section className="flex h-full flex-col items-center justify-center gap-4">
        <p className="text-xl text-slate-100">Instrument not found</p>
        <Button as={Link} color="primary" to={backPath}>
          Back to Settings
        </Button>
      </section>
    );
  }

  return (
    <InstrumentForm
      backPath={backPath}
      initialData={instrument}
      onSubmit={updateInstrument}
      title="Edit Instrument"
    />
  );
}

// 4. Routes (App.tsx)
<Route path="/settings/instruments/add" element={<AddInstrumentPage />} />
<Route path="/settings/instruments/:id/edit" element={<EditInstrumentPage />} />

// 5. Navigation (SettingsPage.tsx)
// Add button
<Button as={Link} color="primary" iconStart={<IconPlus className="h-4 w-4" />} to="/settings/instruments/add">
  Add instrument
</Button>

// Edit button
<Button as={Link} color="primary" to={`/settings/instruments/${id}/edit`} icon variant="outlined">
  <IconPencil className="h-4 w-4" />
</Button>
```

**Rules:**

- ❌ Don't use dialogs for add/edit forms → ✅ Use dedicated routes
- Form component should be self-contained with full page layout
- Add/Edit pages are thin wrappers that handle data fetching and callbacks
- Use `Link` or `as={Link}` for navigation buttons (not `onClick` handlers)
- Edit pages must handle "not found" state gracefully
- Success callbacks should navigate back to the list page

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

## MIDI Integration

### Critical: Input/Output Perspective Swap

**WebMIDI's perspective (computer-centric):**

- `inputs` = MIDI inputs **to the computer** (messages sent FROM instruments)
- `outputs` = MIDI outputs **from the computer** (messages sent TO instruments)

**App's perspective (instrument-centric):**

- `midiInId` = MIDI IN **on the instrument** (receives messages from computer) = WebMIDI's `inputs`
- `midiOutId` = MIDI OUT **on the instrument** (sends messages to computer) = WebMIDI's `outputs`

**This means inputs and outputs are intentionally swapped in the codebase:**

```typescript
// ⚠️ IMPORTANT: Inputs and outputs are swapped because we reason from the instrument's perspective
const inputOptions = useMemo(
  () => [
    { label: 'Select MIDI input', value: '' },
    ...outputs.map((device) => ({
      // ← WebMIDI outputs = instrument inputs
      label: device.name,
      value: device.id,
    })),
  ],
  [outputs],
);

const outputOptions = useMemo(
  () => [
    { label: 'None', value: '' },
    ...inputs.map((device) => ({
      // ← WebMIDI inputs = instrument outputs
      label: device.name,
      value: device.id,
    })),
  ],
  [inputs],
);
```

**Always include this comment when mapping MIDI devices:**

```typescript
// Important: Input and output options are swapped because
// the MIDI input of the computer (=webmidi package) corresponds to the output of the instrument and vice versa.
```

But also remind the developer to fix this source of confusion properly.

### MIDI Hooks

Location: `src/hooks/useMidiDevices.ts`

Hook for accessing MIDI device information:

```typescript
const { error, inputs, isReady, isSupported, outputs } = useMidiDevices();

// Returns:
// - isSupported: boolean (browser supports Web MIDI)
// - isReady: boolean (MIDI system initialized)
// - inputs: MIDIInput[] (devices that send TO computer = instrument outputs)
// - outputs: MIDIOutput[] (devices that receive FROM computer = instrument inputs)
// - error: string | null (initialization errors)
```

**Rules:**

- Always check `isSupported` before showing MIDI features
- Check `isReady` before accessing `inputs` and `outputs`
- Remember the perspective swap when mapping to instruments

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
| Back navigation       | `src/components/PageHeader.tsx`     | `<PageHeader backPath="/songs" />`            |
| Conditional classes   | `src/utils/cn.ts`                   | `cn('base', condition && 'extra')`            |
| Sort management       | `src/hooks/useSortState.ts`         | `useSortState<'title' \| 'date'>()`           |
| Sort button rendering | `src/components/SortButtonsBar.tsx` | `<SortButtonsBar fields={[...]} />`           |
| Mock factories        | `src/mocks/*.ts`                    | `createSong()`, `createSongs()`               |
| Form components       | `src/components/*.tsx`              | `SongForm.tsx`, `InstrumentForm.tsx`          |
| Add/Edit pages        | `src/pages/*.tsx`                   | `AddSongPage.tsx`, `EditInstrumentPage.tsx`   |
| Types                 | `src/types/*.ts`                    | `Song`, `Setlist`, `Instrument` interfaces    |
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
9. ❌ Don't use inline SVGs for icons → ✅ Use tabler icons (`IconMusic`, `IconPlus`, etc.). Icons must have explicit size classes (e.g., `className="h-4 w-4"`)
10. ❌ Don't use dialogs for add/edit operations → ✅ Use route-based forms with dedicated pages
11. ❌ Don't use template literals for conditional classes → ✅ Use `cn()` utility function
12. ❌ Don't manually add BackButton wrapper → ✅ Use `backPath` prop on PageHeader
13. ❌ Don't mix up MIDI input/output terminology → ✅ WebMIDI inputs = instrument outputs, WebMIDI outputs = instrument inputs (always add explanatory comment)

## Code Formatting

Prettier config: `.prettierrc`

- **printWidth**: 100
- **semi**: true
- **singleQuote**: true
- **tabWidth**: 2
- **trailingComma**: all

Always run `npm run lint -- --fix` to auto-format before submitting code.
