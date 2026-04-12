const mentors = [
  {
    id: 'zulfiquar-ali',
    name: 'Zulfiquar Ali',
    email: process.env.MENTOR_ZULFIQUAR_EMAIL?.trim() || '',
    categories: ['Full Stack'],
  },
  {
    id: 'anas',
    name: 'Anas',
    email: process.env.MENTOR_ANAS_EMAIL?.trim() || '',
    categories: ['Backend',],
  },
  {
    id: 'vipul',
    name: 'Vipul',
    email: process.env.MENTOR_VIPUL_EMAIL?.trim() || '',
    categories: ['PPT'],
  },
  {
    id: 'raj',
    name: 'Raj',
    email: process.env.MENTOR_RAJ_EMAIL?.trim() || '',
    categories: ['Login Page'],
  },
   {
    id: 'furqan',
    name: 'Furqan',
    email: process.env.MENTOR_FURQAN_EMAIL?.trim() || '',
    categories: ['finance'],
  },
];

export const getMentors = () => mentors;

export const getMentorById = (mentorId) =>
  mentors.find((mentor) => mentor.id === mentorId);
