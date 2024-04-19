// Function to get the local file path from the request files array
const getLocalPath = (files, field) => {
  if (files && Array.isArray(files[field]) && files[field].length > 0) {
    return files[field][0].path;
  }
  return null;
};

export { getLocalPath };
