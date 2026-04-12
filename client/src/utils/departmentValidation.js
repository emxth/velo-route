export const validateDepartmentForm = (formData) => {
  const errors = {};

  if (!formData.name?.trim()) errors.name = "Department name is required";
  else if (formData.name.trim().length < 2)
    errors.name = "Must be at least 2 characters";

  if (!formData.managerName?.trim())
    errors.managerName = "Manager name is required";
  else if (formData.managerName.trim().length < 2)
    errors.managerName = "Must be at least 2 characters";

  if (!formData.contactNumber?.trim())
    errors.contactNumber = "Contact number is required";
  else if (!/^[0-9]{10}$/.test(formData.contactNumber))
    errors.contactNumber = "Enter a valid 10-digit number";

  if (!formData.email?.trim()) errors.email = "Email is required";
  else if (
    !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email)
  )
    errors.email = "Enter a valid email address";

  if (!formData.address?.trim()) errors.address = "Address is required";
  else if (formData.address.trim().length < 5)
    errors.address = "Address must be at least 5 characters";

  if (!formData.region) errors.region = "Region is required";

  return errors;
};

export const validateDepartmentUpdate = (formData) => {
  const errors = {};

  // Only validate fields that are present in the formData object
  if (formData.name !== undefined) {
    if (!formData.name?.trim()) errors.name = "Department name cannot be empty";
    else if (formData.name.trim().length < 2)
      errors.name = "Must be at least 2 characters";
  }

  if (formData.managerName !== undefined) {
    if (!formData.managerName?.trim())
      errors.managerName = "Manager name cannot be empty";
    else if (formData.managerName.trim().length < 2)
      errors.managerName = "Must be at least 2 characters";
  }

  if (formData.contactNumber !== undefined) {
    if (!formData.contactNumber?.trim())
      errors.contactNumber = "Contact number cannot be empty";
    else if (!/^[0-9]{10}$/.test(formData.contactNumber))
      errors.contactNumber = "Enter a valid 10-digit number";
  }

  if (formData.email !== undefined) {
    if (!formData.email?.trim()) errors.email = "Email cannot be empty";
    else if (
      !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email)
    )
      errors.email = "Enter a valid email address";
  }

  if (formData.address !== undefined) {
    if (!formData.address?.trim()) errors.address = "Address cannot be empty";
    else if (formData.address.trim().length < 5)
      errors.address = "Address must be at least 5 characters";
  }

  if (formData.region !== undefined && !formData.region) {
    errors.region = "Region is required";
  }

  if (
    formData.status !== undefined &&
    !["active", "inactive"].includes(formData.status)
  ) {
    errors.status = "Status must be 'active' or 'inactive'";
  }

  return errors;
};
