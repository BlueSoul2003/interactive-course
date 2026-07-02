import re
import json

def update_revision(file_path, new_vocab):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Inject new vocabData
    vocab_js = "const vocabData = " + json.dumps(new_vocab, ensure_ascii=False, indent=4) + ";"
    content = re.sub(r'const\s+vocabData\s*=\s*\[.*?\n\s*\];', vocab_js, content, flags=re.DOTALL)

    # 2. Improve the "wrong answer" logic
    # Find the selectAnswer function
    old_wrong_logic = '''            } else {
                playWrong();
                btn.classList.add('wrong', 'shake-anim');
                // Highlight correct one
                allBtns.forEach(b => {
                    if (b.innerText === targetZh) b.classList.add('correct');
                });
            }

            setTimeout(() => {
                currentQIndex++;'''
                
    new_wrong_logic = '''            } else {
                playWrong();
                btn.classList.add('wrong', 'shake-anim');
                // Highlight correct one
                allBtns.forEach(b => {
                    if (b.innerText === targetZh) b.classList.add('correct');
                });
                
                // Show a clear message so they know the correct answer
                const qc = document.getElementById('question-container');
                const feedback = document.createElement('div');
                feedback.className = 'mt-4 text-xl md:text-2xl font-black text-red-600 bg-red-100 px-6 py-3 rounded-xl w-full text-center pop-anim';
                feedback.innerHTML = ❌ Wrong! The correct answer is:<br><span class="text-green-700 text-3xl mt-2 block"></span>;
                qc.insertBefore(feedback, document.getElementById('options-container'));
            }

            // Give them 3 seconds to read the correct answer if they got it wrong, else 1 second
            setTimeout(() => {
                // remove feedback if exists
                const fb = document.querySelector('#question-container > div.bg-red-100');
                if (fb) fb.remove();
                
                currentQIndex++;'''
    
    if "if (b.innerText === targetZh) b.classList.add('correct');" in content:
        content = content.replace(old_wrong_logic, new_wrong_logic)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)


# --- Revision 1 Vocab (Bucket A - Short) ---
vocab1 = [
    [
        {"en": "I am hungry.", "zh": "我很饿"},
        {"en": "it is raining.", "zh": "正在下雨"},
        {"en": "I like apples.", "zh": "我喜欢苹果"},
        {"en": "I am running.", "zh": "我在跑步"},
        {"en": "he is happy.", "zh": "他很开心"},
        {"en": "He is a baby.", "zh": "他是个宝宝"},
        {"en": "it is morning.", "zh": "现在是早上"},
        {"en": "I like to play.", "zh": "我喜欢玩"},
        {"en": "I am very tired.", "zh": "我非常累"},
        {"en": "I feel hot.", "zh": "我觉得热"}
    ],
    [
        {"en": "I felt very cold.", "zh": "我感觉很冷"},
        {"en": "I am a student.", "zh": "我是一名学生"},
        {"en": "I felt angry.", "zh": "我感到生气"},
        {"en": "I feel sad.", "zh": "我感到伤心"},
        {"en": "I felt very happy.", "zh": "我感到非常开心"},
        {"en": "I felt scared.", "zh": "我感到害怕"},
        {"en": "I felt thirsty.", "zh": "我感到口渴"},
        {"en": "I feel sleepy.", "zh": "我感到困了"},
        {"en": "to panic", "zh": "恐慌"},
        {"en": "Hang in there!", "zh": "坚持住！"}
    ],
    [
        {"en": "Think about it.", "zh": "考虑一下吧。"},
        {"en": "To express relief", "zh": "表达如释重负"},
        {"en": "To express disgust", "zh": "表达厌恶或恶心"},
        {"en": "To express congratulations", "zh": "表达祝贺"},
        {"en": "To express alarm", "zh": "表达惊恐"},
        {"en": "An expression of appreciation", "zh": "表达欣赏"},
        {"en": "the writer and his family", "zh": "作者和他的家人"},
        {"en": "a shipwreck", "zh": "海难"},
        {"en": "build a tree house", "zh": "建一座树屋"},
        {"en": "run out of food", "zh": "吃光了食物"}
    ],
    [
        {"en": "vegetable patch", "zh": "菜地"},
        {"en": "a clearing in the forest", "zh": "森林空地"},
        {"en": "sailing nearby", "zh": "附近航行"},
        {"en": "calculate the risks", "zh": "计算风险"},
        {"en": "become calm", "zh": "冷静下来"},
        {"en": "think more clearly", "zh": "想得更清楚"},
        {"en": "building a fire at night", "zh": "晚上生火"},
        {"en": "unwanted guests", "zh": "不速之客"},
        {"en": "food supply", "zh": "食物供应"},
        {"en": "four feelings", "zh": "四种感受"}
    ]
]

# --- Revision 2 Vocab (Bucket B - Long) ---
vocab2 = [
    [
        {"en": "Because I am hungry.", "zh": "因为我很饿。"},
        {"en": "Because it is raining.", "zh": "因为正在下雨。"},
        {"en": "Because I am a boy.", "zh": "因为我是个男孩。"},
        {"en": "Because I am late for school.", "zh": "因为我上学迟到了。"},
        {"en": "Because he is hungry.", "zh": "因为他饿了。"},
        {"en": "Because he is happy.", "zh": "因为他很开心。"},
        {"en": "Because it is morning.", "zh": "因为现在是早上。"},
        {"en": "Because I like to play.", "zh": "因为我喜欢玩。"},
        {"en": "Because I am very tired.", "zh": "因为我非常累。"},
        {"en": "I don't see it the way he does.", "zh": "我和他的看法不同。"}
    ],
    [
        {"en": "I can't make it to the party.", "zh": "我去不了派对了。"},
        {"en": "You got an A! Great job!", "zh": "你得了个A！干得好！"},
        {"en": "Call me anytime you need help.", "zh": "需要帮忙随时打给我。"},
        {"en": "Let me know if you're coming.", "zh": "告诉我你来不来。"},
        {"en": "Come visit us when you can!", "zh": "有空就来看看我们吧！"},
        {"en": "Why is there no 'd' in 'didn't use to'?", "zh": "为什么'use'没有'd'？"},
        {"en": "Because 'didn't' already stole the past tense!", "zh": "因为'didn't'已经把过去式'偷'走了！"},
        {"en": "The writer and his family were involved in a shipwreck.", "zh": "作者和他的家人遭遇了海难。"},
        {"en": "The writer's father and brother were able to build a tree house.", "zh": "作者的父亲和兄弟建了一座树屋。"},
        {"en": "The family found a vegetable patch near a clearing.", "zh": "这家人在森林空地附近发现了一块菜地。"}
    ],
    [
        {"en": "The family kept a lookout for ships sailing nearby.", "zh": "作者和他的家人一直留意附近航行的船只。"},
        {"en": "to make an effort to become calm and think more clearly", "zh": "努力冷静下来，想得更清楚"},
        {"en": "List two purposes of building a fire at night.", "zh": "列出晚上生火的两个目的。"},
        {"en": "Who do you think were the unwanted guests?", "zh": "你认为“不速之客”是谁？"},
        {"en": "List four feelings that the writer and his family may have felt.", "zh": "列出作者和他的家人可能有的四种感受。"},
        {"en": "Build meaningful compound sentences using the words provided.", "zh": "用提供的单词拼出有意义的复合句。"},
        {"en": "Choose the correct Informal equivalent for each Formal statement.", "zh": "为每个正式句子选择正确的非正式对应句。"},
        {"en": "Match the interjection to the emotion it represents.", "zh": "将感叹词与其代表的情感进行匹配。"},
        {"en": "A reaction to something cute or sweet.", "zh": "对可爱或甜蜜事物的反应。"},
        {"en": "For fear or concern which isn't serious.", "zh": "表示不太严重的恐惧或担忧。"}
    ],
    [
        {"en": "An expression of appreciation for food.", "zh": "表达对食物的欣赏。"},
        {"en": "To show that one is impressed or amazed.", "zh": "表示印象深刻或惊叹。"},
        {"en": "Why are you wearing a raincoat?", "zh": "为什么你穿着雨衣？"},
        {"en": "Why are you running?", "zh": "为什么你在跑步？"},
        {"en": "Why is the baby crying?", "zh": "为什么宝宝在哭？"},
        {"en": "Why are you going to bed early?", "zh": "为什么你这么早睡觉？"},
        {"en": "Click the words in the correct order to build the sentence.", "zh": "根据目标句意，按正确顺序点击单词拼出句子。"},
        {"en": "The family had run out of food.", "zh": "这家人吃光了食物。"},
        {"en": "To express congratulations or happiness.", "zh": "表达祝贺或开心。"},
        {"en": "I felt very cold.", "zh": "我感觉很冷。"}
    ]
]

update_revision('content/KSSR_Syllabus/Primary6/English/Revision1/index.html', vocab1)
update_revision('content/KSSR_Syllabus/Primary6/English/Revision2/index.html', vocab2)
print("Updated Revisions with authentic content and improved feedback logic!")

# Now change the set timeout delay from 1000 to 3000 conditionally.
# I will use re to do it explicitly to avoid missing it.
def update_timeout(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    content = content.replace("}, 1000);", "}, isCorrect ? 1000 : 3000);")
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

update_timeout('content/KSSR_Syllabus/Primary6/English/Revision1/index.html')
update_timeout('content/KSSR_Syllabus/Primary6/English/Revision2/index.html')

print("Applied timeout changes.")
