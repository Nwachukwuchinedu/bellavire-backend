// Canonical list of allowed property types
export const PROPERTY_TYPES = [
  "flat",
  "shared",
  "detached-house",
  "semi-detached",
];

// Return the list (handy for controllers or docs)
export const getAllowedPropertyTypes = () => [...PROPERTY_TYPES];

// Validate and normalize a landlord's property type selection.
// Rules:
// - Only allowed values from PROPERTY_TYPES
// - 'detached-house' or 'semi-detached' cannot be combined with any other type
// - 'flat' can optionally combine with 'shared' (i.e., ['flat'] or ['flat','shared'])
// - 'shared' cannot be selected alone; it must be paired with 'flat'
export const validatePropertyTypeSelection = (selectedTypes) => {
  const unique = Array.from(new Set((selectedTypes || []).filter(Boolean)));

  if (unique.length === 0) {
    return { valid: false, message: "At least one property type is required" };
  }

  const invalid = unique.filter((t) => !PROPERTY_TYPES.includes(t));
  if (invalid.length > 0) {
    return {
      valid: false,
      message: `Invalid property type(s): ${invalid.join(", ")}`,
    };
  }

  const hasFlat = unique.includes("flat");
  const hasShared = unique.includes("shared");
  const hasDetached = unique.includes("detached-house");
  const hasSemi = unique.includes("semi-detached");

  // 'shared' cannot stand alone
  if (hasShared && !hasFlat) {
    return { valid: false, message: "'shared' must be combined with 'flat'" };
  }

  // 'flat' cannot combine with detached or semi
  if (hasFlat && (hasDetached || hasSemi)) {
    return {
      valid: false,
      message:
        "'flat' cannot be combined with 'detached-house' or 'semi-detached'",
    };
  }

  // detached-house or semi-detached cannot combine with any other type
  if ((hasDetached || hasSemi) && unique.length > 1) {
    return {
      valid: false,
      message:
        "'detached-house' and 'semi-detached' cannot be combined with other types",
    };
  }

  // Normalize order for consistency
  if (hasDetached) return { valid: true, normalized: ["detached-house"] };
  if (hasSemi) return { valid: true, normalized: ["semi-detached"] };
  if (hasFlat && hasShared)
    return { valid: true, normalized: ["flat", "shared"] };
  if (hasFlat) return { valid: true, normalized: ["flat"] };

  // Fallback: shouldn't reach here due to earlier checks
  return { valid: false, message: "Invalid property type combination" };
};
