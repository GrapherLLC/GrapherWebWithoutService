import { FieldValue } from 'firebase/firestore'

// Helper function to remove undefined fields
export function removeUndefinedFields(obj: Record<string, unknown>): { [key: string]: FieldValue | Partial<unknown> | undefined } {
  const cleanObj: { [key: string]: FieldValue | Partial<unknown> | undefined } = {}
  Object.entries(obj).forEach(([key, value]) => {
    if (value === undefined) {
      return
    } else if (typeof value === 'object' && value !== null) {
      const cleaned = removeUndefinedFields(value as Record<string, unknown>)
      if (Object.keys(cleaned).length > 0) {
        cleanObj[key] = cleaned
      }
    } else {
      cleanObj[key] = value as FieldValue | Partial<unknown>
    }
  })
  return cleanObj
}