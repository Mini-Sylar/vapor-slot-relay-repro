import type { Item } from './plain/MenuLike.vue'

export const items: Item[] = [
  {
    label: 'Documents',
    value: 'documents',
    children: [
      { label: 'Resume.pdf', value: 'resume' },
      { label: 'Cover Letter.docx', value: 'cover-letter' },
    ],
  },
  {
    label: 'Photos',
    value: 'photos',
    children: [{ label: 'Vacation.jpg', value: 'vacation' }],
  },
]
