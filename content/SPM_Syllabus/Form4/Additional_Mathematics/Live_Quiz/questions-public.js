(function () {
    "use strict";

    window.AddMathsQuestions = [
        {
            id: 1,
            chapter: 1,
            chapterName: "Functions",
            topic: "Composite functions",
            difficulty: "Foundation",
            prompt: "Given f(x) = 2x - 3 and g(x) = x² + 1, find (g o f)(2).",
            options: ["1", "2", "5", "10"]
        },
        {
            id: 2,
            chapter: 1,
            chapterName: "Functions",
            topic: "Inverse functions",
            difficulty: "SPM Practice",
            prompt: "The function f is defined by f(x) = (3x - 5)/2. Which of the following is f⁻¹(x)?",
            options: ["(2x - 5)/3", "(2x + 5)/3", "(3x + 5)/2", "(5 - 2x)/3"]
        },
        {
            id: 3,
            chapter: 1,
            chapterName: "Functions",
            topic: "Domain",
            difficulty: "SPM Practice",
            prompt: "A function h is defined by h(x) = √(7 - 2x). What is the domain of h?",
            options: ["x >= 7/2", "x <= 7/2", "x > -7/2", "-7/2 <= x <= 7/2"]
        },
        {
            id: 4,
            chapter: 1,
            chapterName: "Functions",
            topic: "Composite functions",
            difficulty: "Challenge",
            prompt: "Given f(x) = ax + 1 and f(f(x)) = 4x + 3 for all x, find a.",
            options: ["-2", "-1", "1", "2"]
        },
        {
            id: 5,
            chapter: 2,
            chapterName: "Quadratic Functions",
            topic: "Roots of quadratic equations",
            difficulty: "Foundation",
            prompt: "The roots of 2x² - 5x - 3 = 0 are alpha and beta. Find alpha + beta and alpha beta.",
            options: [
                "alpha + beta = -5/2, alpha beta = -3/2",
                "alpha + beta = 5/2, alpha beta = -3/2",
                "alpha + beta = 5/2, alpha beta = 3/2",
                "alpha + beta = -5, alpha beta = -3"
            ]
        },
        {
            id: 6,
            chapter: 2,
            chapterName: "Quadratic Functions",
            topic: "Discriminant",
            difficulty: "SPM Practice",
            prompt: "The equation x² + kx + 9 = 0 has two equal roots. Find the possible values of k.",
            options: ["k = 3 only", "k = -3 only", "k = 6 or k = -6", "k = 9 or k = -9"]
        },
        {
            id: 7,
            chapter: 2,
            chapterName: "Quadratic Functions",
            topic: "Maximum and minimum values",
            difficulty: "SPM Practice",
            prompt: "Find the maximum value of y = -2x² + 8x - 3.",
            options: ["3", "5", "8", "11"]
        },
        {
            id: 8,
            chapter: 2,
            chapterName: "Quadratic Functions",
            topic: "Optimisation",
            difficulty: "Challenge",
            prompt: "A rectangle has a perimeter of 28 cm. What is its maximum possible area?",
            options: ["42 cm²", "48 cm²", "49 cm²", "56 cm²"]
        },
        {
            id: 9,
            chapter: 3,
            chapterName: "Systems of Equations",
            topic: "Three linear equations",
            difficulty: "Foundation",
            prompt: "Solve the system x + y + z = 6, x - y + z = 2 and x + y - z = 0.",
            options: [
                "x = 1, y = 2, z = 3",
                "x = 2, y = 1, z = 3",
                "x = 3, y = 2, z = 1",
                "x = 1, y = 3, z = 2"
            ]
        },
        {
            id: 10,
            chapter: 3,
            chapterName: "Systems of Equations",
            topic: "Linear and non-linear equations",
            difficulty: "SPM Practice",
            prompt: "Find the points of intersection of y = x + 1 and x² + y² = 25.",
            options: [
                "(3, 4) and (-4, -3)",
                "(4, 3) and (-3, -4)",
                "(3, -4) and (-4, 3)",
                "(5, 0) and (0, 5)"
            ]
        },
        {
            id: 11,
            chapter: 3,
            chapterName: "Systems of Equations",
            topic: "Problem solving",
            difficulty: "SPM Practice",
            prompt: "At an event, adult, student and child tickets cost RM12, RM8 and RM5 respectively. A total of 20 tickets brings in RM185, and the number of adult tickets is twice the number of child tickets. How many adult tickets are sold?",
            options: ["5", "8", "10", "12"]
        },
        {
            id: 12,
            chapter: 3,
            chapterName: "Systems of Equations",
            topic: "Intersections",
            difficulty: "Challenge",
            prompt: "The graphs y = 2x + 3 and y = x² - 1 intersect at two points. Find the sum of the x-coordinates of the points.",
            options: ["-4", "-2", "2", "4"]
        },
        {
            id: 13,
            chapter: 4,
            chapterName: "Indices, Surds & Logarithms",
            topic: "Laws of indices",
            difficulty: "Foundation",
            prompt: "Evaluate 8^(2/3) x 16^(-1/2).",
            options: ["1/4", "1/2", "1", "4"]
        },
        {
            id: 14,
            chapter: 4,
            chapterName: "Indices, Surds & Logarithms",
            topic: "Rationalising denominators",
            difficulty: "SPM Practice",
            prompt: "Express 3/(2 + √5) in the form a + b√5, where a and b are integers.",
            options: ["6 - 3√5", "3√5 - 6", "6 + 3√5", "-6 - 3√5"]
        },
        {
            id: 15,
            chapter: 4,
            chapterName: "Indices, Surds & Logarithms",
            topic: "Logarithmic equations",
            difficulty: "SPM Practice",
            prompt: "Solve log₂(x - 1) + log₂(x + 1) = 3.",
            options: ["x = -3", "x = 2", "x = 3", "x = 9"]
        },
        {
            id: 16,
            chapter: 4,
            chapterName: "Indices, Surds & Logarithms",
            topic: "Exponential growth",
            difficulty: "Challenge",
            prompt: "A culture initially contains 500 bacteria and grows by 8% every hour. Approximately how many bacteria are present after 5 hours?",
            options: ["680", "720", "735", "800"]
        },
        {
            id: 17,
            chapter: 5,
            chapterName: "Progressions",
            topic: "Arithmetic progressions",
            difficulty: "Foundation",
            prompt: "The first term of an arithmetic progression is 7 and its common difference is 3. Which term is equal to 52?",
            options: ["The 15th term", "The 16th term", "The 17th term", "The 18th term"]
        },
        {
            id: 18,
            chapter: 5,
            chapterName: "Progressions",
            topic: "Sum of arithmetic progression",
            difficulty: "SPM Practice",
            prompt: "Find the sum of the first 20 terms of the arithmetic progression 5, 9, 13, ...",
            options: ["780", "820", "860", "900"]
        },
        {
            id: 19,
            chapter: 5,
            chapterName: "Progressions",
            topic: "Infinite geometric progression",
            difficulty: "SPM Practice",
            prompt: "Find the sum to infinity of the geometric progression 81, 27, 9, ...",
            options: ["108", "117", "121.5", "243"]
        },
        {
            id: 20,
            chapter: 5,
            chapterName: "Progressions",
            topic: "Application of progressions",
            difficulty: "Challenge",
            prompt: "A student saves RM100 in the first month and increases the amount saved by RM20 each month. How much is saved altogether during the first 12 months?",
            options: ["RM1,320", "RM2,200", "RM2,520", "RM2,640"]
        },
        {
            id: 21,
            chapter: 6,
            chapterName: "Linear Law",
            topic: "Power relations",
            difficulty: "Foundation",
            prompt: "The variables x and y satisfy y = ax^n. Which straight-line graph has gradient n and vertical intercept log₁₀ a?",
            options: ["y against x", "log₁₀ y against x", "log₁₀ y against log₁₀ x", "1/y against 1/x"]
        },
        {
            id: 22,
            chapter: 6,
            chapterName: "Linear Law",
            topic: "Algebraic linearisation",
            difficulty: "SPM Practice",
            prompt: "Given y = p/x + q, which graph is a straight line with gradient q and vertical intercept p?",
            options: ["y against x", "xy against x", "y/x against x", "xy against x²"]
        },
        {
            id: 23,
            chapter: 6,
            chapterName: "Linear Law",
            topic: "Gradient and intercept",
            difficulty: "SPM Practice",
            prompt: "The variables x and y satisfy y = a/(x + b). A graph of 1/y against x has gradient 0.25 and vertical intercept 1.5. Find a and b.",
            options: ["a = 4, b = 6", "a = 4, b = 1.5", "a = 0.25, b = 6", "a = 6, b = 4"]
        },
        {
            id: 24,
            chapter: 6,
            chapterName: "Linear Law",
            topic: "Exponential relations",
            difficulty: "Challenge",
            prompt: "For y = ab^x, a graph of log₁₀ y against x has gradient 0.3010 and vertical intercept 0.6990. Find a and b.",
            options: ["a = 2, b = 5", "a = 5, b = 2", "a = 0.6990, b = 0.3010", "a = 10, b = 2"]
        },
        {
            id: 25,
            chapter: 7,
            chapterName: "Coordinate Geometry",
            topic: "Division of a line segment",
            difficulty: "Foundation",
            prompt: "Point P divides the line joining A(-2, 3) and B(8, 13) internally in the ratio AP : PB = 2 : 3. Find P.",
            options: ["(2, 7)", "(4, 8)", "(5, 9)", "(6, 11)"]
        },
        {
            id: 26,
            chapter: 7,
            chapterName: "Coordinate Geometry",
            topic: "Equation of a straight line",
            difficulty: "SPM Practice",
            prompt: "Find the equation of the line passing through (3, 1) and perpendicular to 3x - 2y = 6.",
            options: ["2x + 3y = 9", "3x + 2y = 11", "2x - 3y = 3", "3x - 2y = 7"]
        },
        {
            id: 27,
            chapter: 7,
            chapterName: "Coordinate Geometry",
            topic: "Area of a polygon",
            difficulty: "SPM Practice",
            prompt: "Find the area of the triangle with vertices (0, 0), (6, 0) and (2, 5).",
            options: ["10 square units", "12 square units", "15 square units", "30 square units"]
        },
        {
            id: 28,
            chapter: 7,
            chapterName: "Coordinate Geometry",
            topic: "Locus",
            difficulty: "Challenge",
            prompt: "A moving point P(x, y) is equidistant from A(2, -1) and B(8, 3). Find the equation of its locus.",
            options: ["3x + 2y - 17 = 0", "2x + 3y - 17 = 0", "3x - 2y - 17 = 0", "x + y - 6 = 0"]
        },
        {
            id: 29,
            chapter: 8,
            chapterName: "Vectors",
            topic: "Magnitude of a vector",
            difficulty: "Foundation",
            prompt: "Find the magnitude of the vector 6i - 8j.",
            options: ["2", "7", "10", "14"]
        },
        {
            id: 30,
            chapter: 8,
            chapterName: "Vectors",
            topic: "Unit vectors",
            difficulty: "SPM Practice",
            prompt: "Find the unit vector in the direction of 3i + 4j.",
            options: ["3i + 4j", "(3/4)i + j", "(3/5)i + (4/5)j", "(4/5)i + (3/5)j"]
        },
        {
            id: 31,
            chapter: 8,
            chapterName: "Vectors",
            topic: "Vector operations",
            difficulty: "SPM Practice",
            prompt: "Given a = 2i - j and b = i + 3j, find 2a - b.",
            options: ["3i - 5j", "3i + j", "5i - j", "i - 7j"]
        },
        {
            id: 32,
            chapter: 8,
            chapterName: "Vectors",
            topic: "Position vectors",
            difficulty: "Challenge",
            prompt: "The position vectors of A and B are a and b respectively. Point P divides AB internally such that AP : PB = 2 : 1. Which expression represents OP?",
            options: ["(2a + b)/3", "(a + 2b)/3", "2a - b", "(a + b)/2"]
        },
        {
            id: 33,
            chapter: 9,
            chapterName: "Solution of Triangles",
            topic: "Sine rule",
            difficulty: "Foundation",
            prompt: "In triangle ABC, A = 30°, B = 45° and side a = 8 cm. Find side b.",
            options: ["4√2 cm", "8 cm", "8√2 cm", "16 cm"]
        },
        {
            id: 34,
            chapter: 9,
            chapterName: "Solution of Triangles",
            topic: "Cosine rule",
            difficulty: "SPM Practice",
            prompt: "Two sides of a triangle are 5 cm and 7 cm, and their included angle is 60°. Find the length of the third side.",
            options: ["√39 cm", "√49 cm", "√59 cm", "6 cm"]
        },
        {
            id: 35,
            chapter: 9,
            chapterName: "Solution of Triangles",
            topic: "Area of a triangle",
            difficulty: "SPM Practice",
            prompt: "Find the area of a triangle with two sides 10 cm and 12 cm and included angle 30°.",
            options: ["24 cm²", "30 cm²", "60 cm²", "120 cm²"]
        },
        {
            id: 36,
            chapter: 9,
            chapterName: "Solution of Triangles",
            topic: "Ambiguous case",
            difficulty: "Challenge",
            prompt: "In triangle ABC, A = 30°, a = 6 cm and b = 10 cm. How many different triangles satisfy these measurements?",
            options: ["No triangle", "One triangle", "Two triangles", "Infinitely many triangles"]
        },
        {
            id: 37,
            chapter: 10,
            chapterName: "Index Numbers",
            topic: "Price index",
            difficulty: "Foundation",
            prompt: "The price of an item rises from RM80 in the base year to RM92 in the current year. Find its price index.",
            options: ["112", "115", "120", "125"]
        },
        {
            id: 38,
            chapter: 10,
            chapterName: "Index Numbers",
            topic: "Interpreting an index",
            difficulty: "SPM Practice",
            prompt: "The price index of a product is 125, based on a price of RM48. Find its current price.",
            options: ["RM50", "RM58", "RM60", "RM72"]
        },
        {
            id: 39,
            chapter: 10,
            chapterName: "Index Numbers",
            topic: "Composite index",
            difficulty: "SPM Practice",
            prompt: "Three items have index numbers 110, 95 and 120 with respective weights 3, 2 and 5. Find the composite index.",
            options: ["108", "110", "112", "115"]
        },
        {
            id: 40,
            chapter: 10,
            chapterName: "Index Numbers",
            topic: "Application of composite index",
            difficulty: "Challenge",
            prompt: "A family's composite cost-of-living index is 108. If its total monthly expenditure in the base year was RM2,500, estimate the corresponding current monthly expenditure.",
            options: ["RM2,580", "RM2,650", "RM2,700", "RM2,750"]
        }
    ];
})();
