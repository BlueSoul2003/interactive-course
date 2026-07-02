const vocabData = [
    [
        {"en": "I am hungry.", "zh": "我很饿"}
    ],
    [
        {"en": "to panic", "zh": "恐慌"}
    ]
];

let allZh = vocabData.flat().map(w => w.zh);
console.log(allZh);
