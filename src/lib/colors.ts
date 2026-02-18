export interface ColorOption {
  label: string
  hex: string
  pastel: string
  bg: string
}

export const COLOR_OPTIONS: ColorOption[] = [
  { label: 'Red', hex: '#EF4444', pastel: '#FEE2E2', bg: '#FFF5F5' },
  { label: 'Blue', hex: '#3B82F6', pastel: '#DBEAFE', bg: '#EFF6FF' },
  { label: 'Green', hex: '#22C55E', pastel: '#DCFCE7', bg: '#F0FDF4' },
  { label: 'Purple', hex: '#A855F7', pastel: '#F3E8FF', bg: '#FAF5FF' },
  { label: 'Pink', hex: '#EC4899', pastel: '#FCE7F3', bg: '#FDF2F8' },
  { label: 'Orange', hex: '#F97316', pastel: '#FFEDD5', bg: '#FFF7ED' },
  { label: 'Yellow', hex: '#EAB308', pastel: '#FEF9C3', bg: '#FEFCE8' },
  { label: 'Teal', hex: '#14B8A6', pastel: '#CCFBF1', bg: '#F0FDFA' },
]

export function getColorConfig(colorLabel: string) {
  return (
    COLOR_OPTIONS.find(
      (c) => c.label.toLowerCase() === colorLabel.toLowerCase()
    ) || COLOR_OPTIONS[1]
  )
}

export function getPastelBg(colorLabel: string): string {
  return getColorConfig(colorLabel).bg
}
