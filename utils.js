export const convert_to_app_dim = num => (num - 11) / 2;

export const get_random = arr => arr[Math.floor(Math.random() * arr.length)];

export const get_random_subset = (arr, min_length) => {
  const interval = arr.length + 1 - min_length;
  if (interval <= 0) return shuffle(arr);

  const num_cols = min_length + Math.floor(Math.random() * interval);
  return shuffle(arr).slice(0, num_cols);
};

export const shuffle = arr => {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

export const is_integer = num => num % 1 < 0.0001;
