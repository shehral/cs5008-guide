/**
 * CS5008 Guide - Module Data
 * Central data store for all course modules
 */

const MODULES = [
    {
        id: 'week-01',
        week: 1,
        title: 'Course Overview',
        description: 'Introduction to CS5008, the compilation pipeline, and what you\'ll build this semester.',
        topics: ['Big Picture', 'Python to C', 'Compiler Journey'],
        estimatedTime: '20 min',
        defaultUnlocked: true,
        contentFile: 'week-01-overview.html'
    },
    {
        id: 'week-02',
        week: 2,
        title: 'Introduction to C',
        description: 'C fundamentals with Python/Java comparisons: types, pointers, structs, and memory.',
        topics: ['Variables & Types', 'Pointers', 'Structs', 'malloc/free'],
        estimatedTime: '120 min',
        defaultUnlocked: true,
        password: 'Week2',
        contentFile: 'week-02-intro-c.html'
    },
    {
        id: 'memory-pointers',
        week: null,
        title: 'Memory & Pointers Deep Dive',
        description: 'Master the most critical C concept: pointers, stack vs heap, malloc/free, and pointer arithmetic.',
        topics: ['Memory Model', 'Stack vs Heap', 'malloc/free', 'Pointer Arithmetic'],
        estimatedTime: '90 min',
        defaultUnlocked: true,
        password: 'Memory',
        contentFile: 'memory-pointers.html',
        isFoundation: true
    },
    {
        id: 'data-structures',
        week: null,
        title: 'Data Structures for Compilers',
        description: 'Dynamic arrays, linked lists, hash tables, trees, and graphs - the building blocks of your compiler.',
        topics: ['Dynamic Arrays', 'Linked Lists', 'Hash Tables', 'Trees & Graphs', 'Big-O'],
        estimatedTime: '90 min',
        defaultUnlocked: true,
        password: 'DataStructures',
        contentFile: 'data-structures.html',
        isFoundation: true
    },
    {
        id: 'week-03',
        week: 3,
        title: 'CPU Architecture',
        description: 'How computers execute instructions: fetch-decode-execute cycle, registers, and memory hierarchy.',
        topics: ['CPU Components', 'Registers', 'Memory Hierarchy', 'Instruction Cycle'],
        estimatedTime: '90 min',
        defaultUnlocked: false,
        password: 'Week3',
        contentFile: 'week-03-cpu.html'
    },
    {
        id: 'week-04',
        week: 4,
        title: 'x86-64 Assembly',
        description: 'Assembly language fundamentals: registers, instructions, calling conventions, and stack frames.',
        topics: ['Registers', 'Instructions', 'Stack Frames', 'Calling Convention'],
        estimatedTime: '90 min',
        defaultUnlocked: true,
        password: 'Week4',
        contentFile: 'week-04-assembly.html'
    },
    {
        id: 'week-05',
        week: 5,
        title: 'Compiler 1: Lexer',
        description: 'Build a lexer that tokenizes Jive source code. Learn about grammars and finite automata.',
        topics: ['Tokens', 'Lexical Analysis', 'EBNF Grammar', 'State Machines'],
        estimatedTime: '90 min',
        defaultUnlocked: false,
        password: 'Week5',
        contentFile: 'week-05-lexer.html',
        hasCodeContent: true
    },
    {
        id: 'week-06',
        week: 6,
        title: 'Compiler 2: Parser & Codegen',
        description: 'Parse tokens into an AST and generate x86-64 assembly. Introduction to linked lists and trees.',
        topics: ['Parsing', 'AST', 'Code Generation', 'Linked Lists', 'Trees'],
        estimatedTime: '90 min',
        defaultUnlocked: true,
        password: 'Week6',
        contentFile: 'week-06-parser.html',
        hasCodeContent: true
    },
    {
        id: 'week-07',
        week: 7,
        title: 'Compiler 3: Expressions & Stack Machine',
        description: 'Handle binary operators with correct precedence using a stack machine intermediate representation.',
        topics: ['Operator Precedence', 'Stack Machine', 'Binary Operators', 'Pratt Parsing'],
        estimatedTime: '90 min',
        defaultUnlocked: false,
        password: 'Week7',
        contentFile: 'week-07-expressions.html',
        hasCodeContent: true
    },
    {
        id: 'week-08',
        week: 8,
        title: 'Compiler 4: Variables & Symbol Tables',
        description: 'Implement local variables using symbol tables and hash maps for efficient lookup.',
        topics: ['Symbol Tables', 'Hash Maps', 'Local Variables', 'Stack Allocation'],
        estimatedTime: '90 min',
        defaultUnlocked: true,
        password: 'Week8',
        contentFile: 'week-08-variables.html',
        hasCodeContent: true
    },
    {
        id: 'week-09',
        week: 9,
        title: 'Compiler 5: Function Calls',
        description: 'Implement function calls and returns using the x86-64 calling convention.',
        topics: ['Function Calls', 'Parameters', 'Return Values', 'Calling Convention'],
        estimatedTime: '90 min',
        defaultUnlocked: false,
        password: 'Week9',
        contentFile: 'week-09-functions.html',
        hasCodeContent: true
    },
    {
        id: 'week-10',
        week: 10,
        title: 'Compiler 6: Built-in Functions',
        description: 'Add built-in functions for I/O and string operations. Learn about linking with external libraries.',
        topics: ['Built-in Functions', 'External Linking', 'libc Integration'],
        estimatedTime: '60 min',
        defaultUnlocked: true,
        password: 'Week10',
        contentFile: 'week-10-builtins.html',
        hasCodeContent: true
    },
    {
        id: 'week-11',
        week: 11,
        title: 'Review & Practice',
        description: 'Veterans Day week - catch up and review. Practice problems covering Compilers 1-6.',
        topics: ['Review', 'Practice Problems', 'Common Pitfalls'],
        estimatedTime: '60 min',
        defaultUnlocked: false,
        password: 'Week11',
        contentFile: 'week-11-review.html'
    },
    {
        id: 'week-12',
        week: 12,
        title: 'Compiler 6: Conditionals & Loops',
        description: 'Implement if/else statements and while loops using labels and conditional jumps.',
        topics: ['Control Flow', 'Labels', 'Conditional Jumps', 'Loop Compilation'],
        estimatedTime: '90 min',
        defaultUnlocked: true,
        password: 'Week12',
        contentFile: 'week-12-control-flow.html',
        hasCodeContent: true
    },
    {
        id: 'week-13',
        week: 13,
        title: 'Compiler 7: Type Checking',
        description: 'Add type checking to your compiler. Ensure type safety for variables, functions, and expressions.',
        topics: ['Type Checking', 'Type Errors', 'Type Inference'],
        estimatedTime: '90 min',
        defaultUnlocked: false,
        password: 'Week13',
        contentFile: 'week-13-types.html',
        hasCodeContent: true
    },
    {
        id: 'week-14',
        week: 14,
        title: 'Compiler 7: Arrays & Dynamic Memory',
        description: 'Implement arrays and dynamic memory allocation. Learn about heap management.',
        topics: ['Arrays', 'Dynamic Memory', 'malloc/free', 'Heap'],
        estimatedTime: '90 min',
        defaultUnlocked: true,
        password: 'Week14',
        contentFile: 'week-14-arrays.html',
        hasCodeContent: true
    },
    {
        id: 'week-15',
        week: 15,
        title: 'Advanced: Strings & Extra Credit',
        description: 'Extra credit assignment: implement string literals and printing. The ultimate compiler test.',
        topics: ['Strings', 'String Literals', 'print_str', 'Final Challenge'],
        estimatedTime: '120 min',
        defaultUnlocked: false,
        password: 'Advanced',
        contentFile: 'week-15-advanced.html',
        hasCodeContent: true,
        isAdvanced: true
    }
];

// TA-only content passwords (separate tier)
const TA_PASSWORDS = {
    'Lexer2025': ['week-05-code'],
    'Parser2025': ['week-06-code'],
    'Stack2025': ['week-07-code'],
    'Vars2025': ['week-08-code'],
    'Funcs2025': ['week-09-code'],
    'Builtin2025': ['week-10-code'],
    'Flow2025': ['week-12-code'],
    'Types2025': ['week-13-code'],
    'Arrays2025': ['week-14-code'],
    'Strings2025': ['week-15-code']
};

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.MODULES = MODULES;
    window.TA_PASSWORDS = TA_PASSWORDS;
}
