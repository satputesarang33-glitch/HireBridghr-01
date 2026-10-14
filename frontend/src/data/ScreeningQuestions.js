// Mock Screening Questions and Supported Question Types
export const QUESTION_TYPES = [
  { id: 'YES_NO', label: 'Yes / No', icon: 'ToggleLeft' },
  { id: 'MULTIPLE_CHOICE', label: 'Multiple Choice', icon: 'ListOrdered' },
  { id: 'SHORT_ANSWER', label: 'Short Answer', icon: 'Type' },
  { id: 'LONG_ANSWER', label: 'Long Answer', icon: 'AlignLeft' },
  { id: 'NUMBER', label: 'Number', icon: 'Hash' },
  { id: 'DROPDOWN', label: 'Dropdown', icon: 'ChevronDown' }
];

export const initialScreeningQuestions = [
  {
    id: 'sq-1',
    question: 'Are you legally authorized to work in the country of this job listing?',
    type: 'YES_NO',
    isMandatory: true,
    options: ['Yes', 'No']
  },
  {
    id: 'sq-2',
    question: 'How many years of relevant professional experience do you have?',
    type: 'NUMBER',
    isMandatory: true,
    placeholder: 'e.g. 5'
  },
  {
    id: 'sq-3',
    question: 'What is your current notice period?',
    type: 'DROPDOWN',
    isMandatory: true,
    options: ['Immediate', '15 Days', '30 Days', '60 Days', '90 Days']
  },
  {
    id: 'sq-4',
    question: 'Which of the following best describes your primary skill stack?',
    type: 'MULTIPLE_CHOICE',
    isMandatory: false,
    options: ['Full Stack Development', 'Frontend Architecture', 'Cloud / DevOps', 'Product Management']
  },
  {
    id: 'sq-5',
    question: 'Briefly describe a complex project you spearheaded and the measurable outcome.',
    type: 'LONG_ANSWER',
    isMandatory: false,
    placeholder: 'Provide a concise summary...'
  }
];

export default initialScreeningQuestions;
