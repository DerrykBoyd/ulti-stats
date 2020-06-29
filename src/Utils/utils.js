export function sortTeams(a, b) {
  if (!a || !b) return;
  let nameA = a.toUpperCase();
  let nameB = b.toUpperCase();
  if (nameA < nameB) {
    return -1;
  }
  if (nameA > nameB) {
    return 1;
  }
  return 0
}

export function sortByName(a, b) {
  if (!a || !b) return;
  let nameA = a.toUpperCase();
  let nameB = b.toUpperCase();
  if (nameA < nameB) {
    return -1;
  }
  if (nameA > nameB) {
    return 1;
  }
  return 0
}

export const sortOrderOptions = [
  { value: 'Number', label: 'Number' },
  { value: 'First Name', label: 'First Name' },
  { value: 'Last Name', label: 'Last Name' }
];