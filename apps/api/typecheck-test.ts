import { z } from 'zod'
const s = z.object({ mrn: z.string() })
type Inf = z.infer<typeof s>
const a: Inf = { mrn: 123 } // should error: number not string
const b: Inf = { mrn: 'x', extra: true } // should error: excess property
console.log(a, b)
