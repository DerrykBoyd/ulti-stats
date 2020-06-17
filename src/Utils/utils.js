export function sortTeams (a, b) {
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