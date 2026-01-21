# SHARED UI COMPONENTS

## 1. OVERVIEW

Documentation cho các UI components dùng chung trong toàn bộ ứng dụng.

**Path:** `/(frontend)/_shared/components/ui/`

---

## 2. BUTTON

### 2.1. Variants

| Variant | Mô tả | Use Case |
|---------|-------|----------|
| `primary` | Nền xanh, text trắng | CTA chính |
| `secondary` | Nền trắng, border xanh | CTA phụ |
| `danger` | Nền đỏ | Xóa, hành động nguy hiểm |
| `ghost` | Transparent | Menu items, icons |
| `link` | Text xanh, underline | Links trong text |

### 2.2. Sizes

| Size | Height | Font | Padding |
|------|--------|------|---------|
| `sm` | 32px | 14px | 12px |
| `md` | 40px | 16px | 16px |
| `lg` | 48px | 18px | 20px |

### 2.3. Props Interface

```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'link';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}
```

---

## 3. INPUT

### 3.1. Types

| Type | Mô tả |
|------|-------|
| `text` | Text input cơ bản |
| `email` | Email với validation |
| `password` | Password với toggle visibility |
| `number` | Số với arrows |
| `search` | Có icon search |

### 3.2. Props Interface

```typescript
interface InputProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'search';
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  maxLength?: number;
}
```

### 3.3. States

```
Default:   ┌──────────────┐
           │ Placeholder  │ ← Border gray
           └──────────────┘

Focus:     ┌──────────────┐
           │ |            │ ← Border blue, ring
           └──────────────┘

Error:     ┌──────────────┐
           │ Invalid      │ ← Border red
           └──────────────┘
           ⚠️ Error message
           
Disabled:  ┌──────────────┐
           │ Disabled     │ ← Background gray
           └──────────────┘
```

---

## 4. SELECT

### Props Interface

```typescript
interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps {
  label?: string;
  options: SelectOption[];
  value: string | string[];
  onChange: (value: string | string[]) => void;
  placeholder?: string;
  multiple?: boolean;
  searchable?: boolean;
  error?: string;
  disabled?: boolean;
}
```

---

## 5. BADGE

### 5.1. Variants by Status

**Nguồn:** task_statuses, task_priorities

| Code | Color | CSS Background |
|------|-------|----------------|
| TODO | Gray | `#F3F4F6` |
| IN_PROGRESS | Blue | `#DBEAFE` |
| DONE | Green | `#D1FAE5` |
| BLOCKED | Red | `#FEE2E2` |
| LOW | Gray | `#F3F4F6` |
| MEDIUM | Yellow | `#FEF3C7` |
| HIGH | Orange | `#FFEDD5` |
| URGENT | Red | `#FEE2E2` |

### 5.2. Props Interface

```typescript
interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md';
  children: React.ReactNode;
}
```

---

## 6. MODAL

### Props Interface

```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  footer?: React.ReactNode;
  children: React.ReactNode;
}
```

### Usage

```tsx
<Modal
  isOpen={isOpen}
  onClose={handleClose}
  title="Xác nhận xóa"
  size="sm"
  footer={
    <>
      <Button variant="secondary" onClick={handleClose}>Hủy</Button>
      <Button variant="danger" onClick={handleDelete}>Xóa</Button>
    </>
  }
>
  <p>Bạn có chắc muốn xóa item này?</p>
</Modal>
```

---

## 7. CARD

### Props Interface

```typescript
interface CardProps {
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  border?: boolean;
  hoverable?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}
```

---

## 8. AVATAR

### Props Interface

```typescript
interface AvatarProps {
  src?: string | null;
  name: string;        // Fallback to initials
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  status?: 'online' | 'offline' | 'busy';
}
```

### Sizes

| Size | Dimensions |
|------|------------|
| xs | 24px |
| sm | 32px |
| md | 40px |
| lg | 48px |
| xl | 64px |

---

## 9. TOOLTIP

### Props Interface

```typescript
interface TooltipProps {
  content: string | React.ReactNode;
  position?: 'top' | 'right' | 'bottom' | 'left';
  delay?: number;
  children: React.ReactNode;
}
```

---

## 10. PAGINATION

### Props Interface

```typescript
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showFirstLast?: boolean;
  siblingCount?: number;
}
```

---

## 11. ALERT

### Variants

| Variant | Icon | Color |
|---------|------|-------|
| `info` | ℹ️ | Blue |
| `success` | ✅ | Green |
| `warning` | ⚠️ | Yellow |
| `error` | ❌ | Red |

### Props Interface

```typescript
interface AlertProps {
  variant: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  children: React.ReactNode;
}
```

---

## 12. SKELETON

Loading placeholder component.

### Props Interface

```typescript
interface SkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}
```

---

## 13. DATE PICKER

### Props Interface

```typescript
interface DatePickerProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
  label?: string;
  placeholder?: string;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
  error?: string;
  format?: string;  // Default: 'dd/MM/yyyy'
}
```

---

## 14. ACCESSIBILITY (A11Y)

Tất cả components phải đảm bảo:

- ✅ Keyboard navigation (Tab, Enter, Escape)
- ✅ ARIA labels và roles
- ✅ Focus visible indicators
- ✅ Color contrast >= 4.5:1
- ✅ Screen reader support

---

**END OF DOCUMENTATION**
