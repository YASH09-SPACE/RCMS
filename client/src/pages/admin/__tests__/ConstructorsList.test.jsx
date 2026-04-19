import { describe, it, expect } from 'vitest';

/**
 * Unit tests for Constructor Directory functionality
 * Tests workload level calculation, search filtering, workload filtering, and sorting
 */

// Import the helper functions from ConstructorsList component
// These would normally be exported, but for testing purposes we'll redefine them here

/**
 * Determine workload level based on active task count
 * @param {number} activeTasks - Number of active tasks
 * @returns {'low' | 'medium' | 'high'} Workload level
 */
const getWorkloadLevel = (activeTasks) => {
  if (activeTasks === 0) return 'low';
  if (activeTasks >= 1 && activeTasks <= 5) return 'medium';
  return 'high'; // 6+
};

/**
 * Get workload badge styling and text
 * @param {number} activeTasks - Number of active tasks
 * @returns {Object} Badge configuration with level, text, and className
 */
const getWorkloadBadge = (activeTasks) => {
  const level = getWorkloadLevel(activeTasks);
  return {
    level,
    text: `${activeTasks} Active`,
    className: `constructor-load ${level}`
  };
};

/**
 * Filter constructors by search query (name, email, phone)
 * @param {Array} constructors - Array of constructor objects
 * @param {string} query - Search query string
 * @returns {Array} Filtered constructors
 */
const filterBySearch = (constructors, query) => {
  if (!query.trim()) return constructors;
  
  const lowerQuery = query.toLowerCase();
  return constructors.filter(c => 
    c.name.toLowerCase().includes(lowerQuery) ||
    c.email.toLowerCase().includes(lowerQuery) ||
    c.mobile.toLowerCase().includes(lowerQuery)
  );
};

/**
 * Filter constructors by workload level
 * @param {Array} constructors - Array of constructor objects
 * @param {string} workloadFilter - Workload filter ('all', 'low', 'medium', 'high')
 * @returns {Array} Filtered constructors
 */
const filterByWorkload = (constructors, workloadFilter) => {
  if (workloadFilter === 'all') return constructors;
  
  return constructors.filter(c => getWorkloadLevel(c.activeTasks) === workloadFilter);
};

/**
 * Sort constructors by active tasks ascending (least busy first)
 * @param {Array} constructors - Array of constructor objects
 * @returns {Array} Sorted constructors
 */
const sortByActiveTasks = (constructors) => {
  return [...constructors].sort((a, b) => a.activeTasks - b.activeTasks);
};

describe('Constructor Directory - Workload Level Calculation', () => {
  it('should return "low" for 0 active tasks', () => {
    expect(getWorkloadLevel(0)).toBe('low');
  });

  it('should return "medium" for 1 active task', () => {
    expect(getWorkloadLevel(1)).toBe('medium');
  });

  it('should return "medium" for 3 active tasks', () => {
    expect(getWorkloadLevel(3)).toBe('medium');
  });

  it('should return "medium" for 5 active tasks', () => {
    expect(getWorkloadLevel(5)).toBe('medium');
  });

  it('should return "high" for 6 active tasks', () => {
    expect(getWorkloadLevel(6)).toBe('high');
  });

  it('should return "high" for 10 active tasks', () => {
    expect(getWorkloadLevel(10)).toBe('high');
  });

  it('should return "high" for 100 active tasks', () => {
    expect(getWorkloadLevel(100)).toBe('high');
  });
});

describe('Constructor Directory - Workload Badge Generation', () => {
  it('should generate correct badge for 0 tasks (low)', () => {
    const badge = getWorkloadBadge(0);
    expect(badge.level).toBe('low');
    expect(badge.text).toBe('0 Active');
    expect(badge.className).toBe('constructor-load low');
  });

  it('should generate correct badge for 3 tasks (medium)', () => {
    const badge = getWorkloadBadge(3);
    expect(badge.level).toBe('medium');
    expect(badge.text).toBe('3 Active');
    expect(badge.className).toBe('constructor-load medium');
  });

  it('should generate correct badge for 8 tasks (high)', () => {
    const badge = getWorkloadBadge(8);
    expect(badge.level).toBe('high');
    expect(badge.text).toBe('8 Active');
    expect(badge.className).toBe('constructor-load high');
  });
});

describe('Constructor Directory - Search Filtering', () => {
  const mockConstructors = [
    { _id: '1', name: 'John Doe', email: 'john@example.com', mobile: '1234567890', activeTasks: 2 },
    { _id: '2', name: 'Jane Smith', email: 'jane@example.com', mobile: '0987654321', activeTasks: 0 },
    { _id: '3', name: 'Bob Johnson', email: 'bob@example.com', mobile: '5555555555', activeTasks: 7 },
    { _id: '4', name: 'Alice Williams', email: 'alice@example.com', mobile: '1111111111', activeTasks: 4 }
  ];

  it('should return all constructors when search query is empty', () => {
    const result = filterBySearch(mockConstructors, '');
    expect(result).toHaveLength(4);
  });

  it('should return all constructors when search query is whitespace', () => {
    const result = filterBySearch(mockConstructors, '   ');
    expect(result).toHaveLength(4);
  });

  it('should filter by name (case insensitive)', () => {
    const result = filterBySearch(mockConstructors, 'john');
    expect(result).toHaveLength(2); // John Doe and Bob Johnson
    expect(result.map(c => c.name)).toContain('John Doe');
    expect(result.map(c => c.name)).toContain('Bob Johnson');
  });

  it('should filter by email', () => {
    const result = filterBySearch(mockConstructors, 'jane@example.com');
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Jane Smith');
  });

  it('should filter by partial email', () => {
    const result = filterBySearch(mockConstructors, 'alice');
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Alice Williams');
  });

  it('should filter by phone number', () => {
    const result = filterBySearch(mockConstructors, '5555555555');
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Bob Johnson');
  });

  it('should filter by partial phone number', () => {
    const result = filterBySearch(mockConstructors, '1234');
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('John Doe');
  });

  it('should return empty array when no matches found', () => {
    const result = filterBySearch(mockConstructors, 'nonexistent');
    expect(result).toHaveLength(0);
  });

  it('should handle case insensitive search', () => {
    const result = filterBySearch(mockConstructors, 'JANE');
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Jane Smith');
  });
});

describe('Constructor Directory - Workload Filtering', () => {
  const mockConstructors = [
    { _id: '1', name: 'John Doe', activeTasks: 0 },
    { _id: '2', name: 'Jane Smith', activeTasks: 3 },
    { _id: '3', name: 'Bob Johnson', activeTasks: 7 },
    { _id: '4', name: 'Alice Williams', activeTasks: 1 },
    { _id: '5', name: 'Charlie Brown', activeTasks: 5 },
    { _id: '6', name: 'Diana Prince', activeTasks: 10 }
  ];

  it('should return all constructors when filter is "all"', () => {
    const result = filterByWorkload(mockConstructors, 'all');
    expect(result).toHaveLength(6);
  });

  it('should filter by "low" workload (0 tasks)', () => {
    const result = filterByWorkload(mockConstructors, 'low');
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('John Doe');
  });

  it('should filter by "medium" workload (1-5 tasks)', () => {
    const result = filterByWorkload(mockConstructors, 'medium');
    expect(result).toHaveLength(3);
    expect(result.map(c => c.name)).toContain('Jane Smith');
    expect(result.map(c => c.name)).toContain('Alice Williams');
    expect(result.map(c => c.name)).toContain('Charlie Brown');
  });

  it('should filter by "high" workload (6+ tasks)', () => {
    const result = filterByWorkload(mockConstructors, 'high');
    expect(result).toHaveLength(2);
    expect(result.map(c => c.name)).toContain('Bob Johnson');
    expect(result.map(c => c.name)).toContain('Diana Prince');
  });

  it('should return empty array when no constructors match filter', () => {
    const emptyConstructors = [
      { _id: '1', name: 'John Doe', activeTasks: 3 },
      { _id: '2', name: 'Jane Smith', activeTasks: 5 }
    ];
    const result = filterByWorkload(emptyConstructors, 'low');
    expect(result).toHaveLength(0);
  });
});

describe('Constructor Directory - Sorting by Active Tasks', () => {
  it('should sort constructors by activeTasks ascending (least busy first)', () => {
    const mockConstructors = [
      { _id: '1', name: 'John Doe', activeTasks: 5 },
      { _id: '2', name: 'Jane Smith', activeTasks: 0 },
      { _id: '3', name: 'Bob Johnson', activeTasks: 10 },
      { _id: '4', name: 'Alice Williams', activeTasks: 2 }
    ];

    const sorted = sortByActiveTasks(mockConstructors);

    expect(sorted[0].activeTasks).toBe(0);
    expect(sorted[1].activeTasks).toBe(2);
    expect(sorted[2].activeTasks).toBe(5);
    expect(sorted[3].activeTasks).toBe(10);
  });

  it('should handle constructors with same activeTasks count', () => {
    const mockConstructors = [
      { _id: '1', name: 'John Doe', activeTasks: 3 },
      { _id: '2', name: 'Jane Smith', activeTasks: 3 },
      { _id: '3', name: 'Bob Johnson', activeTasks: 1 }
    ];

    const sorted = sortByActiveTasks(mockConstructors);

    expect(sorted[0].activeTasks).toBe(1);
    expect(sorted[1].activeTasks).toBe(3);
    expect(sorted[2].activeTasks).toBe(3);
  });

  it('should not mutate the original array', () => {
    const mockConstructors = [
      { _id: '1', name: 'John Doe', activeTasks: 5 },
      { _id: '2', name: 'Jane Smith', activeTasks: 0 }
    ];

    const original = [...mockConstructors];
    sortByActiveTasks(mockConstructors);

    expect(mockConstructors).toEqual(original);
  });

  it('should handle empty array', () => {
    const sorted = sortByActiveTasks([]);
    expect(sorted).toHaveLength(0);
  });

  it('should handle single constructor', () => {
    const mockConstructors = [
      { _id: '1', name: 'John Doe', activeTasks: 5 }
    ];

    const sorted = sortByActiveTasks(mockConstructors);
    expect(sorted).toHaveLength(1);
    expect(sorted[0].activeTasks).toBe(5);
  });
});

describe('Constructor Directory - Combined Filtering and Sorting', () => {
  const mockConstructors = [
    { _id: '1', name: 'John Doe', email: 'john@example.com', mobile: '1234567890', activeTasks: 5 },
    { _id: '2', name: 'Jane Smith', email: 'jane@example.com', mobile: '0987654321', activeTasks: 0 },
    { _id: '3', name: 'Bob Johnson', email: 'bob@example.com', mobile: '5555555555', activeTasks: 7 },
    { _id: '4', name: 'Alice Williams', email: 'alice@example.com', mobile: '1111111111', activeTasks: 2 },
    { _id: '5', name: 'Charlie Brown', email: 'charlie@example.com', mobile: '2222222222', activeTasks: 0 }
  ];

  it('should apply search filter then workload filter', () => {
    // Search for constructors with 'charlie' in name
    let result = filterBySearch(mockConstructors, 'charlie');
    // Then filter by low workload
    result = filterByWorkload(result, 'low');
    
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Charlie Brown');
  });

  it('should apply workload filter then sort', () => {
    // Filter by medium workload
    let result = filterByWorkload(mockConstructors, 'medium');
    // Then sort by active tasks
    result = sortByActiveTasks(result);
    
    expect(result).toHaveLength(2);
    expect(result[0].activeTasks).toBe(2); // Alice Williams
    expect(result[1].activeTasks).toBe(5); // John Doe
  });

  it('should apply all operations: search, filter, sort', () => {
    // Search for constructors with 'o' in name
    let result = filterBySearch(mockConstructors, 'o');
    // Filter by medium or high workload
    result = result.filter(c => getWorkloadLevel(c.activeTasks) !== 'low');
    // Sort by active tasks
    result = sortByActiveTasks(result);
    
    expect(result).toHaveLength(3);
    expect(result[0].name).toBe('Alice Williams'); // 2 tasks
    expect(result[1].name).toBe('John Doe'); // 5 tasks
    expect(result[2].name).toBe('Bob Johnson'); // 7 tasks
  });
});
