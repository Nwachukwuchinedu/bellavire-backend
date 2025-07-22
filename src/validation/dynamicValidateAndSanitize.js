import Joi from 'joi';
import mongoSanitize from 'mongo-sanitize';
import xss from 'xss';
import mongoose from 'mongoose';

/**
 * Deep sanitizer that recursively cleans data
 */
class DataSanitizer {
  constructor() {
    this.xssOptions = {
      whiteList: {}, // Remove all HTML tags
      stripIgnoreTag: true,
      stripIgnoreTagBody: ['script'],
      stripBlankChar: true,
      css: false
    };
  }

  /**
   * Recursively sanitize data
   * @param {*} data - Data to sanitize
   * @returns {*} Sanitized data
   */
  sanitize(data) {
    if (data === null || data === undefined) {
      return data;
    }

    // Handle strings
    if (typeof data === 'string') {
      const cleaned = xss(data, this.xssOptions);
      // If the string becomes empty after XSS cleaning, return null to indicate removal
      return cleaned.trim() === '' && data.trim() !== '' ? null : cleaned;
    }

    // Handle numbers, booleans, dates
    if (typeof data === 'number' || typeof data === 'boolean' || data instanceof Date) {
      return data;
    }

    // Handle arrays
    if (Array.isArray(data)) {
      return data.map(item => this.sanitize(item)).filter(item => item !== null);
    }

    // Handle objects
    if (typeof data === 'object') {
      // First apply mongo-sanitize to remove dangerous keys
      const mongoSanitized = mongoSanitize(data);

      // Then recursively sanitize all values
      const result = {};
      for (const [key, value] of Object.entries(mongoSanitized)) {
        const sanitizedValue = this.sanitize(value);
        // Only include non-null values
        if (sanitizedValue !== null) {
          result[key] = sanitizedValue;
        }
      }
      return result;
    }

    return data;
  }
}

/**
 * Schema generator that converts Mongoose schemas to Joi schemas
 */
class SchemaGenerator {
  constructor() {
    this.typeMap = new Map([
      [mongoose.Schema.Types.String, this.createStringSchema.bind(this)],
      [mongoose.Schema.Types.Number, this.createNumberSchema.bind(this)],
      [mongoose.Schema.Types.Boolean, this.createBooleanSchema.bind(this)],
      [mongoose.Schema.Types.Date, this.createDateSchema.bind(this)],
      [mongoose.Schema.Types.ObjectId, this.createObjectIdSchema.bind(this)],
      [mongoose.Schema.Types.Mixed, this.createMixedSchema.bind(this)],
      [mongoose.Schema.Types.Buffer, this.createBufferSchema.bind(this)],
      [mongoose.Schema.Types.Decimal128, this.createNumberSchema.bind(this)],
    ]);
  }

  /**
   * Generate Joi schema from Mongoose model
   * @param {mongoose.Model} model - Mongoose model
   * @param {Object} options - Generation options
   * @returns {Joi.Schema} Generated Joi schema
   */
  generateFromModel(model, options = {}) {
    const { isUpdate = false, excludeFields = [] } = options;
    const mongooseSchema = model.schema;

    return this.convertSchemaToJoi(mongooseSchema, { isUpdate, excludeFields });
  }

  /**
   * Convert Mongoose schema to Joi schema
   * @param {mongoose.Schema} schema - Mongoose schema
   * @param {Object} options - Conversion options
   * @returns {Joi.Schema} Joi schema
   */
  convertSchemaToJoi(schema, options = {}) {
    const { isUpdate = false, excludeFields = [] } = options;
    const joiFields = {};

    // Process each path in the schema
    schema.eachPath((path, schemaType) => {
      // Skip internal MongoDB fields and excluded fields
      if (path === '_id' || path === '__v' || excludeFields.includes(path)) {
        return;
      }

      // Skip if it's a virtual field
      if (schema.virtuals[path]) {
        return;
      }

      try {
        const joiSchema = this.convertSchemaTypeToJoi(schemaType, path, isUpdate);
        if (joiSchema) {
          this.setNestedProperty(joiFields, path, joiSchema);
        }
      } catch (error) {
        console.warn(`Warning: Could not convert path '${path}':`, error.message);
        // Continue processing other fields
      }
    });

    let joiSchema = Joi.object(joiFields);

    // For updates, make all fields optional
    if (isUpdate) {
      joiSchema = joiSchema.optional();
    }
    return joiSchema;
  }

  /**
   * Set nested property in object using dot notation
   * @param {Object} obj - Target object
   * @param {string} path - Dot notation path
   * @param {*} value - Value to set
   */
  setNestedProperty(obj, path, value) {
    const keys = path.split('.');
    let current = obj;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!(key in current)) {
        current[key] = {};
      }
      current = current[key];
    }

    current[keys[keys.length - 1]] = value;
  }

  /**
   * Get all paths from nested object structure
   * @param {Object} obj - Object to traverse
   * @param {string} prefix - Path prefix
   * @returns {Array} Array of all paths
   */
  getAllPaths(obj, prefix = '') {
    const paths = [];

    for (const [key, value] of Object.entries(obj)) {
      const currentPath = prefix ? `${prefix}.${key}` : key;

      if (value && typeof value === 'object' && !value.isJoi) {
        paths.push(...this.getAllPaths(value, currentPath));
      } else {
        paths.push(currentPath);
      }
    }

    return paths;
  }

  /**
   * Build nested structure representation
   * @param {Object} paths - Flat paths object
   * @returns {Object} Nested structure
   */
  buildStructure(paths) {
    const structure = {};

    for (const [path, info] of Object.entries(paths)) {
      this.setNestedProperty(structure, path, info);
    }

    return structure;
  }

  /**
   * Convert Mongoose SchemaType to Joi schema
   * @param {mongoose.SchemaType} schemaType - Mongoose schema type
   * @param {string} path - Field path
   * @param {boolean} isUpdate - Whether the schema is for update
   * @returns {Joi.Schema} Joi schema
   */
  convertSchemaTypeToJoi(schemaType, path, isUpdate = false) {
    // Handle arrays
    if (schemaType instanceof mongoose.Schema.Types.Array) {
      return this.createArraySchema(schemaType, path, isUpdate);
    }

    // Handle embedded documents
    if (schemaType instanceof mongoose.Schema.Types.Subdocument) {
      return this.convertSchemaToJoi(schemaType.schema, { isUpdate });
    }

    // Handle nested objects (Mixed type with nested schema)
    if (schemaType.schema && schemaType.schema.paths) {
      return this.convertSchemaToJoi(schemaType.schema, { isUpdate });
    }

    // Handle regular types
    const typeConstructor = schemaType.constructor;

    // Check if it's a nested object type
    if (typeConstructor === Object || typeConstructor === mongoose.Schema.Types.Mixed) {
      return this.createMixedSchema(schemaType, path, isUpdate);
    }

    const converter = this.typeMap.get(typeConstructor);

    if (converter) {
      return converter(schemaType, path, isUpdate);
    }

    // Handle custom types or unknown types
    return this.createMixedSchema(schemaType, path, isUpdate);
  }

  /**
   * Create string Joi schema
   */
  createStringSchema(schemaType, path, isUpdate = false) {
    let joiSchema = Joi.string();

    if (schemaType.options.required && !isUpdate) {
      joiSchema = joiSchema.required();
    }

    if (schemaType.options.minlength) {
      joiSchema = joiSchema.min(schemaType.options.minlength);
    }

    if (schemaType.options.maxlength) {
      joiSchema = joiSchema.max(schemaType.options.maxlength);
    }

    if (schemaType.options.enum) {
      joiSchema = joiSchema.valid(...schemaType.options.enum);
    }

    if (schemaType.options.match) {
      joiSchema = joiSchema.pattern(schemaType.options.match);
    }

    if (schemaType.options.lowercase) {
      joiSchema = joiSchema.lowercase();
    }

    if (schemaType.options.uppercase) {
      joiSchema = joiSchema.uppercase();
    }

    if (schemaType.options.trim) {
      joiSchema = joiSchema.trim();
    }

    // Add email validation for email fields
    if (path && (path.includes('email') || path.includes('Email'))) {
      joiSchema = joiSchema.email();
    }

    return joiSchema;
  }

  /**
   * Create number Joi schema
   */
  createNumberSchema(schemaType, path, isUpdate = false) {
    let joiSchema = Joi.number();

    if (schemaType.options.required && !isUpdate) {
      joiSchema = joiSchema.required();
    }

    if (schemaType.options.min !== undefined) {
      joiSchema = joiSchema.min(schemaType.options.min);
    }

    if (schemaType.options.max !== undefined) {
      joiSchema = joiSchema.max(schemaType.options.max);
    }

    if (schemaType.options.enum) {
      joiSchema = joiSchema.valid(...schemaType.options.enum);
    }

    return joiSchema;
  }

  /**
   * Create boolean Joi schema
   */
  createBooleanSchema(schemaType, path, isUpdate = false) {
    let joiSchema = Joi.boolean();

    if (schemaType.options.required && !isUpdate) {
      joiSchema = joiSchema.required();
    }

    return joiSchema;
  }

  /**
   * Create date Joi schema
   */
  createDateSchema(schemaType, path, isUpdate = false) {
    let joiSchema = Joi.date();

    if (schemaType.options.required && !isUpdate) {
      joiSchema = joiSchema.required();
    }

    if (schemaType.options.min) {
      joiSchema = joiSchema.min(schemaType.options.min);
    }

    if (schemaType.options.max) {
      joiSchema = joiSchema.max(schemaType.options.max);
    }

    return joiSchema;
  }

  /**
   * Create ObjectId Joi schema
   */
  createObjectIdSchema(schemaType, path, isUpdate = false) {
    let joiSchema = Joi.string().pattern(/^[0-9a-fA-F]{24}$/);

    if (schemaType.options.required && !isUpdate) {
      joiSchema = joiSchema.required();
    }

    return joiSchema;
  }

  /**
   * Create mixed type Joi schema
   */
  createMixedSchema(schemaType, path, isUpdate = false) {
    let joiSchema = Joi.any();

    if (schemaType.options.required && !isUpdate) {
      joiSchema = joiSchema.required();
    }

    return joiSchema;
  }

  /**
   * Create buffer Joi schema
   */
  createBufferSchema(schemaType, path, isUpdate = false) {
    let joiSchema = Joi.binary();

    if (schemaType.options.required && !isUpdate) {
      joiSchema = joiSchema.required();
    }

    return joiSchema;
  }

  /**
   * Create array Joi schema
   */
  createArraySchema(schemaType, path, isUpdate = false) {
    let joiSchema = Joi.array();

    if (schemaType.options.required && !isUpdate) {
      joiSchema = joiSchema.required();
    }

    if (schemaType.options.minlength || schemaType.options.min) {
      joiSchema = joiSchema.min(schemaType.options.minlength || schemaType.options.min);
    }

    if (schemaType.options.maxlength || schemaType.options.max) {
      joiSchema = joiSchema.max(schemaType.options.maxlength || schemaType.options.max);
    }

    // Handle array item type
    if (schemaType.schema) {
      // Array of subdocuments
      const itemSchema = this.convertSchemaToJoi(schemaType.schema, { isUpdate });
      joiSchema = joiSchema.items(itemSchema);
    } else if (schemaType.caster) {
      // Array of primitive types
      const itemSchema = this.convertSchemaTypeToJoi(schemaType.caster, path, isUpdate);
      if (itemSchema) {
        joiSchema = joiSchema.items(itemSchema);
      }
    }

    return joiSchema;
  }
}

/**
 * Convert flat object with dot notation keys to nested object
 * @param {Object} obj
 * @returns {Object}
 */
function dotToNested(obj) {
  const result = {};
  for (const key in obj) {
    if (!obj.hasOwnProperty(key)) continue;
    if (key.indexOf('.') === -1) {
      result[key] = obj[key];
    } else {
      const parts = key.split('.');
      let current = result;
      for (let i = 0; i < parts.length - 1; i++) {
        if (!current[parts[i]]) current[parts[i]] = {};
        current = current[parts[i]];
      }
      current[parts[parts.length - 1]] = obj[key];
    }
  }
  return result;
}

/**
 * Main validator and sanitizer class
 */
class ValidatorSanitizer {
  constructor() {
    this.sanitizer = new DataSanitizer();
    this.schemaGenerator = new SchemaGenerator();
    this.schemaCache = new Map();
  }

  /**
   * Generate cache key for schema
   * @param {mongoose.Model} model - Mongoose model
   * @param {Object} options - Options
   * @returns {string} Cache key
   */
  generateCacheKey(model, options = {}) {
    const { isUpdate = false, excludeFields = [] } = options;
    return `${model.modelName}_${isUpdate}_${excludeFields.sort().join(',')}`;
  }

  /**
   * Get or generate Joi schema
   * @param {mongoose.Model} model - Mongoose model
   * @param {Object} options - Options
   * @returns {Joi.Schema} Joi schema
   */
  getSchema(model, options = {}) {
    const cacheKey = this.generateCacheKey(model, options);

    if (this.schemaCache.has(cacheKey)) {
      return this.schemaCache.get(cacheKey);
    }

    const schema = this.schemaGenerator.generateFromModel(model, options);
    this.schemaCache.set(cacheKey, schema);

    return schema;
  }

  /**
   * Debug method to inspect schema structure
   * @param {mongoose.Model} model - Mongoose model
   * @returns {Object} Schema structure information
   */
  debugSchema(model) {
    const schema = model.schema;
    const paths = {};

    schema.eachPath((path, schemaType) => {
      paths[path] = {
        type: schemaType.constructor.name,
        options: schemaType.options,
        isRequired: schemaType.options.required || false,
        isArray: schemaType instanceof mongoose.Schema.Types.Array,
        isSubdocument: schemaType instanceof mongoose.Schema.Types.Subdocument,
        hasNestedSchema: !!(schemaType.schema && schemaType.schema.paths)
      };
    });

    return {
      modelName: model.modelName,
      paths,
      structure: this.schemaGenerator.buildStructure(paths)
    };
  }

  /**
   * Validate and sanitize data
   * @param {*} data - Data to validate and sanitize
   * @param {mongoose.Model} model - Mongoose model
   * @param {Object} options - Validation options
   * @param {string[]} [options.excludeFields] - Fields to exclude from validation (e.g., ['password', 'secret'])
   * @param {Object} [options.joiOptions] - Joi validation options
   * @param {boolean} [options.joiOptions.allowUnknown=false] - Allow unknown fields
   * @param {boolean} [options.joiOptions.stripUnknown=true] - Remove unknown fields
   * @param {boolean} [options.joiOptions.abortEarly=false] - Return all validation errors, not just the first
   * @param {boolean} [options.isUpdate=false] - Whether this is an update (PATCH) operation (makes all fields optional)
   * @returns {Object} { value, error }
   */
  validateAndSanitize(data, model, options = {}) {
    try {
      // Convert dot notation keys to nested objects
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        data = dotToNested(data);
      }
      // First sanitize the data
      const sanitizedData = this.sanitizer.sanitize(data);

      // Get the Joi schema
      const schema = this.getSchema(model, options);

      // Validate the sanitized data
      const { error, value } = schema.validate(sanitizedData, {
        abortEarly: false,
        allowUnknown: false,
        stripUnknown: true,
        ...options.joiOptions
      });

      return { value, error };
    } catch (err) {
      return {
        value: null,
        error: {
          details: [{
            message: `Validation error: ${err.message}`,
            path: [],
            type: 'validation.error'
          }]
        }
      };
    }
  }

  /**
   * Validate data for creation
   * @param {*} data - Data to validate
   * @param {mongoose.Model} model - Mongoose model
   * @param {Object} [options] - Validation options
   * @param {string[]} [options.excludeFields] - Fields to exclude from validation (e.g., ['password', 'secret'])
   * @param {Object} [options.joiOptions] - Joi validation options
   * @param {boolean} [options.joiOptions.allowUnknown=false] - Allow unknown fields
   * @param {boolean} [options.joiOptions.stripUnknown=true] - Remove unknown fields
   * @param {boolean} [options.joiOptions.abortEarly=false] - Return all validation errors, not just the first
   * @returns {Object} { value, error }
   */
  validateForCreate(data, model, options = {}) {
    return this.validateAndSanitize(data, model, {
      ...options,
      isUpdate: false
    });
  }

  /**
   * Validate data for update
   * @param {*} data - Data to validate
   * @param {mongoose.Model} model - Mongoose model
   * @param {Object} [options] - Validation options
   * @param {string[]} [options.excludeFields] - Fields to exclude from validation (e.g., ['password', 'secret'])
   * @param {Object} [options.joiOptions] - Joi validation options
   * @param {boolean} [options.joiOptions.allowUnknown=false] - Allow unknown fields
   * @param {boolean} [options.joiOptions.stripUnknown=true] - Remove unknown fields
   * @param {boolean} [options.joiOptions.abortEarly=false] - Return all validation errors, not just the first
   * @returns {Object} { value, error }
   */
  validateForUpdate(data, model, options = {}) {
    return this.validateAndSanitize(data, model, {
      ...options,
      isUpdate: true
    });
  }

  /**
   * Only sanitize data without validation
   * @param {*} data - Data to sanitize
   * @returns {*} Sanitized data
   */
  sanitizeOnly(data) {
    return this.sanitizer.sanitize(data);
  }
}

// Create singleton instance
const validator = new ValidatorSanitizer();

export default validator;
export { ValidatorSanitizer, DataSanitizer, SchemaGenerator };